<!-- src/components/home/CategorySlider.vue -->
<template>
    <div class="relative mx-auto max-w-[1000px] px-4 transition-[background-position] duration-300 ease-in-out">
        <div class="relative w-full overflow-hidden">
            <ul class="flex w-full items-center" :style="trackStyle" @transitionend="handleTransitionEnd">
                <li v-for="(cat, i) in loopedItems" :key="`${cat}-${i}`"
                    class="shrink-0 basis-1/3 text-center flex items-center justify-center h-full transition-all duration-300">
                    <h2 class="relative block mx-auto pb-[50px] duration-300 ease font-[Poppins] text-[26px] leading-[26px] font-semibold text-center tracking-[3px] lowercase cursor-pointer"
                        @click="onItemClick(i)"
                        :class="{ 'opacity-40 scale-[0.6] text-white': i !== current, 'opacity-100 scale-100 text-primary': i === current }">
                        {{ t(`categories.${cat}`) }}
                        <UiIcon name="arrow-down"
                            class="absolute left-1/2 -translate-x-1/2 bottom-0 inline-block transition-transform duration-300 ease-in-out hover:translate-y-2" />
                    </h2>
                </li>
            </ul>
        </div>
        <!-- Arrows -->
        <div class="absolute inset-y-0 left-4 my-auto block cursor-pointer select-none text-white text-[40px] z-4
         duration-300 ease-in-out group" aria-label="Previous" @click="prev">
            <UiIcon name="arrow-left"
                class="inline-block transition-transform duration-300 ease-in-out group-hover:-translate-x-2" />
        </div>
        <div class="absolute inset-0 m-auto block cursor-pointer text-white text-[40px] select-none
         z-4 left-auto w-[50px] duration-300 ease-in-out group" @click="next" aria-label="Next">
            <UiIcon name="arrow-right"
                class="transition-transform duration-300 ease-in-out group-hover:translate-x-2" />
        </div>

    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import { Icon as UiIcon } from '@stratton-cologne/ui'

import arrowLeft from '@/assets/image/arrow-left.png'
import arrowRight from '@/assets/image/arrow-right.png'
import arrowDown from '@/assets/image/arrow-down.png'

const { t } = useI18n()

type NonEmpty<T> = readonly [T, ...T[]]
const props = defineProps<{ categories: NonEmpty<string> }>()
const emit = defineEmits<{ (e: 'categoryClick', category: string): void }>()

const VISIBLE = 3
const itemWidthPct = 100 / VISIBLE

// Core & 3× Loop
const core = computed(() => props.categories as readonly string[])
const n = computed(() => core.value.length)
const loopedItems = computed(() => [...core.value, ...core.value, ...core.value] as const)

// current zeigt auf das **aktive (mittlere)** Element im mittleren Block
const current = ref<number>(n.value) // Start: erstes Element der Mittel-Sequenz ist center
const isTransitioning = ref(false)

// Translate: linker sichtbarer Index = current - 1
const translatePercent = ref((current.value - 1) * itemWidthPct)
const trackStyle = computed(() => ({
    transform: `translateX(-${translatePercent.value}%)`,
    transition: isTransitioning.value ? 'transform 0.35s ease' : 'none',
}))

function next() {
    isTransitioning.value = true
    current.value++
}
function prev() {
    isTransitioning.value = true
    current.value--
}

function handleTransitionEnd() {
    // Reset rechts: wenn wir in den rechten Drittelblock hinauslaufen
    if (current.value >= n.value * 2) {
        isTransitioning.value = false
        current.value = n.value
        translatePercent.value = (current.value - 1) * itemWidthPct
        // Transition im nächsten Frame wieder aktivieren
        requestAnimationFrame(() => { isTransitioning.value = false }) // bleibt ohne Transition bis zur nächsten User-Interaktion
        return
    }
    // Reset links: wenn wir in den linken Drittelblock hinauslaufen
    if (current.value <= n.value - 1) {
        isTransitioning.value = false
        current.value = n.value + n.value - 1
        translatePercent.value = (current.value - 1) * itemWidthPct
        requestAnimationFrame(() => { isTransitioning.value = false })
        return
    }
    // Normaler Abschluss
    isTransitioning.value = false
}

watch(current, (val) => {
    translatePercent.value = (val - 1) * itemWidthPct
})

// function onItemClick(i: number) {
//     // linke/rechte sichtbare klicken → sliden; Mitte → emit
//     if (i === current.value) {
//         // mappe auf Core-Index
//         const coreIdx = (current.value % n.value + n.value) % n.value
//         emit('categoryClick', core.value[coreIdx]!)
//     } else if (i > current.value) {
//         next()
//     } else {
//         prev()
//     }
// }

function onItemClick(i: number) {
    // Index i kommt aus [core, core, core]; wir wollen den echten Core-Index:
    const coreIdx = ((i % n.value) + n.value) % n.value
    emit('categoryClick', core.value[coreIdx]!)
}
</script>

<style scoped>
/* dezente Hervorhebung */
li {
    transition: transform 0.3s ease, opacity 0.3s ease;
}
</style>
