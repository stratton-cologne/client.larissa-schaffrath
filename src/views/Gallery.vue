<!-- src/views/Gallery.vue -->
<template>
    <div class="gallery-view w-full min-h-screen h-full overflow-y-auto bg-[#1a1a1af2]"
        :aria-label="`Galerie: ${gallery.title}`" :style="{ paddingTop: topPadding }">
        <!-- Fixed Close (mit Safe-Area) -->
        <button class="fixed z-210 right-4 text-white/95 hover:text-white active:scale-95 transition
                   flex items-center justify-center rounded-full bg-white/10 backdrop-blur
                   shadow-md" :style="{ top: topSafe }" aria-label="Schließen" @click="$emit('close')">
            <span class="sr-only">Schließen</span>
            <svg xmlns="http://www.w3.org/2000/svg" class="w-9 h-9 p-1.5" viewBox="0 0 24 24" fill="none"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
        </button>

        <div class="gallery-container max-w-[1400px] mx-auto px-4 sm:px-6 pb-10">
            <!-- Header -->
            <div
                class="camera-info mb-6 sm:mb-8 text-white w-full flex flex-col items-center justify-center text-center">
                <h3 class="gallery-name text-primary font-secondary font-light lowercase
                           tracking-[0.2rem] sm:tracking-[0.25rem]
                           mb-2" :class="'text-[clamp(28px,6.5vw,48px)]'">
                    {{ gallery.title }}
                </h3>

                <p v-if="gallery.description" class="gallery-des opacity-80 mt-2 mb-4 max-w-prose">
                    {{ gallery.description }}
                </p>

                <!-- Kategorie-Filter -->
                <div class="cat-filter flex flex-wrap items-center justify-center gap-2.5 mt-2">
                    <!-- Alle -->
                    <button class="chip appearance-none border border-white/25 bg-transparent rounded-full
                               px-3 py-1.5 text-[13px] leading-none cursor-pointer
                               transition-all duration-200 hover:border-white/45 hover:-translate-y-0.5
                               focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
                        :class="{ 'bg-white/10 border-white/60 text-primary': selectedIds.size === 0 }"
                        @click="clearFilter()" type="button" :aria-pressed="selectedIds.size === 0 ? 'true' : 'false'"
                        :aria-label="`Alle Kategorien (${totalCount})`">
                        Alle ({{ totalCount }})
                    </button>

                    <!-- Einzelne Kategorien -->
                    <button v-for="cat in categories" :key="cat.id" class="chip appearance-none border border-white/25 bg-transparent rounded-full
                               px-3 py-1.5 text-[13px] leading-none cursor-pointer
                               transition-all duration-200 hover:border-white/45 hover:-translate-y-0.5
                               focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
                        :class="{ 'bg-white/10 border-white/60 text-primary': selectedIds.has(cat.id) }"
                        @click="toggleCat(cat.id)" type="button" :title="cat.slug"
                        :aria-pressed="selectedIds.has(cat.id) ? 'true' : 'false'"
                        :aria-label="`${cat.name} (${cat.count})`">
                        {{ cat.name }} ({{ cat.count }})
                    </button>
                </div>
            </div>

            <!-- Grid (TransitionGroup mit Hooks) -->
            <TransitionGroup tag="div" class="masonry-grid columns-1 sm:columns-2 lg:columns-3 gap-5"
                @before-enter="onBeforeEnter" @enter="onEnter" @after-enter="onAfterEnter" @leave="onLeave"
                aria-live="polite">
                <div v-for="(img, index) in filteredImages" :key="img.key" class="masonry-item break-inside-avoid mb-5 cursor-pointer overflow-hidden rounded
                           transition-transform duration-300 hover:scale-[1.02]" @click="openLightbox(index)"
                    role="button" tabindex="0" @keydown.enter.prevent="openLightbox(index)"
                    @keydown.space.prevent="openLightbox(index)" :aria-label="img.alt">
                    <!-- Thumbs: erste 6 eager, Rest lazy -->
                    <img :src="img.src" :alt="img.alt" :loading="index < 6 ? 'eager' : 'lazy'" decoding="async"
                        class="w-full h-auto block rounded" />
                </div>
            </TransitionGroup>

            <!-- Kein Treffer -->
            <p v-if="filteredImages.length === 0" class="opacity-70 py-3 text-white text-center">
                Keine Bilder für die aktuelle Auswahl.
            </p>
        </div>

        <!-- Lightbox -->
        <Transition name="fade">
            <div v-if="lightboxIndex !== null" ref="lightboxEl"
                class="lightbox fixed inset-0 bg-black/95 z-220 flex items-center justify-center p-6 sm:p-10"
                role="dialog" aria-modal="true" :aria-label="lightboxAriaLabel" @keydown="onLightboxKeydown"
                @click="closeLightbox">
                <button ref="closeBtn" class="lightbox-close absolute top-4 right-4 sm:top-5 sm:right-5 text-white
                           text-[40px] sm:text-[48px] leading-none opacity-80 transition-opacity duration-300
                           hover:opacity-100 focus-visible:outline-none focus-visible:ring-2
                           focus-visible:ring-white/80 rounded" @click.stop="closeLightbox" aria-label="Schließen">
                    ×
                </button>

                <button v-if="lightboxIndex > 0" ref="prevBtn" class="lightbox-prev absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 text-white
                           text-[40px] sm:text-[48px] px-4 sm:px-5 py-4 sm:py-5 opacity-70
                           transition-opacity duration-300 hover:opacity-100 rounded bg-white/10
                           focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
                    @click.stop="prevImage" aria-label="Vorheriges Bild">
                    ‹
                </button>

                <!-- Lightbox-Bild: nie lazy -->
                <img v-if="currentLightboxImage" :src="currentLightboxImage.src" :alt="currentLightboxImage.alt"
                    class="max-w-[92%] sm:max-w-[90%] max-h-[85vh] sm:max-h-[90%] object-contain" decoding="async"
                    @click.stop />

                <button v-if="lightboxIndex < filteredImages.length - 1" ref="nextBtn" class="lightbox-next absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 text-white
                           text-[40px] sm:text-[48px] px-4 sm:px-5 py-4 sm:py-5 opacity-70
                           transition-opacity duration-300 hover:opacity-100 rounded bg-white/10
                           focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
                    @click.stop="nextImage" aria-label="Nächstes Bild">
                    ›
                </button>
            </div>
        </Transition>
    </div>
