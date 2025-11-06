<template>
    <div class="absolute inset-x-0 w-full -translate-y-1/2 text z-3" :class="positionClass">
        <h1 class="font-poppins opacity-100 text-[#e0e0e0] text-[34px] leading-[40px] text-center tracking-[1px]transition-opacity transition-transform duration-[3000ms] ease-out transform-gpu"
            :class="entered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'">
            {{ name }}
        </h1>
        <div class="font-indie text-primary text-lg leading-[1.5rem] tracking-[1px] text-center
        transition-opacity transition-transform duration-[3000ms] ease-out transform-gpu
           " :class="entered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'">
            {{ subtitle }}
        </div>
    </div>
</template>
<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
const props = defineProps<{
    name: string
    subtitle: string
    /** Tailwind position utilities for the wrapper, e.g. 'top-1/4' */
    class?: string
}>()

const positionClass = computed(() => props.class ?? 'top-1/4')

const entered = ref(false)
onMounted(() => {
    // rAF stellt sicher, dass der initiale Zustand zuerst gerendert ist
    requestAnimationFrame(() => (entered.value = true))
})
</script>
