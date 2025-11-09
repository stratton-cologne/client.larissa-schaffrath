<!-- components/ui/CloseXButton.vue -->
<template>
    <button class="fixed top-10 right-10 h-10 w-10 cursor-pointer group outline-none
           focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black/40
           rounded-full z-200 pointer-events-auto" :aria-label="ariaLabel" :aria-controls="ariaControls || undefined"
        @click="$emit('click')">
        <div
            class="block relative w-full h-full transition-transform duration-300 ease-out motion-safe:group-hover:rotate-90">
            <UiIcon name="close" color="#ffffff" size="48"
                class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-opacity duration-150 ease-linear" />
        </div>
    </button>
</template>

<script setup lang="ts">
defineProps<{ ariaLabel: string; ariaControls?: string }>()
import { Icon as UiIcon } from '@stratton-cologne/ui'
</script>
