// src/lib/seo.ts
export type SeoEnv = {
    siteName: string;
    siteUrl: string; // ohne Slash am Ende
    defaultOgImage?: string | null;
};

/** Liest .env-Variablen und setzt sinnvolle Fallbacks (funktioniert auch beim Prerendern). */
export function getSeoEnv(): SeoEnv {
    const env = (import.meta as any).env ?? {};
    const siteName = String(env.VITE_SITE_NAME || "Website");
    const siteUrl = String(
        env.VITE_SITE_URL ||
            (typeof window !== "undefined"
                ? window.location.origin
                : "https://example.com"),
    ).replace(/\/$/, "");
    const defaultOgImage = env.VITE_DEFAULT_OG_IMAGE
        ? String(env.VITE_DEFAULT_OG_IMAGE)
        : null;
    return { siteName, siteUrl, defaultOgImage };
}

/** Baut aus einem relativen Pfad eine absolute URL. */
export function absoluteUrl(path: string): string {
    const { siteUrl } = getSeoEnv();
    if (!path) return siteUrl + "/";
    if (/^https?:\/\//i.test(path)) return path;
    return `${siteUrl}${path.startsWith("/") ? "" : "/"}${path}`;
}

/** Hilfsfunktion: Breadcrumb-JSON-LD (Start -> aktuelle Seite) */
export function breadcrumbJsonLd(currentName: string, currentUrl: string) {
    const { siteUrl } = getSeoEnv();
    return {
        "@type": "BreadcrumbList",
        itemListElement: [
            {
                "@type": "ListItem",
                position: 1,
                name: "Start",
                item: siteUrl + "/",
            },
            {
                "@type": "ListItem",
                position: 2,
                name: currentName,
                item: currentUrl,
            },
        ],
    };
}

/** WebPage-JSON-LD */
export function webPageJsonLd(params: {
    title: string;
    url: string;
    description?: string;
}) {
    const { siteName, siteUrl } = getSeoEnv();
    return {
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: `${params.title} · ${siteName}`,
        url: params.url,
        description: params.description,
        isPartOf: { "@type": "WebSite", name: siteName, url: siteUrl },
        breadcrumb: breadcrumbJsonLd(params.title, params.url),
    };
}
