<!-- components/form/SubmitUnderlineButton.vue -->
<template>
    <button v-bind="$attrs" :class="[
        'ml-auto min-w-[110px] px-4 pb-[3px] leading-tight bg-transparent text-white',
        'transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed',
        underline ? 'border-b border-dotted border-white hover:border-primary' : 'border-0'
    ]">
        <slot />
    </button>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{ underline?: boolean }>(), {
    underline: false,
})
defineOptions({ inheritAttrs: false })
</script>


