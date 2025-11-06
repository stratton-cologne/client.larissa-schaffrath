<!-- resources/frontend/src/views/Home.vue -->
<template>
    <div class="home relative w-full h-screen overflow-hidden"
        :class="{ 'is-tilted': props.tilted, 'is-scaled': props.scaled }" @transitionend="onTiltTransitionEnd">
        <!-- Video Background -->
        <BackgroundLayer :bg="normalizedBg" />

        <!-- Navigation Links -->
        <NavLink class="left-10 top-1/2 -translate-y-1/2 rotate-90" :label="t('nav.about')"
            @click="$emit('aboutClick')" />
        <NavLink class="right-10 top-1/2 -translate-y-1/2 -rotate-90" :label="t('nav.contact')"
            @click="$emit('contactClick')" />

        <!-- Photographer / Brand -->
        <Brand class="top-1/4" name="Larissa Schaffrath" subtitle="photography" />

        <!-- Category Slider -->
        <div class="absolute inset-x-0 bottom-1/4">
            <CategorySlider :categories="categories" @categoryClick="(c) => $emit('categoryClick', c)" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'

import { useI18n } from 'vue-i18n'

import BackgroundLayer from '@/components/BackgroundLayer.vue'
import NavLink from '@/components/NavLink.vue'
import Brand from '@/components/Brand.vue'
import CategorySlider from '@/components/CategorySlider.vue'

import type { ClientSettingsDto } from '@/types'
import { api, normalizeBackground } from '@/lib/api'

const { t } = useI18n()

const props = defineProps<{ tilted?: boolean; scaled?: boolean }>()
const emit = defineEmits<{
    (e: 'tilt-end'): void
    (e: 'aboutClick'): void
    (e: 'contactClick'): void
    (e: 'categoryClick', c: string): void
}>()

const videoSrc =
    'https://daks2k3a4ib2z.cloudfront.net/571d8ef1487357056226da48/571d8ef2487357056226da58_studiocam-closeup%20(zoom%201)-HD-transcode.mp4'

const categories = ['portraits', 'landscape', 'wildlife', 'dummy1', 'dummy2'] as const

function onTiltTransitionEnd(e: TransitionEvent) {
    // Wir reagieren auf transform-Transition-Ende wenn einer der Zustände aktiv ist
    if (e.propertyName === 'transform' && (props.tilted || props.scaled)) {
        emit('tilt-end') // gleicher Event-Name, damit App.vue nichts ändern muss
    }
}

const clientBg = ref<ClientSettingsDto['background'] | null>(null)
const normalizedBg = computed(() => normalizeBackground(clientBg.value))

onMounted(async () => {
    // Portfolio
    // try {
    //     const p = await api.getPortfolio()
    //     portfolioName.value = p?.name || 'Portfolio'
    //     portfolioTagline.value = p?.tagline || ''
    // } catch (e) {
    //     console.warn('Portfolio load failed', e)
    // }

    // Client Settings → Hintergrund (video oder image oder none)
    try {
        const cs = await api.getClientSettings()
        clientBg.value = cs.background ?? null
    } catch (e) {
        console.warn('Client settings load failed', e)
    }

    // Galerien
    // try {
    //     const res = await api.getGalleries({ perPage: 12 })
    //     galleries.value = res.data.filter(g => g.is_published !== false)
    // } catch (e) {
    //     console.warn('Galleries load failed', e)
    // }
})
</script>

<style scoped>
.home {
    transform-style: preserve-3d;
    transition: transform 300ms linear;
    transform: rotateX(0deg) rotateY(0deg) rotateZ(0deg);
    transform-origin: 50% 0%;
    /* unten – wirkt wie „wegklappen“ */
}

.home.is-tilted {
    transform: rotateX(-10deg) rotateY(0deg) rotateZ(0deg);
}


/* About/Contact: Skalieren (ohne Rotate) */
.home.is-scaled {
    transform: rotateX(0deg) rotateY(0deg) rotateZ(0deg) scaleX(0.85) scaleY(0.85) scaleZ(1);
}

.home-view {
    width: 100%;
    height: 100vh;
    position: relative;
    overflow: hidden;
}
</style>
