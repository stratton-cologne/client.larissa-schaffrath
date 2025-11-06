<template>
    <div class="language-switcher">
        <button v-for="lang in languages" :key="lang" :class="{ active: currentLocale === lang }"
            @click="switchLanguage(lang)" class="lang-btn">
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

const switchLanguage = (lang: string) => {
    locale.value = lang
}
</script>

<style scoped>
.language-switcher {
    position: fixed;
    bottom: 40px;
    right: 40px;
    display: flex;
    gap: 10px;
    z-index: 50;
}

.lang-btn {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: white;
    padding: 8px 16px;
    font-size: 12px;
    font-weight: 500;
    letter-spacing: 1px;
    cursor: pointer;
    border-radius: 4px;
    transition: all 0.3s;
    backdrop-filter: blur(10px);
}

.lang-btn:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.4);
}

.lang-btn.active {
    background: white;
    color: #171717;
    border-color: white;
}

@media (max-width: 768px) {
    .language-switcher {
        bottom: 20px;
        right: 20px;
    }

    .lang-btn {
        padding: 6px 12px;
        font-size: 11px;
    }
}
</style>
