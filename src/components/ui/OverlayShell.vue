<!-- components/ui/OverlayShell.vue -->
<template>
    <Transition name="fade">
        <div v-if="open" class="fixed inset-0 z-100 flex items-center justify-center overflow-hidden
             bg-[#1a1a1af2] backdrop-blur-[2px]" role="dialog" aria-modal="true" @click="$emit('close')">
            <!-- Außenabstand 40px -->
            <div class="relative w-full h-full p-10 flex items-center justify-center" @click.stop>
                <slot />
            </div>
        </div>
    </Transition>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
    open: boolean
    backdrop?: 'dark' | 'none'
    blur?: boolean
}>(), { backdrop: 'dark', blur: true })

const backdropClass = props.backdrop === 'dark' ? 'bg-[#1a1a1af2]' : ''
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
