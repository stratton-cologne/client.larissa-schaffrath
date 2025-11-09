<!-- components/ui/ModalCard.vue -->
<template>
    <div class="relative mx-auto w-full max-w-[970px] rounded-2xl bg-white/5 ring-1 ring-white/10
              shadow-[0_10px_60px_-15px_rgba(0,0,0,0.8)] overflow-hidden
              h-[calc(100vh-2rem)] sm:h-auto sm:max-h-[calc(100vh-80px)] flex flex-col">
        <div class="px-5 sm:px-10 pt-8 sm:pt-12 pb-4 text-center text-white shrink-0">
            <slot name="header" />
        </div>
        <div class="px-5 sm:px-10 pb-8 sm:pb-10 text-white/90 grow min-h-0 overflow-y-auto">
            <slot />
        </div>
        <div class="pointer-events-none absolute inset-x-3 bottom-3 h-0.5 rounded-full
                bg-linear-to-r from-transparent via-white/10 to-transparent" />
    </div>
</template>
