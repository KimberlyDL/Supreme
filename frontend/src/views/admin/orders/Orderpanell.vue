<template>
    <div class="container mx-auto p-4">
        <div class="flex flex-col lg:flex-row gap-6">
            <!-- Left Column: Order Form -->
            <div class="w-full lg:w-1/2 bg-white p-6 rounded-lg shadow-md">
                <h2 class="text-2xl font-bold text-primary-700 mb-6">Create New Order</h2>

                <!-- Branch Selector -->
                <div class="mb-6">
                    <label class="block text-sm font-medium text-tBase-100 mb-2">Select Branch</label>
                    <BranchSelector 
                        :branches="catalogStore.branches" 
                        v-model="selectedBranchId" 
                        class="w-full"
                    />
                </div>

                <!-- Customer Information -->
                <div class="space-y-4 mb-6">
                    <div>
                        <label class="block text-sm font-medium text-tBase-100 mb-2">Customer Name</label>
                        <input 
                            v-model="customerName" 
                            type="text" 
                            class="w-full px-4 py-2 border border-bgPrimary-200 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                            placeholder="Enter customer name"
                        />
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-tBase-100 mb-2">Notes</label>
                        <textarea 
                            v-model="notes" 
                            class="w-full px-4 py-2 border border-bgPrimary-200 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                            placeholder="Add any special instructions or notes"
                            rows="3"
                        ></textarea>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-tBase-100 mb-2">Payment Type</label>
                        <select 
                            v-model="paymentType" 
                            class="w-full px-4 py-2 border border-bgPrimary-200 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                        >
                            <option value="">Select Payment Type</option>
                            <option value="cash">Cash</option>
                            <option value="card">Card</option>
                            <option value="transfer">Bank Transfer</option>
                        </select>
                    </div>
                </div>

                <!-- Product Selection -->
                <div class="space-y-4 mb-6">
                    <h3 class="text-lg font-semibold text-primary-600">Add Products</h3>
                    
                    <div>
                        <label class="block text-sm font-medium text-tBase-100 mb-2">Select Product</label>
                        <select 
                            v-model="selectedProduct" 
                            class="w-full px-4 py-2 border border-bgPrimary-200 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                        >
                            <option value="">Select Product</option>
                            <option 
                                v-for="product in catalogStore.filteredProducts" 
                                :key="product.id" 
                                :value="product"
                            >
                                {{ product.name }}
                            </option>
                        </select>
                    </div>

                    <div v-if="selectedProduct && selectedProduct.varieties.length > 0">
                        <label class="block text-sm font-medium text-tBase-100 mb-2">Select Variety</label>
                        <select 
                            v-model="selectedVariety" 
                            class="w-full px-4 py-2 border border-bgPrimary-200 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                        >
                            <option value="">Select Variety</option>
                            <option 
                                v-for="variety in selectedProduct.varieties" 
                                :key="variety.id" 
                                :value="variety"
                            >
                                {{ variety.name }} ({{ formatPrice(getVarietyPrice(variety)) }})
                            </option>
                        </select>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-tBase-100 mb-2">Quantity</label>
                        <div class="flex items-center">
                            <button 
                                @click="decrementQuantity" 
                                class="px-3 py-2 bg-gray-200 rounded-l-lg hover:bg-gray-300"
                                :disabled="selectedItemQuantity <= 1"
                            >
                                <Minus class="w-4 h-4" />
                            </button>
                            <input 
                                v-model.number="selectedItemQuantity" 
                                type="number" 
                                min="1" 
                                class="w-20 text-center px-2 py-2 border-y border-x-0 border-bgPrimary-200 focus:ring-0 focus:outline-none"
                            />
                            <button 
                                @click="incrementQuantity" 
                                class="px-3 py-2 bg-gray-200 rounded-r-lg hover:bg-gray-300"
                                :disabled="selectedVariety && selectedItemQuantity >= selectedVariety.stockQuantity"
                            >
                                <Plus class="w-4 h-4" />
                            </button>
                            <span v-if="selectedVariety" class="ml-3 text-sm text-gray-500">
                                (Stock: {{ selectedVariety.stockQuantity }})
                            </span>
                        </div>
                    </div>

                    <div class="flex justify-end">
                        <button 
                            @click="addToOrder" 
                            class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center"
                            :disabled="!canAddToOrder"
                        >
                            <ShoppingCart class="w-4 h-4 mr-2" />
                            Add to Order
                        </button>
                    </div>
                </div>
            </div>

            <!-- Right Column: Order Summary -->
            <div class="w-full lg:w-1/2 bg-white p-6 rounded-lg shadow-md">
                <h2 class="text-2xl font-bold text-primary-700 mb-6">Order Summary</h2>

                <div v-if="orderItems.length === 0" class="flex flex-col items-center justify-center py-12 text-gray-500">
                    <ShoppingBag class="w-16 h-16 mb-4" />
                    <p>No items in your order yet</p>
                    <p class="text-sm mt-2">Select products to add to your order</p>
                </div>

                <div v-else>
                    <!-- Order Items -->
                    <div class="mb-6 max-h-[400px] overflow-y-auto">
                        <div 
                            v-for="(item, index) in orderItems" 
                            :key="index"
                            class="flex items-center justify-between p-4 mb-3 bg-gray-50 rounded-lg border border-gray-200"
                        >
                            <div class="flex-1">
                                <p class="font-medium">{{ item.product.name }}</p>
                                <p class="text-sm text-gray-600">{{ item.variety.name }}</p>
                                <div class="flex items-center mt-1">
                                    <span class="text-sm font-medium">
                                        {{ formatPrice(getVarietyPrice(item.variety)) }} × {{ item.quantity }}
                                    </span>
                                    <span v-if="isVarietyOnSale(item.variety)" class="ml-2 text-xs px-2 py-0.5 bg-green-100 text-green-800 rounded-full">
                                        Sale
                                    </span>
                                </div>
                            </div>
                            
                            <div class="flex items-center gap-3">
                                <div class="flex items-center">
                                    <button 
                                        @click="updateItemQuantity(index, item.quantity - 1)" 
                                        class="p-1 text-gray-500 hover:text-gray-700"
                                        :disabled="item.quantity <= 1"
                                    >
                                        <MinusCircle class="w-5 h-5" />
                                    </button>
                                    <span class="mx-2 w-8 text-center">{{ item.quantity }}</span>
                                    <button 
                                        @click="updateItemQuantity(index, item.quantity + 1)" 
                                        class="p-1 text-gray-500 hover:text-gray-700"
                                        :disabled="item.quantity >= item.variety.stockQuantity"
                                    >
                                        <PlusCircle class="w-5 h-5" />
                                    </button>
                                </div>
                                
                                <button 
                                    @click="removeItem(index)" 
                                    class="p-1 text-red-500 hover:text-red-700"
                                >
                                    <Trash2 class="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Order Totals -->
                    <div class="border-t border-gray-200 pt-4 mb-6">
                        <div class="flex justify-between mb-2">
                            <span class="text-gray-600">Subtotal</span>
                            <span>{{ formatPrice(totalPrice) }}</span>
                        </div>
                        <div class="flex justify-between font-bold text-lg">
                            <span>Total</span>
                            <span class="text-primary-700">{{ formatPrice(totalPrice) }}</span>
                        </div>
                    </div>

                    <!-- Submit Order Button -->
                    <button 
                        @click="submitOrder" 
                        class="w-full py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center justify-center"
                        :disabled="!canSubmitOrder || submitting"
                    >
                        <Loader2 v-if="submitting" class="w-5 h-5 mr-2 animate-spin" />
                        <CheckCircle v-else class="w-5 h-5 mr-2" />
                        Submit Order
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { useRouter } from 'vue-router';
import BranchSelector from "@/components/catalog/BranchSelector.vue";
import { useCatalogStore } from "@/stores/catalogStore";
import { useOrderStore } from "@/stores/orderStore";
import { 
    Loader2, 
    ShoppingCart, 
    ShoppingBag, 
    Plus, 
    Minus, 
    PlusCircle, 
    MinusCircle, 
    Trash2, 
    CheckCircle 
} from 'lucide-vue-next';
import { isVarietyOnSale, getVarietyPrice, computeOrderTotalPrice } from '@/utils/priceUtils';

