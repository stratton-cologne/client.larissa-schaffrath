// src/lib/theme.ts
import type { ClientSettingsDto } from "@/types";
import { api, mediaDownloadUrl } from "@/lib/api";

/**
 * Starte das Laden & Anwenden der Client-Settings.
 * Blockiert NICHT das App-Mounting; Styles werden nachgeladen.
 */
export async function initTheme() {
    try {
        const cs = await api.getClientSettings();
        applyClientTheme(cs);
    } catch (e) {
        console.warn("Client settings load failed", e);
    }
}

export function applyClientTheme(cs: ClientSettingsDto) {
    const root = document.documentElement;

    // Farben → CSS-Variablen
    if (cs.primary_color)
        root.style.setProperty("--color-primary", cs.primary_color);
    if (cs.secondary_color)
        root.style.setProperty("--color-secondary", cs.secondary_color);

    // Fonts dynamisch als @font-face injizieren
    const styleId = "dynamic-fonts";
    let styleEl = document.getElementById(styleId) as HTMLStyleElement | null;
    if (!styleEl) {
        styleEl = document.createElement("style");
        styleEl.id = styleId;
        document.head.appendChild(styleEl);
    }

    const rules: string[] = [];

    const addFont = (
        name?: string | null,
        directUrl?: string | null,
        mediaId?: number | null,
    ) => {
        if (!name) return;
        // Quelle priorisieren: url > media_id
        const srcUrl =
            directUrl ??
            (typeof mediaId === "number" ? mediaDownloadUrl(mediaId) : null);

        if (!srcUrl) return;

        // Einfaches Format-Guessing (meist WOFF2/TTF). Server darf jeden Typ liefern;
        // Browser nutzt, was er versteht. font-display: swap = FOUT-freundlich.
        const fmt = srcUrl.endsWith(".woff2")
            ? "woff2"
            : srcUrl.endsWith(".woff")
              ? "woff"
              : "truetype";

        rules.push(
            `
@font-face {
  font-family: '${cssEscape(name)}';
  src: url('${srcUrl}') format('${fmt}');
  font-weight: normal;
  font-style: normal;
  font-display: swap;
}`.trim(),
        );
    };

    addFont(
        cs.primary_font?.name ?? null,
        cs.primary_font?.url ?? null,
        cs.primary_font?.media_id ?? null,
    );
    addFont(
        cs.secondary_font?.name ?? null,
        cs.secondary_font?.url ?? null,
        cs.secondary_font?.media_id ?? null,
    );

    styleEl.textContent = rules.join("\n");

    // Familiennamen in Variablen schreiben (werden von .font-primary / .font-secondary Utilities genutzt)
    if (cs.primary_font?.name)
        root.style.setProperty("--font-primary", cs.primary_font.name);
    if (cs.secondary_font?.name)
        root.style.setProperty("--font-secondary", cs.secondary_font.name);
}

/** Minimales Escaping für font-family Namen im CSS */
function cssEscape(s: string): string {
    return s.replace(/(['"\\])/g, "\\$1");
}
