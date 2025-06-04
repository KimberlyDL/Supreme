<!-- frontend\src\components\settings\NotifcationToggle.vue -->
<template>
    <div class="flex items-center justify-between">
        <div class="flex-1">
            <h4 class="text-sm font-medium text-gray-900 dark:text-white">{{ title }}</h4>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">{{ description }}</p>
        </div>

        <button @click="toggle" :class="[
            'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
            modelValue ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'
        ]">
            <span :class="[
                'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                modelValue ? 'translate-x-6' : 'translate-x-1'
            ]" />
        </button>
    </div>
</template>

<script setup>
const props = defineProps({
    modelValue: Boolean,
    title: String,
    description: String
})

const emit = defineEmits(['update:modelValue'])

const toggle = () => {
    emit('update:modelValue', !props.modelValue)
}
</script>
