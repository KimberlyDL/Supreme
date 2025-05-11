<!-- frontend\src\components\shared\BaseButton.vue -->
<template>
    <button :class="[
        'px-4 py-2 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2',
        variantClasses,
        sizeClasses,
        { 'opacity-50 cursor-not-allowed': disabled }
    ]" :disabled="disabled" @click="$emit('click')">
        <slot></slot>
    </button>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
    variant: {
        type: String,
        default: 'primary',
        validator: (value) => ['primary', 'secondary', 'accent', 'outline', 'ghost'].includes(value)
    },
    size: {
        type: String,
        default: 'md',
        validator: (value) => ['sm', 'md', 'lg'].includes(value)
    },
    disabled: {
        type: Boolean,
        default: false
    }
})

const variantClasses = computed(() => {
    switch (props.variant) {
        case 'primary':
            return 'bg-primary-500 hover:bg-primary-600 text-white focus:ring-primary-500'
        case 'secondary':
            return 'bg-secondary-500 hover:bg-secondary-600 text-white focus:ring-secondary-500'
        case 'accent':
            return 'bg-accent-500 hover:bg-accent-600 text-white focus:ring-accent-500'
        case 'outline':
            return 'bg-transparent border border-primary-500 text-primary-500 hover:bg-primary-50 focus:ring-primary-500'
        case 'ghost':
            return 'bg-transparent hover:bg-bgPrimary-100 text-tBase-500 focus:ring-bgPrimary-500'
        default:
            return 'bg-primary-500 hover:bg-primary-600 text-white focus:ring-primary-500'
    }
})

const sizeClasses = computed(() => {
    switch (props.size) {
        case 'sm':
            return 'text-sm py-1 px-3'
        case 'md':
            return 'text-base py-2 px-4'
        case 'lg':
            return 'text-lg py-3 px-6'
        default:
            return 'text-base py-2 px-4'
    }
})

defineEmits(['click'])
</script>