<template>
    <div class="mb-6">
        <h3 class="text-lg font-semibold mb-3">Categories</h3>
        <div class="flex flex-wrap gap-2">
            <button v-for="category in categories" :key="category" @click="selectCategory(category)"
                class="px-3 py-1 rounded-full text-sm font-medium transition-colors duration-200" :class="[
                    selectedCategory === category
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                ]">
                {{ category }}
            </button>
        </div>
    </div>
</template>
<script setup>
import { defineProps, defineEmits } from "vue"

const props = defineProps({
    categories: {
        type: Array,
        required: true,
    },
    selectedCategory: {
        type: String,
        default: "All",
    },
})

const emit = defineEmits(["select-category"])

function selectCategory(category) {
    emit("select-category", category)
}
</script>
