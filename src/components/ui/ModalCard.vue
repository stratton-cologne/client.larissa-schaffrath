<!-- components/ui/ModalCard.vue -->
<template>
    <!-- Karte selbst auf die Viewport-Höhe minus 80px (2×40) begrenzen -->
    <div class="relative mx-auto w-fulls rounded-2xl bg-white/5 ring-1 ring-white/10 shadow-[0_10px_60px_-15px_rgba(0,0,0,0.8)] overflow-hidden
           max-h-[calc(100vh-80px)] flex flex-col">
        <!-- Header: bleibt sichtbar, scrollt NICHT mit -->
        <div class="px-8 sm:px-10 pt-12 pb-4 text-center text-white shrink-0">
            <slot name="header" />
        </div>

        <!-- Body: scrollt (nur dieser Bereich!) -->
        <div class="px-8 sm:px-10 pb-10 text-white/90 grow min-h-0 overflow-y-auto">
            <slot />
        </div>

        <!-- Deko-Linie -->
        <div class="pointer-events-none absolute inset-x-3 bottom-3 h-0.5 rounded-full
             bg-linear-to-r from-transparent via-white/10 to-transparent" />
    </div>
</template>
