<template>
    <!-- views/Impressum.vue -->
    <main class="fixed inset-0 min-h-screen min-w-screen overflow-hidden bg-[#1a1a1a] text-white">
        <!-- Dein LegalOverlay-Layout kann als Wrapper dienen -->
        <LegalOverlay slug="impressum">
            <div class="prose prose-invert max-w-none">
                <!-- ====== BEISPIEL-INHALT – ersetze durch deine echten Daten ====== -->
                <p><strong>Angaben gemäß § 5 TMG</strong></p>
                <p>Larissa Schaffrath<br> Musterstraße 1<br> 50968 Köln</p>

                <p><strong>Kontakt</strong><br>
                    Telefon: 0221 / 123456<br>
                    E-Mail: kontakt@example.com
                </p>

                <p><strong>Umsatzsteuer-ID</strong><br>
                    DE123456789
                </p>
            </div>
        </LegalOverlay>
    </main>
</template>

<script setup lang="ts">
/**
 * WICHTIG: KEIN Top-Level-await!
 * Statischer Import verhindert ein asynchrones setup() → keine Suspense-Warnung.
 */
import LegalOverlay from '@/components/LegalOverlay.vue'
import { onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useHead } from '@vueuse/head'
import { getSeoEnv, absoluteUrl, webPageJsonLd } from '@/lib/seo'

const route = useRoute()
const { siteName, defaultOgImage } = getSeoEnv()

const TITLE = 'Impressum'
const DESC = 'Impressum – Anbieterkennzeichnung, Kontakt und Pflichtangaben.'
const PAGE_URL = computed(() => absoluteUrl(route.fullPath || '/impressum'))
const jsonLd = webPageJsonLd({ title: TITLE, url: PAGE_URL.value, description: DESC })

/**
 * useHead direkt verwenden – unhead ist im Projekt installiert.
 * (Paket ist in package.json vorhanden.)
 */
useHead({
    title: `${TITLE} · ${siteName}`,
    link: [
        { rel: 'canonical', href: PAGE_URL.value },
        { rel: 'alternate', hreflang: 'de', href: PAGE_URL.value },
    ],
    meta: [
        { name: 'description', content: DESC },
        { name: 'robots', content: 'index,follow' },

        { property: 'og:title', content: `${TITLE} · ${siteName}` },
        { property: 'og:description', content: DESC },
        { property: 'og:type', content: 'website' },
        { property: 'og:url', content: PAGE_URL.value },
        ...(defaultOgImage ? [{ property: 'og:image', content: defaultOgImage }] : []),

        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: `${TITLE} · ${siteName}` },
        { name: 'twitter:description', content: DESC },
        ...(defaultOgImage ? [{ name: 'twitter:image', content: defaultOgImage }] : []),
    ],
    script: [{ type: 'application/ld+json', children: JSON.stringify(jsonLd) }],
})

/**
 * Falls du Fallback ohne unhead behalten willst, könntest du optional prüfen,
 * aber durch den statischen Import ist das nicht mehr nötig.
 * onMounted bleibt hier nur exemplarisch – kann entfernt werden.
 */
onMounted(() => {
    // optional: weitere clientseitige Hooks
})
</script>
