<!-- frontend\src\components\order\OrderSummary.vue -->
<template>
    <div class="bg-white p-4 rounded-lg shadow">
        <h2 class="text-lg font-semibold mb-4">Order Summary</h2>

        <!-- Stock Warning Banner -->
        <div v-if="stockIssues.length > 0"
            class="mb-4 bg-amber-100 border border-amber-300 text-amber-800 p-3 rounded-md">
            <div class="flex items-center">
                <AlertTriangle class="w-5 h-5 mr-2" />
                <span class="font-semibold">Stock Warning</span>
            </div>
            <ul class="mt-2 text-sm space-y-1">
                <li v-for="(issue, index) in stockIssues" :key="index">
                    {{ issue.item.productName }} ({{ issue.item.variety.varietyName }}):
                    <span class="font-medium">{{ issue.available }}</span> available,
                    <span class="font-medium">{{ issue.item.quantity }}</span> requested
                </li>
            </ul>
        </div>

        <!-- Price Warning Banner -->
        <div v-if="priceIssues.length > 0"
            class="mb-4 bg-yellow-100 border border-yellow-300 text-yellow-800 p-3 rounded-md">
            <div class="flex items-center">
                <AlertCircle class="w-5 h-5 mr-2" />
                <span class="font-semibold">Price Changes Detected</span>
            </div>
            <ul class="mt-2 text-sm space-y-1">
                <li v-for="(issue, index) in priceIssues" :key="index">
                    {{ issue.item.productName }} ({{ issue.item.variety.varietyName }}):
                    <span class="line-through">₱{{ issue.originalPrice.toFixed(2) }}</span>
                    <span class="ml-1 font-medium">₱{{ issue.currentPrice.toFixed(2) }}</span>
                </li>
            </ul>
            <button @click="updateAllPrices"
                class="mt-2 text-xs bg-yellow-200 hover:bg-yellow-300 text-yellow-800 px-2 py-1 rounded">
                Update All Prices
            </button>
        </div>

        <!-- Empty State -->
        <div v-if="items.length === 0" class="text-center py-8 text-gray-500">
            <ShoppingCart class="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>Your order is empty</p>
        </div>

        <!-- Items List -->
        <div v-else class="space-y-4">
            <div v-for="(item, index) in items" :key="index" class="flex items-center border-b pb-3">
                <div class="flex-1">
                    <div class="font-medium">{{ item.productName }}</div>
                    <div class="text-sm text-gray-500">
                        {{ item.variety.varietyName }} ({{ item.variety.varietyQuantity }} {{ item.variety.varietyUnit
                        }})
                    </div>
                    <div class="text-sm">
                        ₱{{ item.unitPrice.toFixed(2) }}
                        <span v-if="item.saleInfo?.onSale" class="text-xs text-green-600 ml-1">(Sale)</span>
                    </div>
                </div>

                <div class="flex items-center">
                    <button @click="updateQuantity(index, item.quantity - 1)" :disabled="disabled || item.quantity <= 1"
                        class="w-8 h-8 flex items-center justify-center border rounded-l-md disabled:opacity-50">
                        <Minus class="w-4 h-4" />
                    </button>

                    <input type="number" v-model.number="item.quantity" min="1" :max="item.maxQuantity"
                        :disabled="disabled" @change="updateQuantity(index, item.quantity)"
                        class="w-12 h-8 border-t border-b text-center disabled:bg-gray-100" />

                    <button @click="updateQuantity(index, item.quantity + 1)"
                        :disabled="disabled || item.quantity >= item.maxQuantity"
                        class="w-8 h-8 flex items-center justify-center border rounded-r-md disabled:opacity-50">
                        <Plus class="w-4 h-4" />
                    </button>

                    <div class="w-24 text-right ml-4">
                        ₱{{ item.totalPrice.toFixed(2) }}
                    </div>

                    <button @click="removeItem(index)" :disabled="disabled"
                        class="ml-3 text-gray-400 hover:text-red-500 disabled:opacity-50">
                        <Trash2 class="w-5 h-5" />
                    </button>
                </div>
            </div>

            <!-- Order Total -->
            <div class="flex justify-between items-center pt-4 font-bold">
                <span>Total:</span>
                <span>₱{{ totalPrice.toFixed(2) }}</span>
            </div>

            <!-- Action Buttons -->
            <slot name="actions"></slot>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useProductStore } from '@/stores/productStore';
import { ShoppingCart, Plus, Minus, Trash2, AlertTriangle, AlertCircle } from 'lucide-vue-next';
import { findStockIssues, findPriceDiscrepancies, getVarietyPrice } from '@/utils/priceUtils';

const props = defineProps({
    items: {
        type: Array,
        required: true
    },
    disabled: {
        type: Boolean,
        default: false
    },
    orderId: {
        type: String,
        default: null
    }
});

const emit = defineEmits(['update-quantity', 'remove-item', 'update-prices']);

const productStore = useProductStore();
const stockIssues = ref([]);
const priceIssues = ref([]);

const totalPrice = computed(() => {
    return props.items.reduce((total, item) => total + item.totalPrice, 0);
});

const updateQuantity = (index, quantity) => {
    if (quantity <= 0) {
        removeItem(index);
        return;
    }

    // Get the item
    const item = props.items[index];

    // Find the product to get current stock
    const product = productStore.products.find(p => p.id === item.productId);
    if (product) {
        const variety = product.varieties.find(v => v.name === item.variety.varietyName);
        if (variety) {
            // Limit quantity to available stock
            if (quantity > variety.stockQuantity) {
                quantity = variety.stockQuantity;
            }
        }
    }

    emit('update-quantity', { index, quantity });

    // Re-validate after update
    validateItems();
};

const removeItem = (index) => {
    emit('remove-item', index);

    // Re-validate after removal
    validateItems();
};

const updateAllPrices = () => {
    const updatedItems = [...props.items];

    priceIssues.value.forEach(issue => {
        const index = updatedItems.findIndex(item =>
            item.productId === issue.item.productId &&
            item.variety.varietyName === issue.item.variety.varietyName
        );

        if (index !== -1) {
            updatedItems[index].unitPrice = issue.currentPrice;
            updatedItems[index].totalPrice = issue.currentPrice * updatedItems[index].quantity;
        }
    });

    emit('update-prices', updatedItems);
    priceIssues.value = [];
};

const validateItems = () => {
    if (!props.items.length || !productStore.products.length) {
        stockIssues.value = [];
        priceIssues.value = [];
        return;
    }

    // Check for stock issues
    stockIssues.value = findStockIssues(props.items, productStore.products);

    // Check for price discrepancies
    priceIssues.value = findPriceDiscrepancies(props.items, productStore.products);
};

// Watch for changes in products or items to re-validate
watch(() => productStore.products, validateItems, { deep: true });
watch(() => props.items, validateItems, { deep: true });

onMounted(() => {
    validateItems();
});
</script>