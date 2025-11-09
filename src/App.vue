<template>
    <!-- Language Switcher bleibt global sichtbar -->
    <LanguageSwitcher />

    <!-- Cookie Banner -->
    <CookieConsent v-model="showBanner" :config="consentConfig" data-cc="banner" title="Cookies & Datenschutz"
        description="Wir verwenden Cookies für Grundfunktionen und zur Verbesserung unseres Angebots."
        policyHref="/datenschutz" @saved="onSaved" />

    <div class="app-root bg-[#1a1a1a]">
        <!-- Perspektive MUSS auf dem Parent liegen (3D-Effekt für Home-Tilt) -->
        <div class="stage">
            <HomeView :tilted="tilted" :scaled="scaled" @tilt-end="onHomeTransformEnd" @aboutClick="openAbout"
                @contactClick="openContact" @categoryClick="handleCategoryClick" />
        </div>

        <!-- ================= ABOUT: von LINKS rein/raus ================= -->
        <div class="about-sheet" :class="{ 'is-open': isAboutOpen }" @transitionend="onAboutTransitionEnd" role="dialog"
            aria-modal="true">
            <AboutOverlay v-if="portfolio" :portfolio="portfolio" :is-visible="isAboutOpen" @close="closeAbout" />
        </div>

        <!-- ================= CONTACT: von RECHTS rein/raus ================= -->
        <div class="contact-sheet" :class="{ 'is-open': isContactOpen }" @transitionend="onContactTransitionEnd"
            role="dialog" aria-modal="true">
            <ContactOverlay v-if="contact" :contact="contact" :is-visible="isContactOpen" @close="closeContact" />
        </div>

        <!-- ================= GALLERY: von UNTEN rein/raus ================= -->
        <div class="gallery-sheet" :class="{ 'is-open': isGalleryOpen }" @transitionend="onGalleryTransitionEnd"
            role="dialog" aria-modal="true">
            <GalleryView v-if="activeGallery" :gallery="activeGallery" @close="closeGallery" />
        </div>

        <!-- ✨ HIER: Router-Inhalt (Impressum/Datenschutz) rendern -->
        <RouterView />

        <!-- ... in App.vue, direkt innerhalb der <div class="app-root ...">, NACH den Sheets -->
        <footer class="pointer-events-auto fixed bottom-4 left-4 z-10 flex gap-4 text-sm text-white/70"
            aria-label="Rechtliches">
            <RouterLink to="/impressum" class="underline hover:text-white transition-colors">Impressum</RouterLink>
            <span aria-hidden="true">·</span>
            <RouterLink to="/datenschutz" class="underline hover:text-white transition-colors">Datenschutz</RouterLink>
            <span aria-hidden="true">·</span>
            <button type="button" @click="openCookieEditor">
                Cookie-Einstellungen
            </button>
        </footer>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import { CookieConsent, useCookieConsent } from "@stratton-cologne/cookie-consent";
import { openConsentEditor } from "@stratton-cologne/cookie-consent";
import { consentConfig } from "@/consentConfig";

import LanguageSwitcher from '@/components/ui/LanguageSwitcher.vue'
import HomeView from '@/views/Home.vue'
import GalleryView from '@/views/Gallery.vue'
import AboutOverlay from '@/views/About.vue'
import ContactOverlay from '@/views/Contact.vue'

const showBanner = ref(true);

function onSaved(map: Record<string, boolean>) {
    console.log("Consent gespeichert:", map);
}

function openCookieEditor() {
    openConsentEditor();
}

import { api } from '@/lib/api'
import type { PortfolioDto, ContactDto, GalleryShowResponse } from '@/types'

/** =================== Phase A – Home-States =================== */
const tilted = ref(false)  // Home kippt (für Gallery)
const scaled = ref(false)  // Home skaliert (für About/Contact)

/** =================== Phase B – Overlay Sichtbarkeit =================== */
const isGalleryOpen = ref(false)
const isAboutOpen = ref(false)
const isContactOpen = ref(false)

/** =================== Gallery-States =================== */
const pendingGalleryId = ref<number | null>(null)
const activeGallery = ref<GalleryShowResponse | null>(null)

/** =================== About-/Contact-Daten =================== */
const portfolio = ref<PortfolioDto | null>(null)
const contact = ref<ContactDto | null>(null)

/** =================== Pending-Aktion =================== */
/**
 * Merkt, welche Aktion nach Ende der Home-Transition ausgeführt wird:
 *  - 'gallery' → Gallery-Sheet
 *  - 'about'   → About-Sheet
 *  - 'contact' → Contact-Sheet
 */
