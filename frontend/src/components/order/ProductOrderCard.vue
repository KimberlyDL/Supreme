<!-- frontend\src\components\order\ProductOrderCard.vue -->
<template>
    <div class="bg-white rounded-lg shadow overflow-hidden">
        <!-- Product Image -->
        <div class="relative h-48 bg-gray-200">
            <img v-if="product.imageUrl" :src="product.imageUrl" :alt="product.name"
                class="w-full h-full object-cover" />
            <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
                <ImageOff class="w-12 h-12" />
            </div>

            <!-- Sale Badge -->
            <div v-if="isOnSale"
                class="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                SALE
            </div>

            <!-- Low Stock Badge -->
            <div v-if="isLowStock"
                class="absolute top-2 left-2 bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded">
                LOW STOCK
            </div>
        </div>

        <!-- Product Info -->
        <div class="p-4">
            <h3 class="font-semibold text-lg mb-1">{{ product.name }}</h3>

            <!-- Variety Selector -->
            <div class="mb-3">
                <label class="block text-sm font-medium text-gray-700 mb-1">Variety</label>
                <select v-model="selectedVarietyIndex"
                    class="w-full border-gray-300 rounded-md shadow-sm focus:border-primary focus:ring-primary">
                    <option v-for="(variety, index) in product.varieties" :key="index" :value="index"
                        :disabled="variety.stockQuantity <= 0">
                        {{ variety.name }} ({{ variety.quantity }} {{ variety.unit }}) -
                        {{ variety.stockQuantity <= 0 ? 'Out of Stock' : `${variety.stockQuantity} available` }}
                            </option>
                </select>
            </div>

            <!-- Price Display -->
            <div class="flex items-baseline mb-3">
                <!-- <span v-if="selectedVariety.onSale" class="text-lg font-bold text-red-600 mr-2">
                    ₱{{ salePrice.toFixed(2) }}
                </span> -->
                <span v-if="isOnSale" class="text-lg font-bold text-red-600 mr-2">
                    ₱{{ salePrice.toFixed(2) }}
                </span>
                <span :class="[
                    'text-lg font-bold',
                    isOnSale ? 'line-through text-gray-500' : 'text-gray-900'
                ]">
                    ₱{{ regularPrice.toFixed(2) }}
                </span>
                <span class="ml-2 text-sm text-gray-500">
                    per {{ selectedVariety.quantity }} {{ selectedVariety.unit }}
                </span>
            </div>

            <!-- Quantity Selector -->
            <div class="flex items-center mb-4">
                <button @click="quantity > 1 ? quantity-- : null"
                    class="w-8 h-8 flex items-center justify-center border rounded-l-md" :disabled="quantity <= 1">
                    <Minus class="w-4 h-4" />
                </button>

                <input type="number" v-model.number="quantity" min="1" :max="maxQuantity"
                    class="w-12 h-8 border-t border-b text-center" />

                <button @click="quantity < maxQuantity ? quantity++ : null"
                    class="w-8 h-8 flex items-center justify-center border rounded-r-md"
                    :disabled="quantity >= maxQuantity">
                    <Plus class="w-4 h-4" />
                </button>

                <span class="ml-2 text-sm text-gray-500">
                    {{ maxQuantity }} available
                </span>
            </div>

            <!-- Add to Order Button -->
            <button @click="addToOrder"
                class="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-dark flex items-center justify-center"
                :disabled="maxQuantity <= 0">
                <ShoppingCart class="w-5 h-5 mr-2" />
                Add to Order
            </button>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { ShoppingCart, Plus, Minus, ImageOff } from 'lucide-vue-next';
import { isVarietyOnSale, getVarietyPrice } from '@/utils/priceUtils';

const props = defineProps({
    product: {
        type: Object,
        required: true
    },
    orderItems: {
        type: Array,
        default: () => []
    }
});

const emit = defineEmits(['add-to-order']);

// State
const selectedVarietyIndex = ref(0);
const quantity = ref(1);

// Computed
const selectedVariety = computed(() => {
    return props.product.varieties[selectedVarietyIndex.value] || {};
});

const regularPrice = computed(() => {
    return selectedVariety.value.price || 0;
});

const salePrice = computed(() => {
    if (isVarietyOnSale(selectedVariety.value)) {
        return selectedVariety.value.sale.salePrice;
    }
    return regularPrice.value;
});

const currentPrice = computed(() => {
    return isVarietyOnSale(selectedVariety.value) ? salePrice.value : regularPrice.value;
});

const maxQuantity = computed(() => {
    return selectedVariety.value.stockQuantity || 0;
});

const isOnSale = computed(() => {
    return isVarietyOnSale(selectedVariety.value);
});

const isLowStock = computed(() => {
    return maxQuantity.value > 0 && maxQuantity.value <= 10;
});

// Find default variety index
const findDefaultVarietyIndex = () => {
    const defaultIndex = props.product.varieties.findIndex(v => v.isDefault);
    return defaultIndex !== -1 ? defaultIndex : 0;
};

// Methods
const addToOrder = () => {
    if (quantity.value <= 0 || quantity.value > maxQuantity.value) {
        return;
    }

    const variety = selectedVariety.value;

    // Prepare sale info
    const saleInfo = {
        onSale: isVarietyOnSale(variety),
        originalPrice: variety.price,
        salePrice: variety.sale?.salePrice,
        saleEndTime: variety.sale?.endDate?.seconds * 1000,
        gracePeriodEnd: variety.sale?.endDate?.seconds * 1000 + (60 * 60 * 1000) // 1 hour grace period
    };

    emit('add-to-order', {
        productId: props.product.id,
        productName: props.product.name,
        quantity: quantity.value,
        variety: variety,
        pricePerUnit: currentPrice.value,
        saleInfo: saleInfo
    });

    // Reset quantity after adding
    quantity.value = 1;
};

// Initialize with default variety
watch(() => props.product, () => {
    selectedVarietyIndex.value = findDefaultVarietyIndex();
    quantity.value = 1;
}, { immediate: true });

// Reset quantity when variety changes
watch(selectedVarietyIndex, () => {
    quantity.value = 1;
});
</script>