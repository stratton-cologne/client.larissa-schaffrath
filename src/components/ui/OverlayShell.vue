<!-- components/ui/OverlayShell.vue -->
<template>
    <Transition name="fade">
        <div v-if="open" class="fixed inset-0 z-100 flex items-stretch sm:items-center justify-center overflow-hidden
             bg-[#1a1a1af2] backdrop-blur-[2px]" role="dialog" aria-modal="true" :aria-label="ariaLabel || undefined"
            :aria-labelledby="ariaLabelledby || undefined" @click="$emit('close')">
            <!-- Außenabstand responsiv + Safe-Area -->
            <div class="relative w-full h-full p-[max(1rem,env(safe-area-inset-top))] sm:p-10
               flex items-start sm:items-center justify-center pointer-events-auto" @click.stop>
                <slot />
            </div>
        </div>
    </Transition>
</template>

<script setup lang="ts">
/**
 * OverlayShell – generisches Dialog-Overlay.
 * - role="dialog", aria-modal
 * - optional ariaLabel / ariaLabelledby für A11y
 */
withDefaults(
    defineProps<{
        open: boolean
        backdrop?: 'dark' | 'none'
        blur?: boolean
        ariaLabel?: string
        ariaLabelledby?: string
    }>(),
    { backdrop: 'dark', blur: true }
)
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: opacity .25s ease
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0
}
</style>
