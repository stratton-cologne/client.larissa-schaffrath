<template>
    <div class="absolute inset-0 z-0">
        <!-- Bild -->
        <img v-if="bg?.kind === 'image'" :src="bg.src" alt="" class="w-full h-full object-center" :style="imageStyle" />

        <!-- Video -->
        <video v-else-if="bg?.kind === 'video'" :src="bg.src" class="w-full h-full object-cover" autoplay muted loop
            playsinline />

        <!-- Fallback (dunkler Layer) -->
        <div v-else class="absolute inset-0 bg-black/60" />

        <!-- Overlayfarbe falls gesetzt (z.B. 'rgba(0,0,0,.4)' oder '#00000080') -->
        <div v-if="bg?.overlay" class="absolute inset-0 pointer-events-none" :style="{ background: bg.overlay }" />
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { NormalizedBackground } from '@/lib/api'

const props = defineProps<{ bg: NormalizedBackground }>()
const imageStyle = computed(() => {
    if (!props.bg || props.bg.kind !== 'image') return {}
    const style: Record<string, string> = {
        objectFit: props.bg.fit || 'cover',
        objectPosition: props.bg.position || 'center',
    }
    return style
})
</script>

<style scoped>
:host,
div {
    contain: layout style;
}
</style>
