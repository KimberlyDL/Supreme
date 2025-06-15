<template>
    <div class="mb-8">
        <div class="flex items-center justify-between mb-4">
            <h2 class="text-2xl font-bold text-tBase-100 flex items-center">
                <Tag class="h-6 w-6 mr-2 text-red-500" />
                Special Offers
            </h2>
            <button v-if="offers.length > 4" @click="showAll = !showAll"
                class="text-primary-600 hover:text-primary-700 text-sm font-medium">
                {{ showAll ? 'Show Less' : 'View All' }}
            </button>
        </div>

        <div v-if="offers.length === 0" class="text-center py-8 bg-bgSecondary-0 rounded-lg">
            <Tag class="h-12 w-12 mx-auto text-gray-400 mb-2" />
            <p class="text-tBase-60">No special offers available at the moment</p>
        </div>

        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div v-for="(product, index) in displayedOffers" :key="product.id"
                class="relative bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
                <!-- Offer Badge -->
                <div class="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    {{ getDiscountPercentage(product) }}% OFF
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
                    <span class="text-lg font-bold text-red-600">
                        {{ formatCurrency(getSalePrice(product)) }}
                    </span>
                    <span class="text-sm line-through text-tBase-60">
                        {{ formatCurrency(getRegularPrice(product)) }}
                    </span>
                </div>

                <!-- Offer Details -->
                <div class="text-xs text-tBase-80 mb-3">
                    <div v-if="getOfferEndDate(product)" class="flex items-center">
                        <Clock class="h-3 w-3 mr-1" />
                        Ends {{ formatOrderDate(getOfferEndDate(product)) }}
                    </div>
                </div>

                <!-- Add to Cart Button -->
                <button @click="$emit('add-to-cart', product)"
                    class="w-full bg-red-500 hover:bg-red-600 text-white text-sm font-medium py-2 rounded-md transition-colors duration-200"
                    :disabled="!isInStock(product)">
                    {{ isInStock(product) ? 'Add to Cart' : 'Out of Stock' }}
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Tag, Clock } from 'lucide-vue-next'
import { formatCurrency, isVarietyOnSale, formatOrderDate } from '@/utils/productUtils'

const props = defineProps({
    products: {
        type: Array,
        required: true,
    },
})

const emit = defineEmits(['add-to-cart'])

const showAll = ref(false)

const offers = computed(() => {
    return props.products.filter(product => {
        return product.varieties.some(variety => isVarietyOnSale(variety))
    }).sort((a, b) => {
        // Sort by discount percentage (highest first)
        const discountA = getDiscountPercentage(a)
        const discountB = getDiscountPercentage(b)
        return discountB - discountA
    })
})

const displayedOffers = computed(() => {
    return showAll.value ? offers.value : offers.value.slice(0, 4)
})

function getDiscountPercentage(product) {
    const variety = product.varieties.find(v => isVarietyOnSale(v))
    if (!variety || !variety.sale) return 0

    const discount = ((variety.price - variety.sale.salePrice) / variety.price) * 100
    return Math.round(discount)
}

function getSalePrice(product) {
    const variety = product.varieties.find(v => isVarietyOnSale(v))
    return variety?.sale?.salePrice || variety?.price || 0
}

function getRegularPrice(product) {
    const variety = product.varieties.find(v => isVarietyOnSale(v))
    return variety?.price || 0
}

function getOfferEndDate(product) {
    const variety = product.varieties.find(v => isVarietyOnSale(v))
    return variety?.sale?.endDate?.seconds
}

function isInStock(product) {
    return product.varieties.some(v => (v.stockQuantity || 0) > 0)
}
</script>