const router = useRouter();
const catalogStore = useCatalogStore();
const orderStore = useOrderStore();

// State
const selectedBranchId = ref(null);
const customerName = ref('');
const notes = ref('');
const paymentType = ref('cash');
const selectedProduct = ref(null);
const selectedVariety = ref(null);
const selectedItemQuantity = ref(1);
const orderItems = ref([]);
const submitting = ref(false);

// Computed
const canAddToOrder = computed(() => {
    return selectedProduct.value && 
           selectedVariety.value && 
           selectedItemQuantity.value > 0 && 
           selectedItemQuantity.value <= (selectedVariety.value?.stockQuantity || 0);
});

const canSubmitOrder = computed(() => {
    return orderItems.value.length > 0 && 
           customerName.value.trim() !== '' && 
           paymentType.value !== '' && 
           selectedBranchId.value;
});

const totalPrice = computed(() => {
    return orderItems.value.reduce((total, item) => {
        const price = getVarietyPrice(item.variety);
        return total + (price * item.quantity);
    }, 0);
});

// Methods
const formatPrice = (price) => {
    return `₱${price.toFixed(2)}`;
};

const incrementQuantity = () => {
    if (selectedVariety.value && selectedItemQuantity.value < selectedVariety.value.stockQuantity) {
        selectedItemQuantity.value++;
    }
};

