<template>
    <OverlayShell :open="isVisible" @close="$emit('close')">
        <CloseXButton :ariaLabel="t('common.close')" @click="$emit('close')" />

        <ModalCard>
            <ProfileCard :img="profileImg" :name="profileName" :subtitle="profileSubtitle">
                <template #description>
                    {{ portfolio?.about || t('about.description') }}
                </template>

                <template #footer>
                    <SocialLinksInline :items="socialItems" />
                </template>
            </ProfileCard>
        </ModalCard>
    </OverlayShell>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

// Shell & UI
import OverlayShell from '@/components/ui/OverlayShell.vue'
import CloseXButton from '@/components/ui/CloseXButton.vue'
import ModalCard from '@/components/ui/ModalCard.vue'
import SocialLinksInline from '@/components/ui/SocialLinksInline.vue'

// About-specific
import ProfileCard from '@/components/about/ProfileCard.vue'

// Fallback-Bild
import fallbackImg from '@/assets/image/portfolio-image.png'

// Typen + Helper
import type { PortfolioDto } from '@/types'
import { mediaDownloadUrl } from '@/lib/api'

const { t } = useI18n()

/** HINWEIS:
 * api.getPortfolio() liefert bei dir jetzt ein erweitertes Objekt mit { avatarUrl }.
 * Damit TS happy ist, erlauben wir avatarUrl optional in der Prop.
 */
const props = defineProps<{ isVisible: boolean; portfolio: PortfolioDto & { avatarUrl?: string | null } }>()
defineEmits(['close'])

/** Bestmögliche Bildquelle:
 * 1) Normalisierte avatarUrl vom API-Client
 * 2) Fallback: aus avatar.id (+ optionaler Version) zusammensetzen
 * 3) Fallback: lokales Bild
 */
const profileImg = computed(() => {
    const fromNormalized = props.portfolio?.avatarUrl
    if (fromNormalized) return fromNormalized

    const mediaId = props.portfolio?.avatar?.id
    const version = props.portfolio?.avatar?.currentVersion?.version
    if (typeof mediaId === 'number') {
        return mediaDownloadUrl(mediaId, typeof version === 'number' ? version : undefined)
    }

    return fallbackImg
})

// Name + Subtitle mit harten string-Fallbacks, damit die Props strikt `string` bleiben
const profileName = computed(() => props.portfolio?.name ?? '—')
const profileSubtitle = computed(() => props.portfolio?.tagline ?? (t('about.subtitle') || 'portraits'))

// Socials
const socialKeys = ['instagram', 'flickr', 'facebook', 'twitter'] as const
const socialItems = computed(() =>
    socialKeys.map((k) => ({
        label: t(`about.social.${k}`),
        href: props.portfolio?.socials?.[k] || '#',
    })),
)
</script>
