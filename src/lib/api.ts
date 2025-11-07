// src/lib/api.ts
// Minimaler API-Client für öffentliche Endpunkte (Proxy-freundlich)

import type {
    ClientSettingsDto,
    GalleryItem,
    GalleryShowResponse,
} from "@/types";

const RAW_BASE = (import.meta as any).env?.VITE_API_BASE_URL ?? "";

/**
 * Erlaubt sowohl absolute (http://...) als auch relative (/api) Basen.
 * Bei relativem BASE greift in Dev der Vite-Proxy, in Prod dein Reverse-Proxy/Webserver.
 */
const API_BASE = RAW_BASE.endsWith("/") ? RAW_BASE.slice(0, -1) : RAW_BASE;

type Json = Record<string, unknown> | unknown[];

async function get<T = unknown>(path: string, init?: RequestInit): Promise<T> {
    const url = path.startsWith("/")
        ? `${API_BASE}${path}`
        : `${API_BASE}/${path}`;
    const res = await fetch(url, {
        method: "GET",
        headers: { Accept: "application/json" },
        // credentials nur setzen, wenn du Cookies/Sanctum brauchst:
        // credentials: "include",
        ...init,
    });
    if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`GET ${path} failed: ${res.status} ${text}`);
    }
    return (await res.json()) as T;
}

/** -------------------------------------------
 * Medien-Helpers
 * ------------------------------------------*/
export function mediaDownloadUrl(mediaId: number, version?: number): string {
    // Achtung: /api/media/:id/download ist im Backend evtl. protected (Auth).
    const v = typeof version === "number" ? `?version=${version}` : "";
    // Wichtig: relative URL, damit Proxy greift
    return `${API_BASE}/api/media/${mediaId}/download${v}`;
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
    if (bg.url) return bg.url;
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
 * Öffentliche API-Methoden
 * ------------------------------------------*/
export const api = {
    getClientSettings: () => get<ClientSettingsDto>("/api/client-settings"),

    // alle (Option B vom Controller wäre z.B. ?perPage=all)
    getGalleries: async (params?: { published?: 0 | 1 }) => {
        const url = new URL("/api/galleries", window.location.origin);
        if (params?.published !== undefined)
            url.searchParams.set("published", String(params.published));
        const res = await fetch(url.toString(), {
            headers: { Accept: "application/json" },
        });
        if (!res.ok) throw new Error("Failed to load galleries");
        return (await res.json()) as GalleryItem[]; // bei Paginator ggf. .data nehmen
    },

    fetchGalleries: async (params?: { published?: 0 | 1 }) => {
        const url = new URL("/api/galleries", window.location.origin);
        if (params?.published !== undefined)
            url.searchParams.set("published", String(params.published));
        const res = await fetch(url, {
            headers: { Accept: "application/json" },
        });
        if (!res.ok) throw new Error("Failed to load galleries");
        return (await res.json()) as GalleryItem[];
    },

    fetchGalleryById: async (id: number) => {
        const res = await fetch(
            new URL(`/api/galleries/${id}`, window.location.origin),
            {
                headers: { Accept: "application/json" },
            },
        );
        if (!res.ok) throw new Error("Failed to load gallery");
        return (await res.json()) as GalleryShowResponse;
    },
};
