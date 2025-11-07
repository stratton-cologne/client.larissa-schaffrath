<!-- src/components/home/CategorySlider.vue -->
<template>
    <div class="relative mx-auto max-w-[1000px] px-4 transition-[background-position] duration-300 ease-in-out">
        <div class="relative w-full overflow-hidden">
            <ul class="flex w-full items-center" :style="trackStyle" @transitionend="handleTransitionEnd">
                <li v-for="(cat, i) in loopedItems" :key="`${cat.slug}-${i}`"
                    class="shrink-0 basis-1/3 text-center flex items-center justify-center h-full transition-all duration-300">
                    <h2 class="relative block mx-auto pb-[50px] duration-300 ease font-[Poppins] text-[26px] leading-[26px] font-semibold text-center tracking-[3px] lowercase cursor-pointer"
                        @click="onItemClick(i)" :class="{
                            'opacity-40 scale-[0.6] text-white': i !== current, 'opacity-100 scale-100 text-primary': i === current
                        }">
                        {{ cat.title }}
                        <UiIcon name="arrow-down"
                            class="absolute left-1/2 -translate-x-1/2 bottom-0 inline-block transition-transform duration-300 ease-in-out hover:translate-y-2" />
                    </h2>
                </li>
            </ul>
        </div>

        <!-- Arrows -->
        <div class="absolute inset-y-0 left-4 my-auto block cursor-pointer select-none text-white text-[40px] z-4 duration-300 ease-in-out group"
            aria-label="Previous" @click="prev">
            <UiIcon name="arrow-left"
                class="inline-block transition-transform duration-300 ease-in-out group-hover:-translate-x-2" />
        </div>
        <div class="absolute inset-0 m-auto block cursor-pointer text-white text-[40px] select-none z-4 left-auto w-[50px] duration-300 ease-in-out group"
            @click="next" aria-label="Next">
            <UiIcon name="arrow-right"
                class="transition-transform duration-300 ease-in-out group-hover:translate-x-2" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { Icon as UiIcon } from '@stratton-cologne/ui'

type Cat = { id: number; slug: string; title: string }

const props = defineProps<{
    categories: Cat[]
    emitKey?: 'slug' | 'id'
}>()

const emit = defineEmits<{ (e: 'categoryClick', category: string | number): void }>()

const VISIBLE = 3
const itemWidthPct = 100 / VISIBLE

const core = computed(() => props.categories as readonly Cat[])
const n = computed(() => core.value.length)
const loopedItems = computed(() => [...core.value, ...core.value, ...core.value] as const)

const current = ref<number>(0)           // wird nach Laden gesetzt
const isTransitioning = ref(false)
const translatePercent = ref(0)
const trackStyle = computed(() => ({
    transform: `translateX(-${translatePercent.value}%)`,
    transition: isTransitioning.value ? 'transform 0.35s ease' : 'none',
}))

// 👉 Wichtig: wenn Kategorien reinkommen/wechseln → auf die Mitte setzen
watch(n, async (val, old) => {
    if (val > 0 && val !== old) {
        current.value = val                 // Mitte des mittleren Blocks
        await nextTick()
        translatePercent.value = (current.value - 1) * itemWidthPct
    }
}, { immediate: true })

function next() { if (!n.value) return; isTransitioning.value = true; current.value++ }
function prev() { if (!n.value) return; isTransitioning.value = true; current.value-- }

function handleTransitionEnd() {
    if (!n.value) return
    // rechtses Ende -> zurück in Mitte
    if (current.value >= n.value * 2) {
        isTransitioning.value = false
        current.value = n.value
        translatePercent.value = (current.value - 1) * itemWidthPct
        requestAnimationFrame(() => { isTransitioning.value = false })
        return
    }
    // linkes Ende -> zurück in Mitte
    if (current.value <= n.value - 1) {
        isTransitioning.value = false
        current.value = n.value + n.value - 1
        translatePercent.value = (current.value - 1) * itemWidthPct
        requestAnimationFrame(() => { isTransitioning.value = false })
        return
    }

    // optional: Pending-Emit nach Zentrierung feuern
    if (pendingEmit.value) {
        emit('categoryClick', pendingEmit.value)
        pendingEmit.value = null
    }

    isTransitioning.value = false
}

watch(current, (val) => {
    translatePercent.value = (val - 1) * itemWidthPct
})

// ✅ Klick-Verhalten: wenn nicht die Mitte, erst dorthin sliden, dann emit
const pendingEmit = ref<string | number | null>(null)
function onItemClick(i: number) {
    if (!n.value) return
    const coreIdx = ((i % n.value) + n.value) % n.value
    const c = core.value[coreIdx]!
    const key = props.emitKey ?? 'slug'
    const value = key === 'id' ? c.id : c.slug

    if (i !== current.value) {
        isTransitioning.value = true
        current.value = i          // sliden, Item in die Mitte holen
        pendingEmit.value = value  // danach klicken „emittieren“
    } else {
        emit('categoryClick', value)
    }
}
</script>

<style scoped>
/* dezente Hervorhebung */
li {
    transition: transform 0.3s ease, opacity 0.3s ease;
}
</style>
