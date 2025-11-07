<!-- components/LegalOverlay.vue -->
<template>
    <OverlayShell :open="true" @close="handleClose">
        <CloseXButton ariaLabel="close" @click="handleClose" class="z-999" />

        <ModalCard>
            <template #header>
                <h2 class="text-2xl font-bold text-white">
                    {{ page?.title || slug }}
                </h2>
            </template>

            <!-- Body scrollt -->
            <div class="prose prose-invert max-w-none whitespace-pre-wrap">
                {{ page?.content || '—' }}
            </div>
        </ModalCard>
    </OverlayShell>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import OverlayShell from '@/components/ui/OverlayShell.vue'
import CloseXButton from '@/components/ui/CloseXButton.vue'
import ModalCard from '@/components/ui/ModalCard.vue'
import { api } from '@/lib/api'
import type { LegalPageDto } from '@/types'

const props = defineProps<{ slug: 'impressum' | 'datenschutz' }>()
const emit = defineEmits<{ (e: 'close'): void }>()
const router = useRouter()
const page = ref<LegalPageDto | null>(null)

async function load() { try { page.value = await api.getLegal(props.slug) } catch { page.value = null } }
function handleClose() { emit('close'); router.replace('/') }

onMounted(load)
watch(() => props.slug, load)
</script>
