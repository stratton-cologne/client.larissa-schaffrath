import type { CookieConsentConfig } from "@stratton-cologne/cookie-consent";

export const consentConfig: CookieConsentConfig = {
    version: "1.0.0", // bei inhaltlichen Änderungen erhöhen
    categories: [
        {
            id: "essential",
            label: "Erforderlich",
            description: "Grundfunktionen",
            required: true,
        },
        {
            id: "analytics",
            label: "Analyse",
            description: "anonyme Nutzungsstatistik",
            default: false,
        },
        {
            id: "marketing",
            label: "Marketing",
            description: "personalisierte Inhalte",
        },
    ],
    scripts: [
        {
            id: "gtm",
            category: "analytics",
            src: "https://www.googletagmanager.com/gtm.js?id=GTM-XXXX",
            async: true,
        },
        {
            id: "ads",
            category: "marketing",
            src: "/scripts/ads.js",
            defer: true,
        },
    ],
};
