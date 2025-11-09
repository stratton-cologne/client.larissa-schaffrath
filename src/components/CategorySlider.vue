<template>
    <div ref="rootEl" class="relative mx-auto max-w-[1000px] px-2 sm:px-4 outline-none" tabindex="0" @keydown="onKey"
        @touchstart.passive="onTouchStart" @touchmove.passive="onTouchMove" @touchend.passive="onTouchEnd"
        :aria-label="ariaLabel">
        <!-- Slider-Viewport -->
        <div class="relative w-full overflow-hidden">
            <!-- Track -->
            <ul :id="listId" role="listbox" :aria-activedescendant="activeDescendantId"
                class="flex w-full items-center select-none" :style="trackStyle" @transitionend="handleTransitionEnd">
                <li v-for="(cat, i) in loopedItems" :key="`${cat?.slug ?? 'item'}-${i}`" :id="optionId(i)" role="option"
                    :aria-selected="isVisibleActive(i) ? 'true' : 'false'"
                    :aria-current="isVisibleActive(i) ? 'true' : undefined"
                    class="group relative shrink-0 basis-full md:basis-1/3 flex flex-col items-center justify-center text-center transition-all duration-300"
                    :class="isVisibleActive(i) ? 'active-category' : 'inactive-category'">
                    <h2 class="peer relative mx-auto duration-300 ease font-primary
                               text-[22px] xs:text-[24px] md:text-[26px] leading-[1.1] font-semibold
                               tracking-[2px] xs:tracking-[3px] lowercase cursor-pointer
                               px-3 py-2 rounded-lg pb-10 xs:pb-12
                               focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-white/70 focus-visible:ring-offset-transparent"
                        @click="onItemClick(i)" :class="isVisibleActive(i)
                            ? 'opacity-100 scale-100 text-primary'
                            : 'opacity-40 scale-[0.6] text-white'">
                        {{ cat?.title ?? '—' }}

                        <UiIcon name="arrow-down"
                            class="absolute left-1/2 -translate-x-1/2 bottom-0 md:inline-block hidden transition-transform duration-300 ease-in-out hover:translate-y-2" />
                    </h2>
                </li>
            </ul>

            <!-- Prev/Next-Overlay -->
            <div class="pointer-events-none absolute inset-0 z-60 flex items-center justify-between px-2">
                <button type="button" :aria-controls="listId" aria-label="Vorheriges" class="pointer-events-auto text-white w-10 h-10 md:w-11 md:h-11 flex items-center justify-center active:scale-95 transition group
                           focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 rounded-full"
                    @click="goPrev">
                    <UiIcon name="arrow-left"
                        class="inline-block transition-transform duration-300 ease-in-out group-hover:-translate-x-2 h-5 w-5 drop-shadow"
                        aria-hidden="true" />
                </button>

                <button type="button" :aria-controls="listId" aria-label="Nächstes" class="pointer-events-auto text-white w-10 h-10 md:w-11 md:h-11 flex items-center justify-center active:scale-95 transition group
                           focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 rounded-full"
                    @click="goNext">
                    <UiIcon name="arrow-right"
                        class="transition-transform duration-300 ease-in-out group-hover:translate-x-2 h-5 w-5 drop-shadow"
                        aria-hidden="true" />
                </button>
            </div>

            <!-- Mobile Pips -->
            <div class="absolute inset-x-0 bottom-2 flex md:hidden justify-center gap-1.5 z-50">
                <span v-for="(cat, idx) in core" :key="`pip-${idx}`" class="h-1.5 rounded-full transition-all"
                    :class="['bg-white/40', pipActive(idx) ? 'w-5 bg-white' : 'w-2.5']" />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
/**
 * Responsiver Category-Slider:
 * - mobil: 1 sichtbares Item (offset=0, links aktiv)
 * - ab md: 3 sichtbare Items (offset=1, Mitte aktiv)
 * - Translate = (current - offset) * (100 / visible)
 * - Prev/Next + Swipe + Keyboard, Wrap, Persistenz
 * - A11y: aria-controls, aria-activedescendant, aria-selected, aria-current, Focus-Rings
 * - Sanfter Resize-Handler (debounce), TS-sicher (keine Non-Null-Assertions)
 */
