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
import { onMounted } from 'vue'
import LegalOverlay from '@/components/LegalOverlay.vue'

// Basis-SEO: Fallback falls @unhead/vue nicht verwendet wird
onMounted(() => {
    document.title = 'Impressum · Larissa Schaffrath'
    ensureMeta('description', 'Impressum von Larissa Schaffrath – Anbieterkennzeichnung und Kontakt.')
    ensureLinkRel('canonical', new URL('/impressum', location.origin).toString())
})

function ensureMeta(name: string, content: string) {
    let el = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null
    if (!el) {
        el = document.createElement('meta')
        el.setAttribute('name', name)
        document.head.appendChild(el)
    }
    el.setAttribute('content', content)
}
function ensureLinkRel(rel: string, href: string) {
    let el = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null
    if (!el) {
        el = document.createElement('link')
        el.setAttribute('rel', rel)
        document.head.appendChild(el)
    }
    el.setAttribute('href', href)
}
</script>
