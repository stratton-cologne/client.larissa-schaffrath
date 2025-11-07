<template>
    <main class="fixed inset-0 min-h-screen min-w-screen overflow-hidden bg-[#1a1a1a] text-white">
        <!-- Dein LegalOverlay-Layout kann als Wrapper dienen -->
        <LegalOverlay slug="datenschutz">
            <div class="prose prose-invert max-w-none">
                <!-- ====== BEISPIEL-INHALT – ersetze durch deine echten Daten ====== -->
                <p>Wir freuen uns über Ihr Interesse an unserer Website. Der Schutz Ihrer personenbezogenen Daten
                    ist uns wichtig.</p>

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
import { onMounted } from 'vue'
import LegalOverlay from '@/components/LegalOverlay.vue'

onMounted(() => {
    document.title = 'Datenschutz · Larissa Schaffrath'
    ensureMeta('description', 'Datenschutzerklärung von Larissa Schaffrath – Informationen zum Datenschutz.')
    ensureLinkRel('canonical', new URL('/datenschutz', location.origin).toString())
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
