<!-- src/views/Gallery.vue -->
<template>
    <div class="gallery-view w-full min-h-screen h-full overflow-y-scroll bg-[#1a1a1af2] px-10 pb-10 pt-20">
        <CloseXButton :ariaLabel="'close'" @click="$emit('close')" />

        <div class="gallery-container max-w-[1400px] mx-auto">
            <!-- Header -->
            <div class="camera-info mb-10 text-white flex w-full flex-col items-center justify-center">
                <h3
                    class="gallery-name text-primary font-secondary text-5xl font-light tracking-[0.25rem] lowercase mb-2.5">
                    {{ gallery.title }}
                </h3>
                <p v-if="gallery.description" class="gallery-des my-5 opacity-80">
                    {{ gallery.description }}
                </p>

                <!-- Kategorie-Filter -->
                <div class="cat-filter flex flex-wrap gap-2.5 mt-3.5 mb-2">
                    <!-- Alle -->
                    <button
                        class="chip appearance-none border border-white/25 bg-transparent rounded-full px-3 py-1.5 text-[13px] leading-none cursor-pointer transition-all duration-200 hover:border-white/45 hover:-translate-y-0.5"
                        :class="{
                            'bg-white/10 border-white/60 text-primary': selectedIds.size === 0
                        }" @click="clearFilter()" type="button" aria-pressed="true">
                        Alle ({{ totalCount }})
                    </button>

                    <!-- Einzelne Kategorien -->
                    <button v-for="cat in categories" :key="cat.id"
                        class="chip appearance-none border border-white/25 bg-transparent rounded-full px-3 py-1.5 text-[13px] leading-none cursor-pointer transition-all duration-200 hover:border-white/45 hover:-translate-y-0.5"
                        :class="{
                            'bg-white/10 border-white/60 text-primary': selectedIds.has(cat.id)
                        }" @click="toggleCat(cat.id)" type="button" :title="cat.slug"
                        :aria-pressed="selectedIds.has(cat.id)">
                        {{ cat.name }} ({{ cat.count }})
                    </button>
                </div>
            </div>

            <!-- Grid (TransitionGroup mit Hooks) -->
            <TransitionGroup tag="div" class="masonry-grid columns-3 gap-5" @before-enter="onBeforeEnter"
                @enter="onEnter" @after-enter="onAfterEnter" @leave="onLeave">
                <div v-for="(img, index) in filteredImages" :key="img.key"
                    class="masonry-item break-inside-avoid mb-5 cursor-pointer overflow-hidden rounded transition-transform duration-300 hover:scale-[1.02]"
                    @click="openLightbox(index)">
                    <img :src="img.src" :alt="img.alt" loading="lazy" class="w-full h-auto block rounded" />
                </div>
            </TransitionGroup>

            <!-- Kein Treffer -->
            <p v-if="filteredImages.length === 0" class="opacity-70 py-3 text-white">
                Keine Bilder für die aktuelle Auswahl.
            </p>
        </div>

        <!-- Lightbox -->
        <Transition name="fade">
            <div v-if="lightboxIndex !== null"
                class="lightbox fixed inset-0 bg-black/95 z-200 flex items-center justify-center p-10"
                @click="closeLightbox">
                <button
                    class="lightbox-close absolute top-5 right-5 text-white text-[48px] leading-none opacity-80 transition-opacity duration-300 hover:opacity-100"
                    @click.stop="closeLightbox">
                    ×
                </button>

                <button v-if="lightboxIndex > 0"
                    class="lightbox-prev absolute left-5 top-1/2 -translate-y-1/2 text-white text-[48px] px-5 py-5 opacity-70 transition-opacity duration-300 hover:opacity-100 rounded bg-white/10"
                    @click.stop="prevImage">
                    ‹
                </button>

                <img v-if="currentLightboxImage" :src="currentLightboxImage.src" :alt="currentLightboxImage.alt"
                    class="max-w-[90%] max-h-[90%] object-contain" @click.stop />

                <button v-if="lightboxIndex < filteredImages.length - 1"
                    class="lightbox-next absolute right-5 top-1/2 -translate-y-1/2 text-white text-[48px] px-5 py-5 opacity-70 transition-opacity duration-300 hover:opacity-100 rounded bg-white/10"
                    @click.stop="nextImage">
                    ›
                </button>
            </div>
        </Transition>
    </div>
</template>

<script setup lang="ts">
import { computed, ref, onUnmounted, watch } from 'vue'
import CloseXButton from '@/components/ui/CloseXButton.vue'
import type { GalleryShowResponse } from '@/types'
import { mediaDownloadUrl } from '@/lib/api'

const props = defineProps<{ gallery: GalleryShowResponse }>()
defineEmits(['close'])

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
const openLightbox = (index: number) => { lightboxIndex.value = index }
const closeLightbox = () => { lightboxIndex.value = null }
const prevImage = () => { if (lightboxIndex.value !== null && lightboxIndex.value > 0) lightboxIndex.value-- }
const nextImage = () => {
    if (lightboxIndex.value !== null && lightboxIndex.value < filteredImages.value.length - 1) lightboxIndex.value++
}
watch(filteredImages, (list) => {
    if (lightboxIndex.value !== null && (lightboxIndex.value < 0 || lightboxIndex.value >= list.length)) {
        lightboxIndex.value = null
    }
})

/** Keyboard navigation */
const handleKeyPress = (e: KeyboardEvent) => {
    if (lightboxIndex.value === null) return
    if (e.key === 'Escape') closeLightbox()
    else if (e.key === 'ArrowLeft') prevImage()
    else if (e.key === 'ArrowRight') nextImage()
}
if (typeof window !== 'undefined') window.addEventListener('keydown', handleKeyPress)
onUnmounted(() => { if (typeof window !== 'undefined') window.removeEventListener('keydown', handleKeyPress) })

/* =========================
   TransitionGroup Hooks
   – alles via Tailwind-Klassen (Opacity/Transform/Timing)
   – bei Leave zusätzlich kurz Höhe fixen (style.height), da CSS columns sonst das Element sofort neu fließen lässt
   ========================= */
function addEnterClasses(el: HTMLElement) {
    el.classList.add(
        'opacity-0',
        'translate-y-1.5',  // ~6px
        'scale-95',
        'transition',
        'duration-200',
        'ease-out'
    )
}
function activateEnter(el: HTMLElement) {
    // Reflow erzwingen
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

function onBeforeEnter(el: Element) {
    addEnterClasses(el as HTMLElement)
}
function onEnter(el: Element, done: () => void) {
    const node = el as HTMLElement
    activateEnter(node)
    setTimeout(() => { cleanupTransition(node); done() }, 220)
}
function onAfterEnter(el: Element) {
    cleanupTransition(el as HTMLElement)
}

/** Leave: Tailwind für Opacity/Transform/Timing + kurz Höhe fixieren */
function onLeave(el: Element, done: () => void) {
    const node = el as HTMLElement
    const h = node.offsetHeight
    node.style.height = h + 'px'
    node.style.willChange = 'opacity, transform, height'

    // Tailwind-Transition aktivieren
    node.classList.add('transition', 'duration-200', 'ease-out')

    // Reflow
    void node.offsetHeight

    // Zielzustand via Tailwind-Klassen (Opacity/Transform)
    node.classList.add('opacity-0', 'translate-y-1.5', 'scale-95')
    // Höhe kollabieren (inline, da dynamisch)
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
