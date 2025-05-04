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
                    class="flex justify-between items-center text-start p-3 bg-gray-50 rounded-md"
                    :class="{ 'border border-amber-300': item.quantity > item.maxQuantity }">
                    <div>
                        <div class="font-medium">{{ item.productName }}</div>
                        <div class="text-sm text-gray-600">
                            <span v-if="item.variety">
                                {{ item.variety.varietyName }} ({{ item.variety.varietyQuantity }} {{
                                    item.variety.varietyUnit || 'unit' }})
                            </span>
                        </div>
                        <!-- Stock warning -->
                        <div v-if="item.quantity > item.maxQuantity" class="text-xs text-amber-600 font-medium mt-1">
                            Only {{ item.maxQuantity }} in stock
                        </div>
                    </div>

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

                    <div class="text-right">
                        
                        <div class="font-bold">₱{{ item.totalPrice.toFixed(2) }}</div>
                        <!-- Show original price if on sale -->
                        <div v-if="item.variety?.isOnSale" class="text-xs text-gray-500 line-through">
                            ₱{{ (item.variety.originalPrice * item.quantity).toFixed(2) }}
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
import { computed } from 'vue';
import { Plus, Minus, Trash2 } from 'lucide-vue-next';

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

const emit = defineEmits(['update-quantity', 'remove-item']);

const totalPrice = computed(() => {
    return props.items.reduce((total, item) => total + item.totalPrice, 0);
});

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
</script>