import { computed, ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { Icon as UiIcon } from '@stratton-cologne/ui'

type Category = { id: number; slug: string; title: string }

const props = defineProps<{
    categories: Category[]
    emitKey?: 'id' | 'slug'
    ariaLabel?: string
}>()

const emit = defineEmits<{ (e: 'categoryClick', v: string | number): void }>()
const rootEl = ref<HTMLElement | null>(null)

/* A11y: IDs für Listbox & Optionen */
const listId = `category-slider-list-${Math.random().toString(36).slice(2)}`
function optionId(loopIdx: number) { return `${listId}-opt-${loopIdx}` }
const ariaLabel = computed(() => props.ariaLabel ?? 'Kategorien')

/* Kernliste defensiv */
const core = computed(() => Array.isArray(props.categories) ? props.categories : [])
const n = computed(() => core.value.length)

/* Sichtbare Anzahl (mobil 1, ab md 3) */
const visible = ref<number>(1)
let mql: MediaQueryList | null = null
function computeVisible() { visible.value = mql && mql.matches ? 3 : 1 }

/* Offset: Mitte bei 3, links bei 1 */
const offset = computed(() => Math.floor(Math.max(1, visible.value) - 1) / 2)

/* Persistenter Core-Index (nur für Pips/Restore) */
const STORAGE_KEY = 'categorySliderCoreIndex'
const initialized = ref(false)

/* Aktueller Loop-Index des aktiven Items */
const current = ref(n.value > 0 ? n.value : 1)
const isTransitioning = ref(false)

/* Breite pro Item in % */
const itemWidthPct = computed(() => 100 / (visible.value || 1))

/* Loop-Duplikate */
const loopedItems = computed(() => (n.value ? [...core.value, ...core.value, ...core.value] : []))

/* Translate in % */
const translatePercent = ref((current.value - offset.value) * itemWidthPct.value)
const trackStyle = computed(() => ({
    transform: `translateX(-${translatePercent.value}%)`,
    transition: isTransitioning.value ? 'transform 300ms ease' : 'none',
}))

/* A11y: aktuelles aktives Option-Element referenzieren */
const activeDescendantId = computed(() => optionId(current.value))

/* Debounce-Helfer (sanfter Resize) */
function debounce<T extends (...args: any[]) => void>(fn: T, delay = 120) {
    let timer: number | undefined
    return (...args: Parameters<T>) => {
        if (timer) window.clearTimeout(timer)
        timer = window.setTimeout(() => fn(...args), delay)
    }
}

/* Recalc der Geometrie (debounced) */
const recalcTranslate = () => {
    translatePercent.value = (current.value - offset.value) * itemWidthPct.value
}
const recalcTranslateDebounced = debounce(recalcTranslate, 120)
const onResize = () => {
    // sichtbare Anzahl ggf. aktualisieren und Translate sanft neu berechnen
    computeVisible()
    recalcTranslateDebounced()
}

onMounted(() => {
    mql = window.matchMedia('(min-width: 768px)')
    computeVisible()
    mql.addEventListener?.('change', onResize) // anstatt direktem compute → debounced Recalc
    window.addEventListener('resize', onResize, { passive: true })

    try {
        const saved = sessionStorage.getItem(STORAGE_KEY)
        if (saved !== null && n.value > 0) {
            const savedCoreIdx = Math.max(0, Math.min(n.value - 1, parseInt(saved, 10) || 0))
            current.value = n.value + savedCoreIdx // in Block 2 platzieren
            translatePercent.value = (current.value - offset.value) * itemWidthPct.value
            initialized.value = true
        }
    } catch { /* ignore */ }
})
onBeforeUnmount(() => {
    mql?.removeEventListener?.('change', onResize)
    window.removeEventListener('resize', onResize)
})

/* Initial nur einmal ausrichten, wenn Daten kommen */
watch(n, (val, old) => {
    if (val && val !== old && !initialized.value) {
        current.value = val
        translatePercent.value = (current.value - offset.value) * itemWidthPct.value
        initialized.value = true
    }
})

/* Bei Breakpoint/Itembreite/Offset neu berechnen (sanft) */
watch([itemWidthPct, offset], () => {
    recalcTranslateDebounced()
})

function handleTransitionEnd() {
    if (!n.value) return

    // Wrap rechts
    if (current.value >= n.value * 2) {
        isTransitioning.value = false
        current.value = n.value
        translatePercent.value = (current.value - offset.value) * itemWidthPct.value
        requestAnimationFrame(() => { isTransitioning.value = false })
        if (pendingEmit.value !== null) flushPendingEmit()
        return
    }
    // Wrap links
    if (current.value <= n.value - 1) {
        isTransitioning.value = false
        current.value = n.value + n.value - 1
        translatePercent.value = (current.value - offset.value) * itemWidthPct.value
        requestAnimationFrame(() => { isTransitioning.value = false })
        if (pendingEmit.value !== null) flushPendingEmit()
        return
    }

    if (pendingEmit.value !== null) flushPendingEmit()
    isTransitioning.value = false
}

watch(current, (val) => {
    translatePercent.value = (val - offset.value) * itemWidthPct.value

    // nur Core-Index persistieren (für Pips/Restore)
    if (n.value) {
        const normalized = ((val % n.value) + n.value) % n.value
        try { sessionStorage.setItem(STORAGE_KEY, String(normalized)) } catch { /* ignore */ }
    }
})

/* Hilfsfunktionen */
function coreIndex(loopIdx: number) {
    if (!n.value) return 0
    return ((loopIdx % n.value) + n.value) % n.value
}

/* Sichtbar-aktiv = genau dieses Loop-Item ist aktiv (links bei 1, Mitte bei 3) */
function isVisibleActive(loopIdx: number) {
    return loopIdx === current.value
}

/* Klick-Logik: wenn bereits sichtbar/aktiv → direkt emitten; sonst erst hinsliden, dann emitten */
const pendingEmit = ref<string | number | null>(null)
function onItemClick(i: number) {
    if (!n.value) return
    const c = core.value[coreIndex(i)]
    if (!c) return

    const key = props.emitKey ?? 'slug'
    const value = key === 'id' ? (c.id as number) : (c.slug as string)

    if (isVisibleActive(i)) {
        emit('categoryClick', value)
        return
    }

    isTransitioning.value = true
    pendingEmit.value = value
    current.value = i
}

function flushPendingEmit() {
    const v = pendingEmit.value
    pendingEmit.value = null
    if (v !== null) emit('categoryClick', v)
}

/* Prev/Next */
function goPrev() { if (!n.value) return; isTransitioning.value = true; current.value = current.value - 1 }
function goNext() { if (!n.value) return; isTransitioning.value = true; current.value = current.value + 1 }

/* Pips-Status (mobil) – basiert auf Core-Index */
function pipActive(coreIdxNum: number) {
    if (!n.value) return false
    const normalized = ((current.value % n.value) + n.value) % n.value
    return normalized === coreIdxNum
}

/* Swipe + Keyboard – TS2532-sicher mit .item(0) */
let startX = 0, touching = false
function onTouchStart(e: TouchEvent) {
    const t = e.touches && e.touches.length > 0 ? e.touches.item(0) : null
    if (!t) return
    touching = true
    startX = t.clientX
}
function onTouchMove(_e: TouchEvent) { }
function onTouchEnd(e: TouchEvent) {
    if (!touching) return
    const list = e.changedTouches
    const first = list && list.length > 0 ? list.item(0) : null
    if (!first) { touching = false; return }
    const dx = first.clientX - startX
    const threshold = 30
    if (dx > threshold) goPrev()
    if (dx < -threshold) goNext()
    touching = false
}
function onKey(e: KeyboardEvent) {
    if (e.key === 'ArrowLeft') goPrev()
    else if (e.key === 'ArrowRight') goNext()
}
</script>

<style scoped>
li {
    transition: transform 1.3s ease, opacity 1.3s ease;
}

/* Optionales Debugging:
.active-category { outline: 1px dashed rgba(0,0,0,.25); }
.inactive-category { opacity: .8; }
*/
</style>
