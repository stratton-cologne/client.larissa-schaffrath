<!-- components/ui/SocialLinksInline.vue -->
<template>
    <ul class="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
        <li v-for="(s, i) in items" :key="i">
            <a :href="s.href"
                class="text-[15px] tracking-wide text-primary hover:underline underline-offset-4 transition">{{ s.label
                }}</a>
        </li>
    </ul>
</template>
<script setup lang="ts">
defineProps<{ items: { label: string; href: string }[] }>()
</script>


