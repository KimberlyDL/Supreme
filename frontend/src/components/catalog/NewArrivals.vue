<template>
    <div class="mb-8">
        <div class="flex items-center justify-between mb-4">
            <h2 class="text-2xl font-bold text-tBase-100 flex items-center">
                <Sparkles class="h-6 w-6 mr-2 text-blue-500" />
                New Arrivals
            </h2>
            <button v-if="newArrivals.length > 4" @click="showAll = !showAll"
                class="text-primary-600 hover:text-primary-700 text-sm font-medium">
                {{ showAll ? 'Show Less' : 'View All' }}
            </button>
        </div>

        <div v-if="newArrivals.length === 0" class="text-center py-8 bg-bgSecondary-0 rounded-lg">
            <Sparkles class="h-12 w-12 mx-auto text-gray-400 mb-2" />
            <p class="text-tBase-60">No new arrivals at the moment</p>
        </div>

        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div v-for="product in displayedArrivals" :key="product.id"
                class="relative bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                <!-- New Badge -->
                <div class="absolute -top-2 -right-2 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    NEW
                </div>

                <!-- Product Image -->
                <div class="aspect-square bg-white rounded-lg mb-3 overflow-hidden">
                    <img :src="product.imageUrl || '/placeholder.svg?height=150&width=150'" :alt="product.name"
                        class="w-full h-full object-cover" />
                </div>

                <!-- Product Info -->
                <h3 class="font-semibold text-sm text-tBase-100 mb-1 line-clamp-2">{{ product.name }}</h3>

                <!-- Price -->
                <div class="flex items-center space-x-2 mb-2">
                    <span class="text-lg font-bold text-primary-600">
                        {{ formatCurrency(getPrice(product)) }}
                    </span>
                </div>

                <!-- Arrival Date -->
                <div class="text-xs text-tBase-80 mb-3 flex items-center">
                    <Calendar class="h-3 w-3 mr-1" />
                    Added {{ formatOrderDate(product.createdAt.seconds) }}
                </div>

                <!-- Add to Cart Button -->
                <button @click="$emit('add-to-cart', product)"
                    class="w-full bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium py-2 rounded-md transition-colors duration-200"
                    :disabled="!isInStock(product)">
                    {{ isInStock(product) ? 'Add to Cart' : 'Out of Stock' }}
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Sparkles, Calendar } from 'lucide-vue-next'
import { formatCurrency, formatOrderDate } from '@/utils/productUtils'

const props = defineProps({
    products: {
        type: Array,
        required: true,
    },
})

const emit = defineEmits(['add-to-cart'])

const showAll = ref(false)

// Consider products as "new" if they were created within the last 30 days
const newArrivals = computed(() => {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    return props.products.filter(product => {
        const createdAt = new Date(product.createdAt)
        return createdAt >= thirtyDaysAgo
    }).sort((a, b) => {
        // Sort by creation date (newest first)
        return new Date(b.createdAt) - new Date(a.createdAt)
    })
})

const displayedArrivals = computed(() => {
    return showAll.value ? newArrivals.value : newArrivals.value.slice(0, 4)
})

function getPrice(product) {
    const defaultVariety = product.varieties.find(v => v.isDefault) || product.varieties[0]
    return defaultVariety?.price || 0
}

function isInStock(product) {
    return product.varieties.some(v => (v.stockQuantity || 0) > 0)
}
</script>
