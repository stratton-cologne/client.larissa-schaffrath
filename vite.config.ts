import { defineConfig, loadEnv, type Plugin, type PluginOption } from "vite";

import vue from "@vitejs/plugin-vue";
import { fileURLToPath, URL } from "node:url";

import vueDevTools from "vite-plugin-vue-devtools";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), "");
    const isDev = mode === "development";

    const plugins: PluginOption[] = [
        vue(),
        ...(isDev ? [vueDevTools()] : []), // statt .filter(Boolean)
        tailwindcss(),
    ];

    return {
        plugins,
        define: {
            "import.meta.env.VITE_BUILD_TIME": JSON.stringify(
                new Date().toISOString()
            ),
        },
        resolve: {
            alias: {
                "@": fileURLToPath(new URL("./src", import.meta.url)),
                assets: fileURLToPath(new URL("./src/assets", import.meta.url)),
            },
            dedupe: ["vue", "vue-router", "pinia", "vue-i18n"],
        },
        server: {
            host: true,
            port: 5174,
        },
    };
});
