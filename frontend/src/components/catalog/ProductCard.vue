<!-- frontend\src\components\catalog\ProductCard.vue -->
<template>
    <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
        <!-- Product Image -->
        <div class="relative h-48 bg-gray-100">
            <img :src="productImage" :alt="product.name" class="w-full h-full object-cover" @error="handleImageError" />

            <!-- Badges at top -->
            <div class="absolute top-2 right-2 flex flex-col gap-1">
                <!-- Sale Badge -->
                <div v-if="isOnSale" class="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                    SALE
                </div>

                <!-- Low Stock Badge -->
                <div v-if="isLowStock && !isOutOfStock"
                    class="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded">
                    LOW STOCK
                </div>

                <!-- Out of Stock Badge -->
                <div v-if="isOutOfStock" class="bg-gray-500 text-white text-xs font-bold px-2 py-1 rounded">
                    OUT OF STOCK
                </div>
            </div>
        </div>

        <!-- Product Info -->
        <div class="p-4">
            <h3 class="text-lg font-semibold text-gray-800 mb-1">{{ product.name }}</h3>

            <!-- Varieties Info -->
            <div class="text-xs text-gray-500 mb-2">
                {{ product.varieties.length }} varieties available
            </div>

            <!-- Stock Info -->
            <div class="text-sm text-gray-700 mb-2">
                Stock: {{ selectedVariety.stockQuantity || 0 }}
            </div>

            <!-- Rating & Purchases (placeholder for future feature) -->
            <div class="flex items-center mb-3">
                <div class="flex items-center">
                    <span class="text-yellow-400">★★★★</span><span class="text-gray-300">★</span>
                    <span class="text-xs text-gray-500 ml-1">4.0</span>
                </div>
                <span class="text-xs text-gray-500 ml-2">
                    (0 sold)
                </span>
            </div>

            <!-- Sale Info -->
            <div v-if="saleInfo" class="mb-3 text-xs">
                <div
                    :class="{ 'text-green-600': saleInfo.status === 'active', 'text-blue-600': saleInfo.status === 'upcoming', 'text-gray-500': saleInfo.status === 'expired' }">
                    {{ saleInfo.message }}
                </div>
                <div v-if="saleInfo.status !== 'expired'" class="text-gray-500">
                    {{ formatDateTime(saleInfo.endDate) }}
                </div>
            </div>

            <!-- Price Display -->
            <div class="flex items-center mb-3">
                <!-- Sale price on the left (always in the same position) -->
                <span class="text-lg font-bold text-primary-600">
                    {{ formatCurrency(isOnSale ? salePrice : regularPrice) }}
                </span>

                <!-- Original price on the right when on sale -->
                <span v-if="isOnSale" class="ml-2 text-sm line-through text-gray-500">
                    {{ formatCurrency(regularPrice) }}
                </span>
            </div>

            <!-- Add to Cart Button -->
            <button @click="addToCart"
                class="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-300"
                :disabled="!isInStock" :class="{ 'opacity-50 cursor-not-allowed': !isInStock }">
                {{ isInStock ? 'Add to Cart' : 'Out of Stock' }}
            </button>
        </div>
    </div>
</template>
<script setup>
import { ref, computed, onMounted } from "vue"
import {
    formatCurrency,
    isVarietyOnSale,
    getSaleStatus,
    formatDateTime,
} from "@/utils/productUtils"

const props = defineProps({
    product: {
        type: Object,
        required: true,
    },
})

const emit = defineEmits(["add-to-cart"])

// State
const selectedVarietyId = ref("")
const imageError = ref(false)

// Computed properties
const selectedVariety = computed(() => {
    return props.product.varieties.find((v) => v.id === selectedVarietyId.value) || props.product.varieties[0]
})

const regularPrice = computed(() => {
    return selectedVariety.value?.price || 0
})

const salePrice = computed(() => {
    return selectedVariety.value?.sale?.salePrice || 0
})

const isOnSale = computed(() => {
    return isVarietyOnSale(selectedVariety.value)
})

const saleInfo = computed(() => {
    return getSaleStatus(selectedVariety.value)
})

const isInStock = computed(() => {
    return (selectedVariety.value?.stockQuantity || 0) > 0
})

const isLowStock = computed(() => {
    const quantity = selectedVariety.value?.stockQuantity || 0
    return quantity > 0 && quantity <= 5
})

const isOutOfStock = computed(() => {
    return (selectedVariety.value?.stockQuantity || 0) <= 0
})

const productImage = computed(() => {
    if (imageError.value) {
        return "/placeholder.svg?height=200&width=200"
    }
    return props.product.imageUrl || "/placeholder.svg?height=200&width=200"
})

// Methods
function handleImageError() {
    imageError.value = true
}

function getVarietyPrice(variety) {
    return isVarietyOnSale(variety) ? variety.sale.salePrice : variety.price
}

function addToCart() {
    if (!isInStock.value) return

    emit("add-to-cart", {
        productId: props.product.id,
        productName: props.product.name,
        // varietyId: selectedVariety.value.id,
        // varietyName: selectedVariety.value.name,
        varietyId: selectedVarietyId.value.id,
        variety: selectedVariety.value,
        price: isOnSale.value ? salePrice.value : regularPrice.value,
        quantity: 1,
        unit: selectedVariety.value.unit || "piece",
    })
}

// Lifecycle hooks
onMounted(() => {
    // Set the default selected variety
    if (props.product.varieties.length > 0) {
        // Try to find the default variety first
        const defaultVariety = props.product.varieties.find((v) => v.isDefault)
        selectedVarietyId.value = defaultVariety ? defaultVariety.id : props.product.varieties[0].id
    }
})
</script>