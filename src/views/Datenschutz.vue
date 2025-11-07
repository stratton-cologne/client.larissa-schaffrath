<template>
    <main class="fixed inset-0 min-h-screen min-w-screen overflow-hidden bg-[#1a1a1a] text-white">
        <LegalOverlay slug="datenschutz">
            <div class="prose prose-invert max-w-none">
                <!-- ====== BEISPIEL-INHALT – ersetze durch deine echten Daten ====== -->
                <p>Wir freuen uns über Ihr Interesse an unserer Website. Der Schutz Ihrer personenbezogenen Daten ist
                    uns wichtig.</p>

                <h2>1. Verantwortlicher</h2>
                <p>Larissa Schaffrath, Musterstraße 1, 50968 Köln</p>

                <h2>2. Server-Logs</h2>
                <p>Beim Aufruf werden automatisch Informationen erfasst (z. B. IP-Adresse, Zeitpunkt).</p>

                <h2>3. Kontakt</h2>
                <p>Bei Kontaktaufnahme verarbeiten wir die Angaben zur Bearbeitung der Anfrage.</p>

                <h2>4. Rechte</h2>
                <p>Sie haben das Recht auf Auskunft, Berichtigung, Löschung etc.</p>
                <!-- =============================================================== -->
            </div>
        </LegalOverlay>
    </main>
</template>

<script setup lang="ts">
/**
 * Wie oben: KEIN Top-Level-await; statischer Import von useHead.
 */
import LegalOverlay from '@/components/LegalOverlay.vue'
import { onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useHead } from '@vueuse/head'
import { getSeoEnv, absoluteUrl, webPageJsonLd } from '@/lib/seo'

const route = useRoute()
const { siteName, defaultOgImage } = getSeoEnv()

const TITLE = 'Datenschutz'
const DESC = 'Datenschutzerklärung – Informationen zur Verarbeitung personenbezogener Daten.'
const PAGE_URL = computed(() => absoluteUrl(route.fullPath || '/datenschutz'))
const jsonLd = webPageJsonLd({ title: TITLE, url: PAGE_URL.value, description: DESC })

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

onMounted(() => {
    // optional: weitere clientseitige Hooks
})
</script>
