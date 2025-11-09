// src/lib/api.ts
// Minimaler API-Client für öffentliche Endpunkte (Proxy- & ENV-freundlich)

import type {
    ClientSettingsDto,
    PortfolioDto,
    ContactDto,
    GalleryItem,
    GalleryShowResponse,
    LegalPageDto,
} from "@/types";

/**
 * ENV-Strategie:
 * - DEV (direkter Backend-Call): VITE_API_BASE_URL="http://localhost:8000"
 * - PROD:                         VITE_API_BASE_URL="http://api.schaffrath.stratton.cologne"
 * - DEV (über Vite-Proxy):       VITE_API_BASE_URL=""  (leer lassen) → gleiche Origin, Proxy mappt /api
 *
 * Fallback ist window.location.origin (nützlich beim Proxy).
 */
const RAW_BASE =
    (import.meta as any).env?.VITE_API_BASE_URL ??
    (typeof window !== "undefined" ? window.location.origin : "");

// Einmalige Definition des API-Prefixes
const API_PREFIX = "/api";

/** Trailing/leading Slashes bereinigen */
function trimEndSlash(s: string) {
    return s.replace(/\/+$/, "");
}
function trimStartSlash(s: string) {
    return s.replace(/^\/+/, "");
}

/**
 * Baut eine gültige API-URL, garantiert **genau ein** '/api' in der Mitte.
 * `endpoint` wird ohne führenden Slash erwartet (z. B. "client-settings", "galleries?published=1").
 */
function buildApiUrl(endpoint: string): string {
    const base = trimEndSlash(RAW_BASE || "");
    const cleanEndpoint = trimStartSlash(endpoint);

    // Prüfen, ob base bereits mit /api endet
    const baseHasApi = /\/api$/i.test(base);

    // Wenn base leer ist (Proxy), Prefix bleibt als relativer Pfad "/api"
    if (!base) return `${API_PREFIX}/${cleanEndpoint}`;

    // Wenn base bereits /api hat → kein weiteres /api
    if (baseHasApi) return `${base}/${cleanEndpoint}`;

    // Sonst genau ein /api einfügen
    return `${base}${API_PREFIX}/${cleanEndpoint}`;
}

type Json = Record<string, unknown> | unknown[];

async function get<T = unknown>(
    endpoint: string,
    init?: RequestInit,
): Promise<T> {
    const url = buildApiUrl(endpoint);
    const res = await fetch(url, {
        method: "GET",
        headers: { Accept: "application/json" },
        // credentials: "include", // nur falls Cookies/Sanctum benötigt
        ...init,
    });
    if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`GET ${url} failed: ${res.status} ${text}`);
    }
    return (await res.json()) as T;
}

async function post<T = unknown>(
    endpoint: string,
    body?: Json,
    init?: RequestInit,
): Promise<T> {
    const url = buildApiUrl(endpoint);
    const res = await fetch(url, {
        method: "POST",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
        },
        body: body ? JSON.stringify(body) : undefined,
        ...init,
    });
    if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`POST ${url} failed: ${res.status} ${text}`);
    }
    return (await res.json()) as T;
}

/** -------------------------------------------
 * Medien-Helpers
 * ------------------------------------------*/
export function mediaDownloadUrl(mediaId: number, version?: number): string {
    // Achtung: /api/media/:id/download kann im Backend geschützt sein (Auth).
    const v = typeof version === "number" ? `?version=${version}` : "";
    // Wichtig: über denselben URL-Builder (verhindert doppelte /api)
    return buildApiUrl(`media/${mediaId}/download${v}`);
}

/** -------- Hintergrund-Normalisierung -------- */
export type NormalizedBackground =
    | { kind: "video"; src: string; overlay?: string }
    | {
          kind: "image";
          src: string;
          fit?: string;
          position?: string;
          overlay?: string;
      }
    | null;

export function isVideoBackground(
    bg: ClientSettingsDto["background"] | null | undefined,
): boolean {
    return !!bg && bg.type === "video";
}

export function isImageBackground(
    bg: ClientSettingsDto["background"] | null | undefined,
): boolean {
    return !!bg && bg.type === "image";
}

/** Liefert die eigentliche URL, egal ob per url oder media_id */
export function backgroundMediaSrc(
    bg: ClientSettingsDto["background"] | null | undefined,
): string | null {
    if (!bg) return null;
    if (bg.url) return bg.url; // absolute/relative URL aus dem Backend übernehmen
    if (bg.media_id) return mediaDownloadUrl(bg.media_id);
    return null;
}

/** Einfache API: Gibt ein NormalizedBackground zurück */
export function normalizeBackground(
    bg: ClientSettingsDto["background"] | null | undefined,
): NormalizedBackground {
    if (!bg || bg.type === "none") return null;
    const src = backgroundMediaSrc(bg);
    if (!src) return null;

    if (bg.type === "video") {
        return { kind: "video", src, overlay: bg.overlay || undefined };
    }
    return {
        kind: "image",
        src,
        fit: bg.fit || undefined,
        position: bg.position || undefined,
        overlay: bg.overlay || undefined,
    };
}

/** Falls du nur Videos brauchst */
export function videoFromClientSettings(
    bg: ClientSettingsDto["background"] | null | undefined,
): string | null {
    const n = normalizeBackground(bg);
    return n && n.kind === "video" ? n.src : null;
}

/** -------------------------------------------
 * Portfolio-Normalisierung (avatarUrl)
 * ------------------------------------------*/
export type PortfolioDtoNormalized = PortfolioDto & {
    /** Direkt benutzbare URL für das Avatarbild */
    avatarUrl: string | null;
};

export function normalizePortfolio(p: PortfolioDto): PortfolioDtoNormalized {
    // Wenn ein Media-Eintrag vorhanden ist, nehmen wir die Download-Route
    const mediaId = p?.avatar?.id ?? null;
    const version = p?.avatar?.currentVersion?.version;
    const avatarUrl =
        typeof mediaId === "number"
            ? mediaDownloadUrl(
                  mediaId,
                  typeof version === "number" ? version : undefined,
              )
            : null;

    return { ...p, avatarUrl };
}

/** -------------------------------------------
 * Öffentliche API-Methoden
 * ------------------------------------------*/
export const api = {
    // ⚠︎ Endpunkte OHNE führendes "/api" übergeben!
    getClientSettings: () => get<ClientSettingsDto>("client-settings"),

    // Portfolio: GET /api/portfolio -> normalisiert (avatarUrl befüllt)
    getPortfolio: async () => {
        const p = await get<PortfolioDto>("portfolio");
        return normalizePortfolio(p) as PortfolioDtoNormalized;
    },

    // Kontakt: GET /api/contact
    getContact: () => get<ContactDto>("contact"),

    // Alle Galerien (optional gefiltert)
    getGalleries: async (params?: { published?: 0 | 1 }) => {
        const qs =
            params?.published !== undefined
                ? `?published=${params.published}`
                : "";
        return await get<GalleryItem[]>(`galleries${qs}`);
    },

    fetchGalleries: async (params?: { published?: 0 | 1 }) => {
        const qs =
            params?.published !== undefined
                ? `?published=${params.published}`
                : "";
        return await get<GalleryItem[]>(`galleries${qs}`);
    },

    fetchGalleryById: async (id: number) => {
        return await get<GalleryShowResponse>(`galleries/${id}`);
    },

    // Legal Pages: GET /api/legal/:slug
    getLegal: (slug: "impressum" | "datenschutz") =>
        get<LegalPageDto>(`legal/${slug}`),
};
