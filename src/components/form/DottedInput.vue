<template>
    <input :value="modelValue" @input="onInput" v-bind="$attrs" class="flex-1 min-w-0 bg-transparent outline-none border-0 border-b border-dotted border-white/70
           text-white leading-tight focus:border-primary" />
</template>

<script setup lang="ts">
defineOptions({ inheritAttrs: false })

const props = defineProps<{
    modelValue: string | number
}>()

const emit = defineEmits<{
    (e: 'update:modelValue', v: string | number): void
}>()

function onInput(e: Event) {
    const el = e.target as HTMLInputElement
    emit('update:modelValue', el.value)
}
</script>


