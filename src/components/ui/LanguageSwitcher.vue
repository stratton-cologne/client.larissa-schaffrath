<template>
    <div
        class="fixed z-50 flex gap-2 md:gap-3 bottom-[max(1rem,env(safe-area-inset-bottom))] right-[max(1rem,env(safe-area-inset-right))]">
        <button v-for="lang in languages" :key="lang" @click="switchLanguage(lang)" class="px-3 py-1.5 md:px-4 md:py-2 text-[11px] md:text-xs font-medium tracking-wide rounded
             bg-white/10 border border-white/20 text-white backdrop-blur-md
             hover:bg-white/20 hover:border-white/40 transition
             data-[active=true]:bg-white data-[active=true]:text-drk-bg data-[active=true]:border-white"
            :data-active="currentLocale === lang">
            {{ lang.toUpperCase() }}
        </button>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
const { locale } = useI18n()
const languages = ['de', 'en']
const currentLocale = computed(() => locale.value)
const switchLanguage = (lang: string) => { locale.value = lang }
</script>
