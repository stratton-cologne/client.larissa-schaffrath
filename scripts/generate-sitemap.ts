// scripts/generate-sitemap.ts
import { writeFileSync } from "node:fs";
import { SitemapStream, streamToPromise } from "sitemap";
import { createWriteStream } from "node:fs";
import { resolve } from "node:path";

async function run() {
    const hostname = process.env.SITE_URL || "https://deine-domain.tld";
    const smStream = new SitemapStream({ hostname });

    // fixe Routen
    smStream.write({ url: "/", changefreq: "weekly", priority: 0.8 });
    smStream.write({ url: "/impressum", changefreq: "monthly", priority: 0.6 });
    smStream.write({
        url: "/datenschutz",
        changefreq: "monthly",
        priority: 0.6,
    });

    smStream.end();
    const data = await streamToPromise(smStream);
    const outPath = resolve(process.cwd(), "dist", "sitemap.xml");
    writeFileSync(outPath, data.toString());
    console.log("sitemap.xml written:", outPath);
}

run().catch((e) => {
    console.error(e);
    process.exit(1);
});
