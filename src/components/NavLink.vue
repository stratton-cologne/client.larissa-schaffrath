<template>
    <div
        class="absolute top-1/2 z-6 flex flex-col justify-center items-center my-0 pb-[50px] font-poppins text-white text-[18px] leading-[18px] font-medium text-center tracking-[4px] cursor-pointer transition-all duration-300 ease-in-out opacity-100 bg-no-repeat bg-size-[5px]">
        <h4 @click="$emit('click')">
            {{ label }}
        </h4>
        <UiIcon name="arrow-down" />
    </div>
</template>
<script setup lang="ts">
defineProps<{ label: string }>()

import { Icon as UiIcon } from '@stratton-cologne/ui'
</script>
