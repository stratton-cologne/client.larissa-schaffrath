<!-- components/ui/ModalCard.vue -->
<template>
    <div
        class="relative mx-4 w-full max-w-[720px] rounded-2xl bg-white/5 ring-1 ring-white/10 shadow-[0_10px_60px_-15px_rgba(0,0,0,0.8)]">
        <div class="px-8 sm:px-10 pt-12 pb-10 text-center text-white">
            <slot />
        </div>
        <div
            class="pointer-events-none absolute inset-x-3 bottom-3 h-[2px] bg-gradient-to-r from-transparent via-white/10 to-transparent rounded-full" />
    </div>
</template>


