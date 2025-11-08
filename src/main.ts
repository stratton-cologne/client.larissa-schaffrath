import { createApp } from "vue";
import { setupAnalytics } from "./lib/analytics";
import { createHead } from "@vueuse/head";

import CookieConsentPlugin, {
    useCookieConsent,
} from "@stratton-cologne/cookie-consent";

import { initTheme } from "@/lib/theme";

import "@/assets/style.css";
import "@/assets/theme.css";
import "@/assets/cookie-consent.css";

import App from "./App.vue";
import { i18n } from "./i18n";
import { router } from "./router";

const app = createApp(App);

app.use(i18n);
app.use(router);
app.use(createHead());
app.use(CookieConsentPlugin);
setupAnalytics();

// Client-Theme (Farben/Fonts) anwenden – nicht blocking
initTheme();

app.mount("#app");

// Optional: Hot Module Replacement (HMR) für i18n
if (import.meta.hot) {
    import.meta.hot.accept(["./i18n"], (modules) => {
        const newI18n = modules[0]?.i18n;
        if (newI18n) {
            app.use(newI18n);
        }
    });
}
