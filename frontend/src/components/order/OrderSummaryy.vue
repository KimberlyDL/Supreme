<!-- frontend\src\components\order\OrderSummary.vue -->
<template>
    <div class="bg-white p-4 rounded-lg shadow">
        <div class="flex justify-between items-center mb-4">
            <h2 class="text-lg font-semibold">Order Summary</h2>
            <div v-if="orderId" class="text-sm text-gray-600">
                Order #: <span class="font-medium">{{ orderId }}</span>
            </div>
        </div>

        <div v-if="items.length > 0">
            <div class="space-y-4">
                <div v-for="(item, index) in items" :key="index"
                    class="flex flex-col text-start p-3 bg-gray-50 rounded-md" :class="{
                        'border border-amber-300': item.quantity > item.maxQuantity,
                        'border-l-4 border-l-red-500': isSaleExpired(item) && !isSaleInGracePeriod(item),
                        'border-l-4 border-l-yellow-500': isSaleExpired(item) && isSaleInGracePeriod(item),
                        'border-l-4 border-l-green-500': item.saleInfo?.onSale && !isSaleExpired(item)
                    }">
                    <div class="flex justify-between items-start">
                        <div>
                            <div class="font-medium">{{ item.productName }}</div>
                            <div class="text-sm text-gray-600">
                                <span v-if="item.variety">
                                    {{ item.variety.varietyName }} ({{ item.variety.varietyQuantity }} {{
                                        item.variety.varietyUnit || 'unit' }})
                                </span>
                            </div>

                            <!-- Price status indicators -->
                            <div class="text-xs mt-1">
                                <span v-if="item.saleInfo?.onSale && !isSaleExpired(item)"
                                    class="text-green-600 font-medium">
                                    Sale price: ₱{{ item.unitPrice.toFixed(2) }}
                                </span>
                                <span v-else-if="isSaleExpired(item) && isSaleInGracePeriod(item)"
                                    class="text-yellow-600 font-medium">
                                    Sale price expires in {{ formatTimeRemaining(item.saleInfo.gracePeriodEnd) }}
                                </span>
                                <span v-else-if="isSaleExpired(item)" class="text-red-600 font-medium">
                                    Sale expired (using regular price)
                                </span>
                                <span v-else class="text-gray-600">
                                    Regular price: ₱{{ item.unitPrice.toFixed(2) }}
                                </span>
                            </div>

                            <!-- Stock warning -->
                            <div v-if="item.quantity > item.maxQuantity"
                                class="text-xs text-amber-600 font-medium mt-1">
                                Only {{ item.maxQuantity }} in stock
                            </div>
                        </div>

                        <div class="text-right">
                            <div class="font-bold">₱{{ item.totalPrice.toFixed(2) }}</div>
                            <!-- Show original price if on sale -->
                            <div v-if="item.saleInfo?.onSale && !isSaleExpired(item)"
                                class="text-xs text-gray-500 line-through">
                                ₱{{ (item.saleInfo.originalPrice * item.quantity).toFixed(2) }}
                            </div>
                        </div>
                    </div>

                    <div class="flex justify-between items-center mt-2">
                        <!-- Quantity controls in summary -->
                        <div class="flex items-center space-x-3">
                            <button @click="updateItemQuantity(index, item.quantity - 1)"
                                class="p-1 rounded-full hover:bg-gray-100" :disabled="item.quantity <= 1 || disabled"
                                :class="{ 'opacity-50 cursor-not-allowed': item.quantity <= 1 || disabled }">
                                <Minus class="w-4 h-4" />
                            </button>

                            <span class="w-8 text-center">{{ item.quantity }}</span>

                            <button @click="updateItemQuantity(index, item.quantity + 1)"
                                class="p-1 rounded-full hover:bg-gray-100"
                                :disabled="item.quantity >= item.maxQuantity || disabled"
                                :class="{ 'opacity-50 cursor-not-allowed': item.quantity >= item.maxQuantity || disabled }">
                                <Plus class="w-4 h-4" />
                            </button>
                        </div>

                        <button @click="removeItem(index)" class="text-red-500 hover:text-red-600 p-1"
                            :disabled="disabled" :class="{ 'opacity-50 cursor-not-allowed': disabled }">
                            <Trash2 class="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            <div class="mt-6 border-t pt-4">
                <div class="flex justify-between items-center font-bold text-lg">
                    <span>Total:</span>
                    <span>₱{{ totalPrice.toFixed(2) }}</span>
                </div>
            </div>

            <slot name="actions"></slot>
        </div>

        <div v-else class="text-center text-gray-500 py-6">
            No items in order
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { Plus, Minus, Trash2 } from 'lucide-vue-next';
import { useProductStore } from '@/stores/productStore';
import { isSalePriceValid, formatTimeRemaining as formatTime } from '@/utils/priceUtils';

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
        default: ''
    }
});

const emit = defineEmits(['update-quantity', 'remove-item', 'update-prices']);
const productStore = useProductStore();

// Set up timer to check for expired sales
let checkSalesTimer = null;

const totalPrice = computed(() => {
    return props.items.reduce((total, item) => total + item.totalPrice, 0);
});

// Check if a sale has expired
const isSaleExpired = (item) => {
    if (!item.saleInfo?.onSale || !item.saleInfo?.saleEndTime) return false;

    const now = Date.now();
    const endTime = item.saleInfo.saleEndTime?.seconds * 1000 || item.saleInfo.saleEndTime;
    return now > endTime;
};

// Check if a sale is in grace period (1 hour after sale ends)
const isSaleInGracePeriod = (item) => {
    return isSalePriceValid(item.saleInfo);
};

// Format time remaining in grace period
const formatTimeRemaining = (endTime) => {
    return formatTime(endTime);
};

// Check for expired sales and update prices
const checkExpiredSales = () => {
    let hasUpdates = false;

    props.items.forEach((item, index) => {
        if (item.saleInfo?.onSale && isSaleExpired(item) && !isSaleInGracePeriod(item)) {
            // Sale has expired and grace period is over - update to regular price
            if (item.unitPrice !== item.saleInfo.originalPrice) {
                props.items[index].unitPrice = item.saleInfo.originalPrice;
                props.items[index].totalPrice = item.saleInfo.originalPrice * item.quantity;
                hasUpdates = true;
            }
        }
    });

    if (hasUpdates) {
        emit('update-prices', [...props.items]);
    }
};

const updateItemQuantity = (index, newQuantity) => {
    if (props.disabled) return;

    if (newQuantity <= 0) {
        removeItem(index);
        return;
    }

    const item = props.items[index];
    if (newQuantity > item.maxQuantity) {
        newQuantity = item.maxQuantity;
    }

    emit('update-quantity', { index, quantity: newQuantity });
};

const removeItem = (index) => {
    if (props.disabled) return;
    emit('remove-item', index);
};

onMounted(() => {
    // Check for expired sales every 10 seconds
    checkSalesTimer = setInterval(checkExpiredSales, 10000);

    // Initial check
    checkExpiredSales();
});

onUnmounted(() => {
    if (checkSalesTimer) {
        clearInterval(checkSalesTimer);
    }
});
</script>