<template>
    <div class="absolute top-1/2 z-10 hidden md:flex -translate-y-1/2 flex-col items-center text-white text-[18px] leading-[18px]
           font-secondary font-medium tracking-[4px] cursor-pointer transition-opacity duration-300">
        <h4 @click="$emit('click')" class="select-none">{{ label }}</h4>
        <UiIcon name="arrow-down" />
    </div>
</template>

<script setup lang="ts">
defineProps<{ label: string }>()
import { Icon as UiIcon } from '@stratton-cologne/ui'
</script>
