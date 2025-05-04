<!-- frontend\src\components\order\ProductOrderCard.vue -->
<template>
    <div class="border rounded-lg p-4 hover:shadow-lg transition-shadow relative">
        <!-- Badges - positioned together in the top-right -->
        <div class="absolute top-2 right-2 z-10 flex space-x-2">
            <span v-if="isVarietyOnSale(selectedVariety)"
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                Sale
            </span>
            <span v-if="isLowStock"
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                Low Stock
            </span>
        </div>

        <!-- Product Basic Info -->
        <div class="flex items-start justify-start text-start mb-3">
            <div>
                <h3 class="font-semibold">{{ product.name }}</h3>
                <div v-if="selectedVariety" class="text-sm text-gray-600">
                    Stock: <span :class="{ 'text-red-600 font-medium': selectedVariety.stockQuantity <= 10 }">
                        {{ getRemainingStock(selectedVariety) }} {{ selectedVariety.unit }}s
                    </span>
                </div>
            </div>
        </div>

        <!-- Variety Selection -->
        <div class="mb-3">
            <label class="block text-sm font-medium text-gray-700 mb-1">Select Variety</label>
            <select v-model="localSelectedVariety"
                class="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary">
                <option disabled value="">Select a variety</option>
                <option v-for="variety in product.varieties" :key="variety.id" :value="variety"
                    :disabled="getRemainingStock(variety) <= 0">
                    {{ variety.name }} ({{ variety.quantity }} {{ variety.unit }}) -
                    {{ isVarietyOnSale(variety) ? `₱${variety.sale.salePrice.toFixed(2)} (Sale)` :
                        `₱${variety.price.toFixed(2)}` }}
                    {{ getRemainingStock(variety) <= 0 ? '(Out of Stock)' : getRemainingStock(variety) <= 10
                        ? '(Low Stock)' : '' }} </option>
            </select>
        </div>

        <!-- Quantity Input -->
        <div class="flex items-center space-x-3">
            <button @click="decrementQuantity"
                class="p-1 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                :disabled="!localQuantity || localQuantity <= 0">
                <Minus class="w-5 h-5" />
            </button>

            <input type="number" v-model.number="localQuantity" min="0" :max="maxQuantity"
                class="w-20 text-center rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary" />

            <button @click="incrementQuantity"
                class="p-1 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                :disabled="localQuantity >= maxQuantity">
                <Plus class="w-5 h-5" />
            </button>
        </div>

        <button @click="addToOrder" :disabled="!localQuantity || !localSelectedVariety || maxQuantity <= 0"
            class="mt-3 w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-dark disabled:bg-gray-300">
            Add to Order
        </button>
    </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { Plus, Minus } from 'lucide-vue-next';
import { isVarietyOnSale, getRemainingStock as getStock } from '@/utils/priceUtils';

const props = defineProps({
    product: {
        type: Object,
        required: true
    },
    disabled: {
        type: Boolean,
        default: false
    },
    orderItems: {
        type: Array,
        default: () => []
    }
});

const emit = defineEmits(['add-to-order']);

// Local state
const localQuantity = ref(0);
const localSelectedVariety = ref('');

// Computed properties
const selectedVariety = computed(() => localSelectedVariety.value);

const maxQuantity = computed(() => {
    if (!selectedVariety.value) return 0;
    return getRemainingStock(selectedVariety.value);
});

const isLowStock = computed(() => {
    if (!selectedVariety.value) {
        // Check if any variety has low stock
        return props.product.varieties?.some(v => getRemainingStock(v) <= 10);
    }
    return getRemainingStock(selectedVariety.value) <= 10;
});

// Get the remaining stock for a variety after accounting for items already in the order
const getRemainingStock = (variety) => {
    if (!variety) return 0;
    return getStock(variety, props.orderItems, props.product.id);
};

const calculateItemPrice = (variety) => {
    if (!variety) return 0;

    if (isVarietyOnSale(variety)) {
        return variety.sale.salePrice;
    }

    return variety.price;
};

const incrementQuantity = () => {
    if (localQuantity.value < maxQuantity.value) {
        localQuantity.value++;
    }
};

const decrementQuantity = () => {
    if (localQuantity.value > 0) {
        localQuantity.value--;
    }
};

const addToOrder = () => {
    if (!localSelectedVariety.value || localQuantity.value <= 0 || maxQuantity.value <= 0) return;

    const variety = localSelectedVariety.value;
    const pricePerUnit = calculateItemPrice(variety);
    const isSale = isVarietyOnSale(variety);

    // Get sale end time for the grace period
    const saleEndTime = isSale ? variety.sale.endDate?.seconds * 1000 || variety.sale.endDate : null;
    // Calculate grace period end time (1 hour after sale ends)
    const gracePeriodEnd = saleEndTime ? saleEndTime + (60 * 60 * 1000) : null;

    emit('add-to-order', {
        product: props.product,
        productId: props.product.id,
        productName: props.product.name,
        variety: variety,
        quantity: localQuantity.value,
        pricePerUnit: pricePerUnit,
        totalPrice: pricePerUnit * localQuantity.value,
        saleInfo: isSale ? {
            originalPrice: variety.price,
            salePrice: variety.sale.salePrice,
            onSale: true,
            saleEndTime: saleEndTime,
            gracePeriodEnd: gracePeriodEnd
        } : {
            originalPrice: variety.price,
            onSale: false
        }
    });

    // Reset inputs
    localQuantity.value = 0;
};

// Watch for changes in orderItems to update available quantities
watch(() => props.orderItems, () => {
    // If the current quantity exceeds the new max, adjust it
    if (localQuantity.value > maxQuantity.value) {
        localQuantity.value = maxQuantity.value;
    }
}, { deep: true });

// Set default variety on mount
onMounted(() => {
    if (props.product.varieties && props.product.varieties.length > 0) {
        // Find default variety or use the first one
        const defaultVariety = props.product.varieties.find(v => v.isDefault) || props.product.varieties[0];
        localSelectedVariety.value = defaultVariety;
    }
});
</script>