</template>

<script setup lang="ts">
import { computed, ref, onUnmounted, watch, nextTick } from 'vue'
import type { GalleryShowResponse } from '@/types'
import { mediaDownloadUrl } from '@/lib/api'

const props = defineProps<{ gallery: GalleryShowResponse }>()
defineEmits(['close'])

/* Safe-Area / Abstände */
const topSafe = 'max(0.75rem, env(safe-area-inset-top))' // Close-Button Y
const topPadding = `calc(${topSafe} + 2.75rem)`          // Inhalt-Start (Platz für Close)

/* Typen */
type Cat = { id: number; name: string; slug: string; parent_id?: number | null }
type ImageWithCats = {
    id: number
    media: { id: number; uuid: string; title?: string; current_version?: { path: string; width: number; height: number; mime_type: string } }
    categories?: Cat[]
}

/** Vollständige Bildliste (ungefiltert) */
const allImages = computed(() => {
    const imgs = (props.gallery.images ?? []) as unknown as ImageWithCats[]
    return imgs.map((gi, idx) => ({
        key: gi.id,
        alt: `${props.gallery.title} #${idx + 1}`,
        src: mediaDownloadUrl(gi.media.id),
        catIds: new Set((gi.categories ?? []).map(c => c.id)),
        rawCats: gi.categories ?? [],
    }))
})

/** Kategorien-Aggregation (unique + count) */
const categories = computed(() => {
    const map = new Map<number, { id: number; name: string; slug: string; count: number }>()
    for (const img of allImages.value) {
        for (const c of img.rawCats) {
            const cur = map.get(c.id)
            if (cur) cur.count++
            else map.set(c.id, { id: c.id, name: c.name, slug: c.slug, count: 1 })
        }
    }
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name, 'de'))
})

const totalCount = computed(() => allImages.value.length)

/** Filter-State */
const selectedIds = ref<Set<number>>(new Set())
function clearFilter() { selectedIds.value = new Set() }
function toggleCat(id: number) {
    const s = new Set(selectedIds.value)
    s.has(id) ? s.delete(id) : s.add(id)
    selectedIds.value = s
}

/** Gefilterte Liste (OR-Logik) */
const filteredImages = computed(() => {
    const sel = selectedIds.value
    if (sel.size === 0) return allImages.value
    return allImages.value.filter(img => {
        for (const id of sel) if (img.catIds.has(id)) return true
        return false
    })
})

/** Lightbox */
const lightboxIndex = ref<number | null>(null)
const currentLightboxImage = computed(() => {
    if (lightboxIndex.value === null) return null
    return filteredImages.value[lightboxIndex.value] ?? null
})

/* A11y: Focus-Management + Focus-Trap + Scroll-Lock */
const lightboxEl = ref<HTMLElement | null>(null)
const closeBtn = ref<HTMLButtonElement | null>(null)
const prevBtn = ref<HTMLButtonElement | null>(null)
const nextBtn = ref<HTMLButtonElement | null>(null)
const previouslyFocused = ref<HTMLElement | null>(null)
let prevBodyOverflow: string | null = null

