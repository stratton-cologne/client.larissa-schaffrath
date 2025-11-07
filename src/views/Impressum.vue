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
import LegalOverlay from '@/components/LegalOverlay.vue'
import { onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { getSeoEnv, absoluteUrl, webPageJsonLd } from '@/lib/seo'

let useHead: any
try { useHead = (await import('@unhead/vue')).useHead } catch { /* fallback below */ }

const route = useRoute()
const { siteName, defaultOgImage } = getSeoEnv()

const TITLE = 'Impressum'
const DESC = 'Impressum – Anbieterkennzeichnung, Kontakt und Pflichtangaben.'
const PAGE_URL = computed(() => absoluteUrl(route.fullPath || '/impressum'))
const jsonLd = webPageJsonLd({ title: TITLE, url: PAGE_URL.value, description: DESC })

if (useHead) {
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
} else {
    // Fallback ohne @unhead/vue: Head-Tags per DOM-API setzen
    onMounted(() => {
        document.title = `${TITLE} · ${siteName}`
        ensureMeta('description', DESC)
        ensureMeta('robots', 'index,follow')
        ensureOG('og:title', `${TITLE} · ${siteName}`)
        ensureOG('og:description', DESC)
        ensureOG('og:type', 'website')
        ensureOG('og:url', PAGE_URL.value)
        if (defaultOgImage) ensureOG('og:image', defaultOgImage)
        ensureMeta('twitter:card', 'summary_large_image')
        ensureMeta('twitter:title', `${TITLE} · ${siteName}`)
        ensureMeta('twitter:description', DESC)
        if (defaultOgImage) ensureMeta('twitter:image', defaultOgImage)
        ensureLinkRel('canonical', PAGE_URL.value)
        ensureJsonLd(jsonLd)
    })
}

function ensureMeta(name: string, content: string) {
    let el = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null
    if (!el) { el = document.createElement('meta'); el.setAttribute('name', name); document.head.appendChild(el) }
    el.setAttribute('content', content)
}
function ensureOG(property: string, content: string) {
    let el = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement | null
    if (!el) { el = document.createElement('meta'); el.setAttribute('property', property); document.head.appendChild(el) }
    el.setAttribute('content', content)
}
function ensureLinkRel(rel: string, href: string) {
    let el = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null
    if (!el) { el = document.createElement('link'); el.setAttribute('rel', rel); document.head.appendChild(el) }
    el.setAttribute('href', href)
}
function ensureJsonLd(obj: unknown) {
    document.querySelectorAll('script[type="application/ld+json"].__auto')
        .forEach(n => n.parentNode?.removeChild(n))
    const s = document.createElement('script')
    s.type = 'application/ld+json'
    s.className = '__auto'
    s.text = JSON.stringify(obj)
    document.head.appendChild(s)
}
</script>