const decrementQuantity = () => {
    if (selectedItemQuantity.value > 1) {
        selectedItemQuantity.value--;
    }
};

const addToOrder = () => {
    if (!canAddToOrder.value) {
        return;
    }

    const existingItemIndex = orderItems.value.findIndex(
        item => item.varietyId === selectedVariety.value.id
    );

    if (existingItemIndex !== -1) {
        // Update existing item
        const currentItem = orderItems.value[existingItemIndex];
        const newQuantity = currentItem.quantity + selectedItemQuantity.value;
        
        // Check if new quantity exceeds stock
        if (newQuantity > selectedVariety.value.stockQuantity) {
            alert(`Cannot add more than ${selectedVariety.value.stockQuantity} units due to stock limitations.`);
            return;
        }
        
        orderItems.value[existingItemIndex].quantity = newQuantity;
    } else {
        // Add new item
        orderItems.value.push({
            productId: selectedProduct.value.id,
            product: selectedProduct.value,
            variety: selectedVariety.value,
            varietyId: selectedVariety.value.id,
            quantity: selectedItemQuantity.value,
        });
    }

    // Reset selection
    selectedProduct.value = null;
    selectedVariety.value = null;
    selectedItemQuantity.value = 1;
};

const updateItemQuantity = (index, quantity) => {
    const item = orderItems.value[index];
    
    if (quantity <= 0) {
        removeItem(index);
        return;
    }
    
    if (quantity > item.variety.stockQuantity) {
        alert(`Maximum available stock is ${item.variety.stockQuantity}`);
        return;
    }
    
    orderItems.value[index].quantity = quantity;
};

const removeItem = (index) => {
    orderItems.value.splice(index, 1);
};

const submitOrder = async () => {
    if (!canSubmitOrder.value) {
        return;
    }
    
    try {
        submitting.value = true;
        
        await orderStore.saveAdminOrder({
            orderItems: orderItems.value,
            customerName: customerName.value,
            paymentType: paymentType.value,
            notes: notes.value,
            selectedBranchId: selectedBranchId.value
        });
        
        alert("Order saved successfully!");
        
        // Reset form
        orderItems.value = [];
        customerName.value = '';
        notes.value = '';
        
        // Navigate to orders list
        router.push('/administrator/orders');
    } catch (err) {
        alert("Failed to save order: " + err.message);
        console.error(err);
    } finally {
        submitting.value = false;
    }
};

// Watch for branch changes
watch(selectedBranchId, (newBranchId) => {
    if (newBranchId) {
        catalogStore.setBranch(newBranchId);
    }
});

// Lifecycle hooks
onMounted(async () => {
    await catalogStore.initialize();
    if (catalogStore.selectedBranchId) {
        selectedBranchId.value = catalogStore.selectedBranchId;
    }
});

onUnmounted(() => {
    catalogStore.cleanup();
});
</script>