const pendingAction = ref<null | 'gallery' | 'about' | 'contact'>(null)

/** =================== Events aus HomeView =================== */
async function handleCategoryClick(id: number | string) {
    pendingGalleryId.value = Number(id)
    pendingAction.value = 'gallery'
    tilted.value = true                 // Phase A: Home kippt
}

async function openAbout() {
    pendingAction.value = 'about'
    scaled.value = true                 // Phase A: Home skaliert

    // Daten für About laden
    try {
        portfolio.value = await api.getPortfolio()
    } catch (e) {
        console.warn('Failed to fetch portfolio', e)
        portfolio.value = null            // v-if verhindert leeres Overlay
    }
}

async function openContact() {
    pendingAction.value = 'contact'
    scaled.value = true                 // Phase A: Home skaliert

    // Daten für Contact laden
    try {
        contact.value = await api.getContact()
    } catch (e) {
        console.warn('Failed to fetch contact', e)
        contact.value = null
    }
}

/** =================== Phase A → B Umschalten =================== */
async function onHomeTransformEnd() {
    // Gallery nach Tilt öffnen
    if (pendingAction.value === 'gallery' && pendingGalleryId.value != null) {
        try {
            activeGallery.value = await api.fetchGalleryById(pendingGalleryId.value)
            isGalleryOpen.value = true
        } catch (e) {
            console.warn('Failed to fetch gallery', e)
            tilted.value = false
        } finally {
            pendingAction.value = null
        }
        return
    }

    // About nach Scale öffnen
    if (pendingAction.value === 'about') {
        isAboutOpen.value = true
        pendingAction.value = null
        return
    }

    // Contact nach Scale öffnen
    if (pendingAction.value === 'contact') {
        isContactOpen.value = true
        pendingAction.value = null
        return
    }
}

/** =================== Gallery schließen =================== */
function closeGallery() {
    isGalleryOpen.value = false
}
function onGalleryTransitionEnd(e: TransitionEvent) {
    if (e.propertyName !== 'transform') return
    if (!isGalleryOpen.value) {
        tilted.value = false
        activeGallery.value = null
        pendingGalleryId.value = null
    }
}

/** =================== About schließen =================== */
function closeAbout() {
    isAboutOpen.value = false
}
function onAboutTransitionEnd(e: TransitionEvent) {
    if (e.propertyName !== 'transform') return
    if (!isAboutOpen.value) {
        scaled.value = false
    }
}

/** =================== Contact schließen =================== */
function closeContact() {
    isContactOpen.value = false
}
function onContactTransitionEnd(e: TransitionEvent) {
    if (e.propertyName !== 'transform') return
    if (!isContactOpen.value) {
        scaled.value = false
    }
}
</script>

<style scoped>
.app-root {
    position: relative;
    min-height: 100vh;
    overflow: clip;
}

/* Perspektive auf dem Parent (für echtes 3D beim Home-Tilt) */
.stage {
    perspective: 1200px;
    perspective-origin: 50% 100%;
}

/* ============ ABOUT (von links) ============ */
.about-sheet {
    position: fixed;
    inset: 0;
    z-index: 40;
    display: flex;
    align-items: stretch;
    pointer-events: none;
    /* deaktiviert, solange offscreen */
    transform: translateX(-100%);
    /* offscreen links */
    transition: transform 300ms ease;
    /* rein/raus Dauer */
}

.about-sheet.is-open {
    transform: translateX(0%);
    pointer-events: auto;
}

/* ============ CONTACT (von rechts) ============ */
.contact-sheet {
    position: fixed;
    inset: 0;
    z-index: 45;
    display: flex;
    align-items: stretch;
    pointer-events: none;
    /* deaktiviert, solange offscreen */
    transform: translateX(100%);
    /* offscreen rechts */
    transition: transform 300ms ease;
    /* rein/raus Dauer */
}

.contact-sheet.is-open {
    transform: translateX(0%);
    pointer-events: auto;
}

/* ============ GALLERY (von unten) ============ */
.gallery-sheet {
    position: fixed;
    inset: 0;
    z-index: 50;
    display: flex;
    align-items: flex-end;
    pointer-events: none;
    /* deaktiviert, solange offscreen */
    transform: translateY(100%);
    /* offscreen unten */
    transition: transform 300ms linear;
    /* rein/raus Dauer */
}

.gallery-sheet.is-open {
    transform: translateY(0%);
    pointer-events: auto;
}
</style>
