<template>
    <!-- Language Switcher -->
    <LanguageSwitcher />

    <div class="app-root bg-[#1a1a1a]">
        <!-- Perspektive MUSS auf dem Parent liegen -->
        <div class="stage">

        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'

import LanguageSwitcher from '@/components/ui/LanguageSwitcher.vue'

</script>

<style scoped></style>
