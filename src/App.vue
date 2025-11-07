<template>
    <!-- Language Switcher -->
    <LanguageSwitcher />

    <div class="app-root bg-[#1a1a1a]">
        <!-- Perspektive MUSS auf dem Parent liegen -->
        <div class="stage">
            <HomeView :tilted="tilted" :scaled="scaled" @tilt-end="onHomeTransformEnd" @aboutClick="openAbout"
                @contactClick="openContact" @categoryClick="handleCategoryClick" />
        </div>

        <!-- GALLERY: von UNTEN rein/raus -->
        <div class="gallery-sheet" :class="{ 'is-open': isGalleryOpen }" @transitionend="onGalleryTransitionEnd"
            role="dialog" aria-modal="true">
            <GalleryView v-if="activeGallery" :gallery="activeGallery" @close="closeGallery" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import { api } from '@/lib/api'
import type { GalleryShowResponse } from '@/types'   // ⬅️ richtiger Pfad

import LanguageSwitcher from '@/components/ui/LanguageSwitcher.vue'
import HomeView from '@/views/Home.vue'
import GalleryView from '@/views/Gallery.vue'

const tilted = ref(false)
const scaled = ref(false)

const isGalleryOpen = ref(false)
const pendingAction = ref<null | 'gallery' | 'about' | 'contact'>(null)

const pendingGalleryId = ref<number | null>(null)
const activeGallery = ref<GalleryShowResponse | null>(null)

async function handleCategoryClick(id: number | string) { // ⬅️ robust gegen union
    pendingGalleryId.value = Number(id)
    pendingAction.value = 'gallery'
    tilted.value = true
}

function openAbout() { pendingAction.value = 'about'; scaled.value = true }
function openContact() { pendingAction.value = 'contact'; scaled.value = true }

async function onHomeTransformEnd() {
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
    if (pendingAction.value === 'about' || pendingAction.value === 'contact') {
        pendingAction.value = null
    }
}

function closeGallery() { isGalleryOpen.value = false }
function onGalleryTransitionEnd(e: TransitionEvent) {
    if (e.propertyName !== 'transform') return
    if (!isGalleryOpen.value) {
        tilted.value = false
        activeGallery.value = null
        pendingGalleryId.value = null
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

.gallery-sheet {
    position: fixed;
    inset: 0;
    z-index: 50;
    display: flex;
    align-items: flex-end;
    pointer-events: none;
    /* deaktiviert, solange offscreen */
    transform: translate(0px, 100%);
    transition: transform 300ms linear;
}

.gallery-sheet.is-open {
    transform: translateX(0px) translateY(0px) translateZ(0px);
    pointer-events: auto;
}
</style>
