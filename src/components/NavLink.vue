<template>
    <h4 class="absolute top-1/2 z-[6] inline-block my-0 pb-[50px] font-poppins text-white text-[18px] leading-[18px] font-medium text-center tracking-[4px] cursor-pointer transition-all duration-300 ease-in-out opacity-100 bg-no-repeat bg-size-[5px] bg-position-[50%_32px] hover:bg-position-[50%_40px]"
        @click="$emit('click')" :style="{ backgroundImage: `url(${arrowDown})` }">
        {{ label }}
    </h4>
</template>
<script setup lang="ts">
defineProps<{ label: string }>()

import arrowDown from '@/assets/image/arrow-down.png';
</script>
