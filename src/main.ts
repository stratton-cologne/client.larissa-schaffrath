import { createApp } from "vue";
import { setupAnalytics } from "./lib/analytics";

import "@/assets/style.css";

import App from "./App.vue";
import { i18n } from "./i18n";
import { router } from "./router";

const app = createApp(App);

app.use(i18n);
app.use(router);

setupAnalytics();

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
