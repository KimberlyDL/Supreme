<template>
    <div
        class="bg-bgSecondary-0 rounded-lg p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow duration-300">
        <div class="flex items-center space-x-4">
            <!-- Product Image -->
            <div class="flex-shrink-0 w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">
                <img :src="productImage" :alt="product.name" class="w-full h-full object-cover"
                    @error="handleImageError" />
            </div>

            <!-- Product Info -->
            <div class="flex-grow">
                <div class="flex items-start justify-between">
                    <div>
                        <h3 class="text-lg font-semibold text-tBase-100 mb-1">{{ product.name }}</h3>
                        <p class="text-sm text-tBase-80 mb-2 line-clamp-2">{{ product.description }}</p>

                        <!-- Badges -->
                        <div class="flex items-center space-x-2 mb-2">
                            <span v-if="isOnSale" class="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                                SALE
                            </span>
                            <span v-if="isLowStock && !isOutOfStock"
                                class="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded">
                                LOW STOCK
                            </span>
                            <span v-if="isOutOfStock"
                                class="bg-gray-500 text-white text-xs font-bold px-2 py-1 rounded">
                                OUT OF STOCK
                            </span>
                        </div>

                        <!-- Stock Info -->
                        <div class="text-sm text-tBase-60">
                            Stock: {{ selectedVariety.stockQuantity || 0 }} • {{ product.varieties.length }} varieties
                        </div>
                    </div>

                    <!-- Price and Actions -->
                    <div class="text-right">
                        <div class="flex items-center justify-end space-x-2 mb-3">
                            <span class="text-xl font-bold text-primary-600">
                                {{ formatCurrency(isOnSale ? salePrice : regularPrice) }}
                            </span>
                            <span v-if="isOnSale" class="text-sm line-through text-tBase-60">
                                {{ formatCurrency(regularPrice) }}
                            </span>
                        </div>

                        <button @click="addToCart"
                            class="bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-300"
                            :disabled="!isInStock" :class="{ 'opacity-50 cursor-not-allowed': !isInStock }">
                            {{ isInStock ? 'Add to Cart' : 'Out of Stock' }}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue"
import { formatCurrency, isVarietyOnSale } from "@/utils/productUtils"

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
        return "/placeholder.svg?height=80&width=80"
    }
    return props.product.imageUrl || "/placeholder.svg?height=80&width=80"
})

// Methods
function handleImageError() {
    imageError.value = true
}

function addToCart() {
    if (!isInStock.value) return

    emit("add-to-cart", {
        productId: props.product.id,
        productName: props.product.name,
        varietyId: selectedVarietyId.value.id,
        variety: selectedVariety.value,
        price: isOnSale.value ? salePrice.value : regularPrice.value,
        quantity: 1,
        unit: selectedVariety.value.unit || "piece",
    })
}

// Lifecycle hooks
onMounted(() => {
    if (props.product.varieties.length > 0) {
        const defaultVariety = props.product.varieties.find((v) => v.isDefault)
        selectedVarietyId.value = defaultVariety ? defaultVariety.id : props.product.varieties[0].id
    }
})
</script>
