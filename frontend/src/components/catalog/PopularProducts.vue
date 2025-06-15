<template>
    <div class="mb-8">
        <div class="flex items-center justify-between mb-4">
            <h2 class="text-2xl font-bold text-tBase-100 flex items-center">
                <TrendingUp class="h-6 w-6 mr-2 text-green-500" />
                Most Popular
            </h2>
            <button v-if="popularProducts.length > 4" @click="showAll = !showAll"
                class="text-primary-600 hover:text-primary-700 text-sm font-medium">
                {{ showAll ? 'Show Less' : 'View All' }}
            </button>
        </div>

        <div v-if="popularProducts.length === 0" class="text-center py-8 bg-bgSecondary-0 rounded-lg">
            <TrendingUp class="h-12 w-12 mx-auto text-gray-400 mb-2" />
            <p class="text-tBase-60">No popular products data available</p>
        </div>

        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div v-for="(product, index) in displayedPopular" :key="product.id"
                class="relative bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                <!-- Popularity Rank -->
                <div class="absolute -top-2 -left-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    #{{ index + 1 }}
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

                <!-- Popularity Indicators -->
                <div class="text-xs text-tBase-80 mb-3 space-y-1">
                    <div class="flex items-center">
                        <Star class="h-3 w-3 mr-1 text-yellow-500" />
                        {{ product.popularityScore || 'N/A' }} popularity score
                    </div>
                    <div class="flex items-center">
                        <ShoppingCart class="h-3 w-3 mr-1 text-green-500" />
                        {{ product.totalOrders || 0 }} orders
                    </div>
                </div>

                <!-- Add to Cart Button -->
                <button @click="$emit('add-to-cart', product)"
                    class="w-full bg-green-500 hover:bg-green-600 text-white text-sm font-medium py-2 rounded-md transition-colors duration-200"
                    :disabled="!isInStock(product)">
                    {{ isInStock(product) ? 'Add to Cart' : 'Out of Stock' }}
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { TrendingUp, Star, ShoppingCart } from 'lucide-vue-next'
import { formatCurrency } from '@/utils/productUtils'

const props = defineProps({
    products: {
        type: Array,
        required: true,
    },
})

const emit = defineEmits(['add-to-cart'])

const showAll = ref(false)

const popularProducts = computed(() => {
    return props.products
        .map(product => ({
            ...product,
            // Calculate popularity score based on multiple factors
            popularityScore: calculatePopularityScore(product)
        }))
        .sort((a, b) => b.popularityScore - a.popularityScore)
        .filter(product => product.popularityScore > 0)
})

const displayedPopular = computed(() => {
    return showAll.value ? popularProducts.value : popularProducts.value.slice(0, 4)
})

function calculatePopularityScore(product) {
    let score = 0

    // Factor 1: Stock movement (lower stock = more popular)
    const totalStock = product.varieties.reduce((sum, v) => sum + (v.stockQuantity || 0), 0)
    const maxStock = product.varieties.reduce((sum, v) => sum + (v.maxStock || 100), 0)
    const stockMovement = maxStock - totalStock
    score += stockMovement * 0.3

    // Factor 2: Number of varieties (more varieties = more popular)
    score += product.varieties.length * 10

    // Factor 3: Price range (mid-range products tend to be more popular)
    const avgPrice = product.varieties.reduce((sum, v) => sum + (v.price || 0), 0) / product.varieties.length
    if (avgPrice >= 50 && avgPrice <= 200) {
        score += 20
    }

    // Factor 4: Recently updated products get a boost
    const daysSinceUpdate = (new Date() - new Date(product.updatedAt)) / (1000 * 60 * 60 * 24)
    if (daysSinceUpdate <= 7) {
        score += 15
    }

    // Factor 5: Products with sales get a boost
    const hasActiveSale = product.varieties.some(v => v.sale && new Date(v.sale.endDate) > new Date())
    if (hasActiveSale) {
        score += 25
    }

    return Math.round(score)
}

function getPrice(product) {
    const defaultVariety = product.varieties.find(v => v.isDefault) || product.varieties[0]
    return defaultVariety?.price || 0
}

function isInStock(product) {
    return product.varieties.some(v => (v.stockQuantity || 0) > 0)
}
</script>
