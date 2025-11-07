<!-- components/about/ProfileCard.vue -->
<template>
    <div>
        <div
            class="mx-auto -mt-20 mb-6 w-[120px] h-[140px] rounded-lg overflow-hidden shadow-[0_12px_40px_-10px_rgba(0,0,0,0.8)]">
            <img :src="img" :alt="name" class="w-full h-full object-cover" loading="lazy" />
        </div>
        <h4 class="text-[22px] sm:text-[24px] font-extrabold tracking-wider">{{ name }}</h4>
        <div class="mt-1 text-primary/90 tracking-[0.25em] text-sm lowercase select-none">{{ subtitle }}</div>
        <div class="mt-6 text-[15px] leading-7 text-white/85 max-w-[620px] mx-auto">
            <slot name="description" />
        </div>
        <div class="mt-8">
            <slot name="footer" />
        </div>
    </div>
</template>
<script setup lang="ts">
defineProps<{ img: string; name: string; subtitle: string }>()
</script>


