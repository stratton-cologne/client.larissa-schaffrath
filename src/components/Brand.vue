<template>
    <div class="absolute inset-x-0 w-full -translate-y-1/2 z-10" :class="positionClass">
        <h1 class="font-secondary text-[#e0e0e0] text-[28px] xs:text-[32px] sm:text-[34px] leading-tight text-center
             tracking-[0.5px] sm:tracking-[1px] transition-transform duration-3000 ease-out transform-gpu"
            :class="entered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'">
            {{ name }}
        </h1>
        <div class="mt-1 font-primary text-primary text-base xs:text-lg leading-6 tracking-[0.5px] sm:tracking-[1px] text-center
             transition-transform duration-3000 ease-out transform-gpu"
            :class="entered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'">
            {{ subtitle }}
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
const props = defineProps<{ name: string; subtitle: string; class?: string }>()
const positionClass = computed(() => props.class ?? 'top-1/4')
const entered = ref(false)
onMounted(() => requestAnimationFrame(() => (entered.value = true)))
</script>
