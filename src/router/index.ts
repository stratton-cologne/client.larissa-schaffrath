// src/router/index.ts
import { createRouter, createWebHistory } from "vue-router";

const Impressum = () => import("@/views/Impressum.vue");
const Datenschutz = () => import("@/views/Datenschutz.vue");

export const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: "/impressum",
            name: "Impressum",
            component: Impressum,
            meta: { title: "Impressum", indexable: true },
        },
        {
            path: "/datenschutz",
            name: "Datenschutz",
            component: Datenschutz,
            meta: { title: "Datenschutz", indexable: true },
        },
    ],
});

// Optional: Titel setzen (du hast ggf. schon eine afterEach-Logik)
router.afterEach((to) => {
    const base = "Larissa Schaffrath";
    const title =
        (to.meta?.title as string) ??
        (typeof to.name === "string" ? to.name : base);
    document.title = `${title} · ${base}`;
});
