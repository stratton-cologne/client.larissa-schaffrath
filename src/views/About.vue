<!-- src/views/About.vue -->
<template>
    <!-- Overlay + Close identisch wie in Contact -->
    <OverlayShell :open="isVisible" @close="$emit('close')" aria-label="Über mich">
        <!-- fester Close oben rechts, hohe Ebene -->
        <CloseXButton :ariaLabel="t('common.close')" :ariaControls="'about-modal'" @click="$emit('close')" />

        <!-- Karten-Layout identisch zu Contact -->
        <ModalCard>
            <template #header>
                <!-- Accessible Headline (visually hidden, für aria-controls) -->
                <h2 id="about-modal" class="sr-only">Über</h2>
            </template>

            <!-- Inhalt: ProfileCard liefert Avatar, Name, Subtitle, Description, Footer -->
            <ProfileCard :img="profileImg" :name="profileName" :subtitle="profileSubtitle">
                <!-- Beschreibung (unverändert) -->
                <template #description>
                    {{ portfolio?.about || t('about.description') }}
                </template>

                <!-- Footer/Links (unverändert) -->
                <template #footer>
                    <SocialLinksInline :items="socialItems" />
                </template>
            </ProfileCard>
        </ModalCard>
    </OverlayShell>
</template>

<script setup lang="ts">
/**
 * About-View:
 * - identisches Overlay- und Karten-Gerüst wie Contact
 * - CloseXButton z-index/pointer-events fix
 * - ProfileCard rendert Avatar NICHT beschnitten (object-contain)
 * - Inhalte (Description/Footer) bleiben über Slots erhalten
 */
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import OverlayShell from '@/components/ui/OverlayShell.vue'
import CloseXButton from '@/components/ui/CloseXButton.vue'
import ModalCard from '@/components/ui/ModalCard.vue'
import SocialLinksInline from '@/components/ui/SocialLinksInline.vue'
import ProfileCard from '@/components/about/ProfileCard.vue'
import fallbackImg from '@/assets/image/portfolio-image.png'
import type { PortfolioDto } from '@/types'
import { mediaDownloadUrl } from '@/lib/api'

const { t } = useI18n()

const props = defineProps<{
    isVisible: boolean
    portfolio: PortfolioDto & { avatarUrl?: string | null }
}>()

defineEmits(['close'])

/** Avatar-URL robust ermitteln (Normalized URL → Media → Fallback) */
const profileImg = computed<string>(() => {
    const fromNormalized = props.portfolio?.avatarUrl
    if (fromNormalized) return fromNormalized
    const mediaId = props.portfolio?.avatar?.id
    const version = props.portfolio?.avatar?.currentVersion?.version
    if (typeof mediaId === 'number') {
        return mediaDownloadUrl(mediaId, typeof version === 'number' ? version : undefined)
    }
    return fallbackImg
})

/** Name & Untertitel (robust mit Fallback) */
const profileName = computed<string>(() => props.portfolio?.name ?? '—')
const profileSubtitle = computed<string>(() =>
    props.portfolio?.tagline ?? (t('about.subtitle') || 'portraits')
)

/** Social-Links (unverändert, nur robust zusammengesetzt) */
const socialKeys = ['instagram', 'flickr', 'facebook', 'twitter'] as const
const socialItems = computed(() =>
    socialKeys.map((k) => ({
        label: t(`about.social.${k}`),              // Achtung: wenn Keys fehlen, werden sie so angezeigt
        href: props.portfolio?.socials?.[k] || '#', // besser: optional ausblenden, wenn kein Link vorhanden
    }))
)
</script>
