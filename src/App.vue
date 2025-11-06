<template>
    <!-- Language Switcher -->
    <LanguageSwitcher />

    <div class="app-root bg-[#1a1a1a]">
        <!-- Perspektive MUSS auf dem Parent liegen -->
        <div class="stage">
            <HomeView :tilted="tilted" :scaled="scaled" @tilt-end="onHomeTransformEnd" @aboutClick="openAbout"
                @contactClick="openContact" @categoryClick="handleCategoryClick" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'

import LanguageSwitcher from '@/components/ui/LanguageSwitcher.vue'

import HomeView from '@/views/Home.vue'

// API

// Passe den Typ an deine Kategorien an:
type GalleryCategory = 'portraits' | 'landscape' | 'wildlife'
type Category = GalleryCategory | 'dummy1' | 'dummy2'

/** Zustände **/
const tilted = ref(false)               // Home kippt (für Gallery)
const scaled = ref(false)               // Home skaliert (für About/Contact)

const pendingCategory = ref<GalleryCategory | null>(null)
const activeCategory = ref<GalleryCategory | null>(null)
/** Welche Aktion wartet auf Home-Transition? */
const pendingAction = ref<null | 'gallery' | 'about' | 'contact'>(null)

onMounted(async () => {
    console.log('App mounted');
})

/** Kategorie aus dem Slider */
function handleCategoryClick(c: string) {
    // auf unsere bekannte Union eingrenzen
    type GalleryCategory = 'portraits' | 'landscape' | 'wildlife'
    type Category = GalleryCategory | 'dummy1' | 'dummy2'

    if (c === 'dummy1' || c === 'dummy2') return
    // hier ist c sicher eine GalleryCategory
    pendingCategory.value = c as GalleryCategory
    pendingAction.value = 'gallery'
    tilted.value = true// Phase A (Gallery): Home kippen
}

/** About/Contact aus HomeView */
function openAbout() {
    pendingAction.value = 'about'
    scaled.value = true               // Phase A (About): Home skalieren
}

function openContact() {
    pendingAction.value = 'contact'
    scaled.value = true               // Phase A (Contact): Home skalieren
}

/** Home-Transform fertig → passende Overlay-Phase B starten */
function onHomeTransformEnd() {
    if (pendingAction.value === 'gallery' && pendingCategory.value) {
        activeCategory.value = pendingCategory.value
        return
    }
    if (pendingAction.value === 'about') {
        return
    }
    if (pendingAction.value === 'contact') {
        return
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

/* ============ CONTACT (von rechts) ============ */

/* ============ GALLERY (von unten) ============ */
</style>
