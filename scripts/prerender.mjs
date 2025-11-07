// scripts/prerender.mjs
import { chromium } from "playwright";
import { createServer } from "http";
import sirv from "sirv";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DIST = path.resolve(__dirname, "../dist");
const OUT = DIST; // HTML direkt in dist schreiben
const PORT = 5055;

// Routen, die wir statisch rendern wollen:
const ROUTES = ["/", "/impressum", "/datenschutz"];

// Hilfsfunktion: schreibt HTML in Datei (z.B. /impressum → dist/impressum/index.html)
async function writeHtmlForRoute(route, html) {
    const targetDir =
        route === "/" ? OUT : path.join(OUT, route.replace(/^\//, ""), "/");
    const file =
        route === "/"
            ? path.join(targetDir, "index.html")
            : path.join(targetDir, "index.html");
    await fs.mkdir(targetDir, { recursive: true });
    await fs.writeFile(file, html, "utf8");
    console.log(`✔ prerendered ${route} → ${path.relative(OUT, file)}`);
}

async function main() {
    // 1) Static Server über dist
    const serve = sirv(DIST, { etag: true, single: true });
    const server = createServer((req, res) => serve(req, res));
    await new Promise((r) => server.listen(PORT, r));
    const base = `http://127.0.0.1:${PORT}`;

    // 2) Browser
    const browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();

    // 3) jede Route besuchen → DOM → HTML snapshot
    for (const route of ROUTES) {
        const url = `${base}${route}`;
        await page.goto(url, { waitUntil: "networkidle" });

        // kleine Wartezeit, falls Head-Updates async sind
        await page.waitForTimeout(50);

        // HTML aus dem <html> Element (inkl. <head> + <body>)
        const html = await page.content();
        await writeHtmlForRoute(route, html);
    }

    await browser.close();
    server.close();
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
