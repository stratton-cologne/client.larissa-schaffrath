<!-- src/components/about/ProfileCard.vue -->
<template>
    <article class="relative w-full max-w-[970px] mx-auto text-white" role="region"
        :aria-label="displayName || 'Profil'">
        <!-- Avatar -->
        <div class="w-full flex justify-center">
            <!--
        Frame: feste Kante für konsistente Optik,
        Bild selbst ohne feste Höhe; object-contain → NICHT beschnitten.
      -->
            <div class="relative inline-flex items-center justify-center
               rounded-xl overflow-hidden
               w-[88px] h-[88px] sm:w-24 sm:h-24 lg:w-28 lg:h-28
               bg-white/10 ring-1 ring-white/15" aria-hidden="true">
                <img v-if="imgSrc" :src="imgSrc" :alt="displayName ? `Portrait von ${displayName}` : 'Portrait'"
                    class="block max-h-full max-w-full h-auto w-auto object-contain" decoding="async"
                    referrerpolicy="no-referrer" />
                <!-- Fallback-Icon, falls kein Bild -->
                <svg v-else class="w-8 h-8 opacity-60" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <circle cx="12" cy="8" r="4" stroke-width="1.5"></circle>
                    <path d="M4 20c0-3.314 3.582-6 8-6s8 2.686 8 6" stroke-width="1.5"></path>
                </svg>
            </div>
        </div>

        <!-- Name + Subtitle -->
        <header class="mt-5 text-center">
            <h1 class="font-secondary text-2xl sm:text-[26px] font-semibold tracking-wide">
                {{ displayName || '—' }}
            </h1>
            <p v-if="subtitle" class="mt-1 text-sm sm:text-base tracking-[0.25em] lowercase opacity-85">
                {{ subtitle }}
            </p>
        </header>

        <!-- Beschreibung -->
        <section class="mt-5 leading-relaxed text-[15px] sm:text-base opacity-90">
            <!-- Slot: description (belässt deinen Text 1:1) -->
            <slot name="description" />
        </section>

        <!-- Footer (Social) -->
        <footer class="mt-6">
            <!-- Slot: footer (z. B. SocialLinksInline) -->
            <slot name="footer" />
        </footer>
    </article>
</template>

<script setup lang="ts">
/**
 * ProfileCard:
 * - Props optional + interne Defaults → keine "Missing required prop"-Warnungen.
 * - Avatar wird NICHT beschnitten (object-contain).
 * - Slots: description, footer unverändert.
 */
import { computed } from 'vue'

const props = withDefaults(defineProps<{
    img?: string
    name?: string
    subtitle?: string
}>(), {
    img: '',      // leer → wir zeigen Fallback-Icon
    name: '',     // leer → Anzeige '—'
    subtitle: ''
})

const imgSrc = computed(() => (props.img && props.img.length > 0 ? props.img : ''))
const displayName = computed(() => props.name?.trim() || '')
</script>