const lightboxAriaLabel = computed(() =>
    currentLightboxImage.value
        ? `Bildanzeige: ${currentLightboxImage.value.alt}`
        : 'Bildanzeige'
)

const openLightbox = async (index: number) => {
    previouslyFocused.value = document.activeElement as HTMLElement | null
    lightboxIndex.value = index
    // Scroll sperren (Seiten-Hintergrund)
    prevBodyOverflow = document.body.style.overflow || ''
    document.body.style.overflow = 'hidden'
    await nextTick()
    // Sicheres Fokussieren
    if (closeBtn.value) closeBtn.value.focus()
}

const closeLightbox = () => {
    lightboxIndex.value = null
    if (prevBodyOverflow !== null) document.body.style.overflow = prevBodyOverflow
    prevBodyOverflow = null
    const el = previouslyFocused.value
    if (el && typeof (el as any).focus === 'function') el.focus()
}

const prevImage = () => { if (lightboxIndex.value !== null && lightboxIndex.value > 0) lightboxIndex.value-- }
const nextImage = () => {
    if (lightboxIndex.value !== null && lightboxIndex.value < filteredImages.value.length - 1) lightboxIndex.value++
}

/* Focus-Trap in der Lightbox */
function onLightboxKeydown(e: KeyboardEvent) {
    if (lightboxIndex.value === null) return
    if (e.key === 'Escape') { e.preventDefault(); closeLightbox(); return }
    if (e.key === 'Tab') {
        const focusables = [closeBtn.value, prevBtn.value, nextBtn.value].filter(Boolean) as HTMLElement[]
        if (focusables.length === 0) return
        const currentIdx = Math.max(0, focusables.indexOf(document.activeElement as HTMLElement))
        const nextIdx = e.shiftKey
            ? (currentIdx - 1 + focusables.length) % focusables.length
            : (currentIdx + 1) % focusables.length
        e.preventDefault()
        const el = focusables[nextIdx]
        if (el && typeof el.focus === 'function') el.focus()
    }
}

/** Keyboard navigation (außerhalb Dialog-Fokusfalle) */
const handleKeyPress = (_e: KeyboardEvent) => { /* noop wenn Lightbox offen */ }
if (typeof window !== 'undefined') window.addEventListener('keydown', handleKeyPress)
onUnmounted(() => { if (typeof window !== 'undefined') window.removeEventListener('keydown', handleKeyPress) })

watch(filteredImages, (list) => {
    if (lightboxIndex.value !== null && (lightboxIndex.value < 0 || lightboxIndex.value >= list.length)) {
        lightboxIndex.value = null
        if (prevBodyOverflow !== null) { document.body.style.overflow = prevBodyOverflow; prevBodyOverflow = null }
    }
})

/* =========================
   TransitionGroup Hooks (Masonry + sanfte Transitions)
   ========================= */
function addEnterClasses(el: HTMLElement) {
    el.classList.add('opacity-0', 'translate-y-1.5', 'scale-95', 'transition', 'duration-200', 'ease-out')
}
function activateEnter(el: HTMLElement) {
    void el.offsetHeight
    el.classList.remove('opacity-0', 'translate-y-1.5', 'scale-95')
    el.classList.add('opacity-100', 'translate-y-0', 'scale-100')
}
function cleanupTransition(el: HTMLElement) {
    el.classList.remove(
        'transition', 'duration-200', 'ease-out',
        'opacity-0', 'opacity-100',
        'translate-y-1.5', 'translate-y-0',
        'scale-95', 'scale-100'
    )
}
function onBeforeEnter(el: Element) { addEnterClasses(el as HTMLElement) }
function onEnter(el: Element, done: () => void) {
    const node = el as HTMLElement
    activateEnter(node)
    setTimeout(() => { cleanupTransition(node); done() }, 220)
}
function onAfterEnter(el: Element) { cleanupTransition(el as HTMLElement) }

/** Leave: kurz Höhe fixen, weil CSS columns sonst neu fließen */
function onLeave(el: Element, done: () => void) {
    const node = el as HTMLElement
    const h = node.offsetHeight
    node.style.height = h + 'px'
    node.style.willChange = 'opacity, transform, height'
    node.classList.add('transition', 'duration-200', 'ease-out')
    void node.offsetHeight
    node.classList.add('opacity-0', 'translate-y-1.5', 'scale-95')
    node.style.height = '0px'
    node.style.overflow = 'hidden'
    setTimeout(() => {
        node.classList.remove('transition', 'duration-200', 'ease-out', 'opacity-0', 'translate-y-1.5', 'scale-95')
        node.style.height = ''
        node.style.willChange = ''
        node.style.overflow = ''
        done()
    }, 230)
}
</script>
