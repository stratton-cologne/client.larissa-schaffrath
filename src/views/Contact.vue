<template>
    <OverlayShell :open="isVisible" @close="$emit('close')">
        <CloseXButton :ariaLabel="t('common.close')" @click="$emit('close')" />

        <div class="w-full px-6">
            <div class="mx-auto w-full max-w-[970px] text-white">
                <!-- FORM -->
                <form v-if="!submitted" id="email-form" name="email-form"
                    class="w-full text-2xl md:text-3xl font-[Poppins,Arial,sans-serif] space-y-10"
                    @submit.prevent="handleSubmit">
                    <!-- Row 1 -->
                    <div class="flex flex-wrap items-baseline gap-x-3 gap-y-10">
                        <span>{{ contact?.headline || t('contact.intro') }}</span>
                        <label class="sr-only" for="email">{{ t('contact.placeholders.email') }}</label>
                        <DottedInput id="email" v-model="formData.email" type="email" name="email" inputmode="email"
                            autocomplete="email" required :placeholder="t('contact.placeholders.email')" />
                    </div>

                    <!-- Row 2 -->
                    <div class="flex items-baseline gap-x-3">
                        <span>{{ contact?.subline || t('contact.name') }}</span>
                        <DottedInput id="name" v-model="formData.name" type="text" name="name" autocomplete="name"
                            spellcheck="false" required :placeholder="t('contact.placeholders.name')" />
                        <span class="sr-only">spacer</span>
                    </div>

                    <!-- Row 3 -->
                    <div class="flex items-baseline gap-x-3">
                        <span>{{ contact?.interest_label || t('contact.interest') }}</span>

                        <DottedSelect v-model="formData.interest" name="interest" required>
                            <!-- KEIN selected hier – v-model steuert -->
                            <option disabled value="">{{ t('contact.placeholders.select') }}</option>
                            <option v-for="(opt, i) in interestOptions" :key="i" :value="opt">{{ opt }}</option>
                        </DottedSelect>

                        <SubmitUnderlineButton type="submit" :disabled="isSubmitDisabled">
                            {{ t('contact.send') }}
                        </SubmitUnderlineButton>
                    </div>
                </form>

                <!-- Error -->
                <p v-if="hasError" class="mt-6 text-base text-red-400/80" aria-live="polite" role="status">
                    {{ t('contact.error') }}
                </p>

                <!-- Success -->
                <p v-else-if="submitted" class="mt-6 text-2xl md:text-3xl text-primary" aria-live="polite"
                    role="status">
                    {{ t('contact.success') }}
                </p>

                <!-- Footer -->
                <div class="mt-10 font-indie font-normal text-primary tracking-[0.05em]">
                    <a v-if="contact?.email" class="text-primary hover:underline mr-6"
                        :href="`mailto:${contact.email}`">
                        {{ contact.email }}
                    </a>
                    <a v-if="contact?.phone" class="text-primary hover:underline" :href="`tel:${contact.phone}`">
                        {{ contact.phone }}
                    </a>
                </div>
            </div>
        </div>
    </OverlayShell>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import OverlayShell from '@/components/ui/OverlayShell.vue'
import CloseXButton from '@/components/ui/CloseXButton.vue'
import DottedInput from '@/components/form/DottedInput.vue'
import DottedSelect from '@/components/form/DottedSelect.vue'
import SubmitUnderlineButton from '@/components/form/SubmitUnderlineButton.vue'
import type { ContactDto } from '@/types'

const { t } = useI18n()
const props = defineProps<{ isVisible: boolean; contact: ContactDto }>()
defineEmits(['close'])

const formData = ref({ email: '', name: '', message: '', interest: '' })
const submitted = ref(false)
const hasError = ref(false)

const interestOptions = computed(() =>
    props.contact.interests && props.contact.interests.length
        ? props.contact.interests
        : [
            t('contact.interests.portrait'),
            t('contact.interests.lifestyle'),
            t('contact.interests.editorial'),
            t('contact.interests.wedding'),
            t('contact.interests.couples'),
        ],
)

const isSubmitDisabled = computed(() => {
    const email = String(formData.value.email || '').trim()
    const name = String(formData.value.name || '').trim()
    const interest = String(formData.value.interest || '').trim()
    return !email || !name || !interest
})

const handleSubmit = async () => {
    hasError.value = false
    try {
        // await api.send(formData.value)
        submitted.value = true
        setTimeout(() => {
            submitted.value = false
            formData.value = { email: '', name: '', message: '', interest: '' }
        }, 3000)
    } catch {
        hasError.value = true
        setTimeout(() => (hasError.value = false), 5000)
    }
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: opacity .25s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>
