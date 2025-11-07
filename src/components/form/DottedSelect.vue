<template>
    <select :value="modelValue" @change="onChange" v-bind="$attrs" class="flex-1 min-w-0 appearance-none bg-transparent outline-none border-0 border-b border-dotted border-white/70
           text-white leading-tight focus:border-primary pr-8">
        <slot />
    </select>
</template>

<script setup lang="ts">
defineOptions({ inheritAttrs: false })

const props = defineProps<{
    modelValue: string | number | null
}>()

const emit = defineEmits<{
    (e: 'update:modelValue', v: string | number | null): void
}>()

function onChange(e: Event) {
    const el = e.target as HTMLSelectElement
    emit('update:modelValue', el.value)
}
</script>


