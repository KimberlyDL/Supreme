<<<<<<< HEAD
<!-- frontend\src\views\admin\orders\EditOrder.vue -->
=======
>>>>>>> e0ccb28ba7b3cbed835e3f00a02c97c98379eda6
<template>
    <div class="container mx-auto p-4">
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-2xl font-bold">Edit Order</h1>
            <div class="flex space-x-3">
                <router-link to="/administrator/orders"
                    class="border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50">
                    Cancel
                </router-link>
                <button @click="confirmVoidOrder" :disabled="orderData.status === 'Voided'"
                    class="bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed">
                    Void Order
                </button>
            </div>
        </div>

        <div v-if="loading" class="flex justify-center items-center h-64">
            <div class="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
        </div>

        <div v-else-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p>{{ error }}</p>
            <button @click="loadOrder" class="text-red-700 underline mt-2">Try Again</button>
        </div>

        <div v-else>
            <!-- Order Status Banner -->
            <div v-if="orderData.status" :class="{
                'mb-6 p-4 rounded-lg text-white': true,
                'bg-yellow-500': orderData.status === 'Pending',
                'bg-green-500': orderData.status === 'Completed',
                'bg-red-500': orderData.status === 'Voided'
            }">
                <div class="flex items-center">
                    <AlertCircle v-if="orderData.status === 'Voided'" class="w-6 h-6 mr-2" />
                    <CheckCircle v-else-if="orderData.status === 'Completed'" class="w-6 h-6 mr-2" />
                    <Clock v-else class="w-6 h-6 mr-2" />
                    <span class="font-semibold">Order Status: {{ orderData.status }}</span>
                </div>
                <p v-if="orderData.status === 'Voided'" class="mt-1 text-sm">
                    This order has been voided and cannot be modified.
                </p>
            </div>

            <!-- Order Number Display -->
            <div v-if="orderData.orderNumber" class="mb-6 bg-gray-100 p-4 rounded-lg">
                <div class="flex items-center">
                    <span class="font-semibold">Order #: {{ orderData.orderNumber }}</span>
                </div>
            </div>

            <!-- Customer Information -->
            <div class="mb-6 bg-white p-4 rounded-lg shadow">
                <h2 class="text-lg font-semibold mb-4">Customer Information</h2>
                <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700">Customer Name</label>
                    <input v-model="orderData.customerName" type="text" :disabled="orderData.status === 'Voided'"
                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary disabled:bg-gray-100" />
                </div>
            </div>

            <!-- Stock Warning Banner -->
            <div v-if="hasStockIssues" class="mb-6 bg-amber-100 border border-amber-300 text-amber-800 p-4 rounded-lg">
                <div class="flex items-center">
                    <AlertTriangle class="w-6 h-6 mr-2" />
                    <span class="font-semibold">Stock Warning</span>
                </div>
                <p class="mt-1">
                    Some items in this order have stock issues. Please review the quantities before updating.
                </p>
            </div>

            <!-- Order Summary -->
            <OrderSummary :items="orderData.items" :disabled="orderData.status === 'Voided'"
                :order-id="orderData.orderNumber" @update-quantity="updateItemQuantity" @remove-item="removeItem"
<<<<<<< HEAD
                @update-prices="handlePriceUpdates" class="mb-6" />
=======
                class="mb-6" />
>>>>>>> e0ccb28ba7b3cbed835e3f00a02c97c98379eda6

            <!-- Add New Products -->
            <div v-if="orderData.status !== 'Voided'" class="mb-6 bg-white p-4 rounded-lg shadow">
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-lg font-semibold">Add Products</h2>

                    <!-- Search Bar -->
                    <div class="relative w-64">
                        <input v-model="searchQuery" type="text" placeholder="Search products..."
                            class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary" />
                        <Search class="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                    </div>
                </div>

                <!-- Category Tabs -->
                <div class="mb-4 border-b border-gray-200">
                    <ul class="flex flex-wrap -mb-px">
                        <li class="mr-2" v-for="category in availableCategories" :key="category">
                            <button @click="selectCategory(category)" :class="[
                                'inline-block py-2 px-4 border-b-2 font-medium text-sm',
                                selectedCategory === category
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            ]">
                                {{ category }}
                            </button>
                        </li>
                    </ul>
                </div>

                <!-- Product List -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <ProductOrderCard v-for="product in filteredProducts" :key="product.id" :product="product"
                        :order-items="orderData.items" @add-to-order="addToOrder" />
                </div>
            </div>

            <!-- Update Order Button -->
            <div class="flex justify-end">
<<<<<<< HEAD
                <button @click="previewOrder" :disabled="orderData.status === 'Voided' || orderData.items.length === 0"
                    class="bg-green-500 text-white py-3 px-6 rounded-md hover:bg-green-600 flex items-center justify-center disabled:bg-gray-300 disabled:cursor-not-allowed">
                    <Save class="w-5 h-5 mr-2" />
                    Review Changes
=======
                <button @click="updateOrder" :disabled="orderData.status === 'Voided' || orderData.items.length === 0"
                    class="bg-green-500 text-white py-3 px-6 rounded-md hover:bg-green-600 flex items-center justify-center disabled:bg-gray-300 disabled:cursor-not-allowed">
                    <Save class="w-5 h-5 mr-2" />
                    Update Order
>>>>>>> e0ccb28ba7b3cbed835e3f00a02c97c98379eda6
                </button>
            </div>
        </div>

<<<<<<< HEAD
        <!-- Order Preview Modal -->
        <div v-if="showOrderPreview"
            class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
            <div class="bg-white rounded-lg shadow-xl max-w-3xl w-full p-6 m-4">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-xl font-semibold">Order Preview</h3>
                    <button @click="showOrderPreview = false" class="text-gray-500 hover:text-gray-700">
                        <X class="w-5 h-5" />
                    </button>
                </div>

                <div class="mb-4">
                    <p class="font-medium">Customer: <span class="font-normal">{{ orderData.customerName }}</span></p>
                    <p class="font-medium">Order #: <span class="font-normal">{{ orderData.orderNumber }}</span></p>
                </div>

                <!-- Items with price changes -->
                <div v-if="priceChanges.length > 0" class="mb-4 p-3 bg-yellow-50 border border-yellow-300 rounded-md">
                    <p class="font-medium text-yellow-800 mb-2">Price Changes Detected</p>
                    <ul class="text-sm space-y-1">
                        <li v-for="(change, index) in priceChanges" :key="index" class="flex justify-between">
                            <span>{{ change.item.productName }} ({{ change.item.variety.varietyName }})</span>
                            <span>
                                <span class="line-through text-gray-500">₱{{ change.originalPrice.toFixed(2) }}</span>
                                <span class="ml-2 font-medium">₱{{ change.currentPrice.toFixed(2) }}</span>
                            </span>
                        </li>
                    </ul>
                </div>

                <!-- Order Items -->
                <div class="max-h-60 overflow-y-auto mb-4">
                    <table class="min-w-full divide-y divide-gray-200">
                        <thead class="bg-gray-50">
                            <tr>
                                <th scope="col"
                                    class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Item</th>
                                <th scope="col"
                                    class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Variety</th>
                                <th scope="col"
                                    class="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Price</th>
                                <th scope="col"
                                    class="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Qty</th>
                                <th scope="col"
                                    class="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Total</th>
                            </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200">
                            <tr v-for="(item, index) in orderData.items" :key="index">
                                <td class="px-3 py-2 whitespace-nowrap text-sm">{{ item.productName }}</td>
                                <td class="px-3 py-2 whitespace-nowrap text-sm">{{ item.variety.varietyName }}</td>
                                <td class="px-3 py-2 whitespace-nowrap text-sm text-right">₱{{ item.unitPrice.toFixed(2)
                                    }}</td>
                                <td class="px-3 py-2 whitespace-nowrap text-sm text-right">{{ item.quantity }}</td>
                                <td class="px-3 py-2 whitespace-nowrap text-sm text-right font-medium">₱{{
                                    item.totalPrice.toFixed(2) }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- Order Total -->
                <div class="border-t pt-4 mb-6">
                    <div class="flex justify-between items-center font-bold text-lg">
                        <span>Total:</span>
                        <span>₱{{ totalOrderPrice.toFixed(2) }}</span>
                    </div>
                </div>

                <div class="flex justify-end space-x-3">
                    <button @click="showOrderPreview = false" class="px-4 py-2 border border-gray-300 rounded-md">
                        Back to Edit
                    </button>
                    <button @click="updateOrder" class="bg-primary text-white px-4 py-2 rounded-md">
                        Update Order
                    </button>
                </div>
            </div>
        </div>

=======
>>>>>>> e0ccb28ba7b3cbed835e3f00a02c97c98379eda6
        <!-- Confirmation Modal -->
        <div v-if="showConfirmation" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                <h3 class="text-lg font-semibold mb-4">{{ confirmationTitle }}</h3>
                <p>{{ confirmationMessage }}</p>
                <div class="mt-6 flex justify-end space-x-3">
                    <button @click="cancelConfirmation" class="px-4 py-2 border border-gray-300 rounded-md">
                        Cancel
                    </button>
                    <button @click="confirmAction" class="bg-red-500 text-white px-4 py-2 rounded-md">
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useProductStore } from '@/stores/productStore';
import { useOrderStore } from '@/stores/orderStore';
import { useCategoryStore } from '@/stores/categoryStore';
<<<<<<< HEAD
import { Save, AlertCircle, CheckCircle, Clock, Search, AlertTriangle, X } from 'lucide-vue-next';
import ProductOrderCard from '@/components/order/ProductOrderCard.vue';
import OrderSummary from '@/components/order/OrderSummary.vue';
import {
    isVarietyOnSale,
    isSalePriceValid,
    shouldCombineItems,
    findPriceDiscrepancies
} from '@/utils/priceUtils';
=======
import { Save, AlertCircle, CheckCircle, Clock, Search, AlertTriangle } from 'lucide-vue-next';
import ProductOrderCard from '@/components/order/ProductOrderCard.vue';
import OrderSummary from '@/components/order/OrderSummary.vue';
>>>>>>> e0ccb28ba7b3cbed835e3f00a02c97c98379eda6

const route = useRoute();
const router = useRouter();
const productStore = useProductStore();
const orderStore = useOrderStore();
const categoryStore = useCategoryStore();

// State
const loading = ref(true);
const error = ref(null);
const orderData = ref({
    id: '',
    orderNumber: '',
    customerName: '',
    items: [],
    status: '',
    createdAt: null,
    updatedAt: null
});

const searchQuery = ref('');
const selectedCategory = ref('All');
const showConfirmation = ref(false);
const confirmationTitle = ref('');
const confirmationMessage = ref('');
const confirmationAction = ref(null);
<<<<<<< HEAD
const showOrderPreview = ref(false);
const priceChanges = ref([]);
let priceUpdateTimer = null;
=======
>>>>>>> e0ccb28ba7b3cbed835e3f00a02c97c98379eda6

// Computed
const products = computed(() => productStore.products);

const availableCategories = computed(() => {
    // Get unique categories from products
    const categories = new Set(['All']);

    products.value.forEach(product => {
        if (product.category && Array.isArray(product.category)) {
            product.category.forEach(cat => categories.add(cat));
        }
    });

    return Array.from(categories);
});

const filteredProducts = computed(() => {
    let result = products.value;

    // Filter by category
    if (selectedCategory.value !== 'All') {
        result = result.filter(product =>
            product.category &&
            Array.isArray(product.category) &&
            product.category.includes(selectedCategory.value)
        );
    }

    // Filter by search query
    if (searchQuery.value.trim()) {
        const query = searchQuery.value.toLowerCase();
        result = result.filter(product =>
            product.name.toLowerCase().includes(query) ||
            (product.description && product.description.toLowerCase().includes(query))
        );
    }

    return result;
});

// Check if any items have stock issues
const hasStockIssues = computed(() => {
    return orderData.value.items.some(item => {
        // Find the product
        const product = products.value.find(p => p.id === item.productId);
        if (!product) return true; // Product not found is a stock issue

        // Find the variety
        const variety = product.varieties.find(v => v.name === item.variety?.varietyName);
        if (!variety) return true; // Variety not found is a stock issue

        // Check if current quantity exceeds available stock
        return item.quantity > variety.stockQuantity;
    });
});

<<<<<<< HEAD
const totalOrderPrice = computed(() => {
    return orderData.value.items.reduce((total, item) => total + item.totalPrice, 0);
});

// Check if a sale has expired and grace period is over
const isSaleExpired = (item) => {
    if (!item.saleInfo?.onSale || !item.saleInfo?.gracePeriodEnd) return false;

    const now = Date.now();
    return now > item.saleInfo.gracePeriodEnd;
};

// Check for expired sales and update prices
const checkExpiredSales = () => {
    let hasUpdates = false;

    orderData.value.items.forEach((item, index) => {
        if (item.saleInfo?.onSale && isSaleExpired(item)) {
            // Sale has expired and grace period is over - update to regular price
            if (item.unitPrice !== item.saleInfo.originalPrice) {
                orderData.value.items[index].unitPrice = item.saleInfo.originalPrice;
                orderData.value.items[index].totalPrice = item.saleInfo.originalPrice * item.quantity;
                hasUpdates = true;
            }
        }
    });

    return hasUpdates;
};

=======
>>>>>>> e0ccb28ba7b3cbed835e3f00a02c97c98379eda6
// Methods
const selectCategory = (category) => {
    selectedCategory.value = category;
};

const loadOrder = async () => {
    try {
        loading.value = true;
        error.value = null;

        const orderId = route.params.id;
        const order = await orderStore.fetchOrderById(orderId);

        if (!order) {
            error.value = 'Order not found';
            return;
        }

        // Transform order data to match our component's structure
        orderData.value = {
            id: order.id,
            orderNumber: order.orderNumber,
            customerName: order.client,
            status: order.status,
            createdAt: order.createdAt,
            updatedAt: order.updatedAt,
            items: order.items.map(item => {
                // Find the product to get the max quantity
                const product = productStore.products.find(p => p.id === item.productId);
                let maxQuantity = 999; // Default high value

                if (product) {
                    // Find the matching variety
                    const variety = product.varieties.find(v =>
                        v.name === (item.variety?.varietyName || '')
                    );
                    if (variety) {
                        maxQuantity = variety.stockQuantity;
                    }
                }

<<<<<<< HEAD
                // Extract sale info from pricingSnapshot
                const saleInfo = item.pricingSnapshot ? {
                    originalPrice: item.pricingSnapshot.originalPrice || item.unitPrice,
                    salePrice: item.pricingSnapshot.salePrice,
                    onSale: item.pricingSnapshot.onSale || false,
                    saleEndTime: item.pricingSnapshot.saleEndTime,
                    // Add grace period (1 hour) if sale end time exists
                    gracePeriodEnd: item.pricingSnapshot.saleEndTime ?
                        item.pricingSnapshot.saleEndTime + (60 * 60 * 1000) : null
                } : null;

=======
>>>>>>> e0ccb28ba7b3cbed835e3f00a02c97c98379eda6
                return {
                    productId: item.productId,
                    productName: item.product,
                    quantity: item.quantity,
                    pricePerUnit: item.unitPrice || (item.variety ? item.variety.varietyPrice : 0),
                    unitPrice: item.unitPrice || (item.variety ? item.variety.varietyPrice : 0),
                    totalPrice: item.totalPrice,
                    maxQuantity: maxQuantity,
<<<<<<< HEAD
                    saleInfo: saleInfo,
=======
>>>>>>> e0ccb28ba7b3cbed835e3f00a02c97c98379eda6
                    // Preserve original pricing information
                    pricingSnapshot: item.pricingSnapshot || {
                        unitPrice: item.unitPrice || (item.variety ? item.variety.varietyPrice : 0),
                        originalPrice: item.variety?.originalPrice || item.unitPrice,
                        isOnSale: item.variety?.isOnSale || false,
                        salePrice: item.variety?.salePrice || null
                    },
                    variety: item.variety ? {
                        varietyName: item.variety.varietyName,
                        varietyUnit: item.variety.varietyUnit || item.variety.varietyName,
                        varietyQuantity: item.variety.varietyQuantity,
                        varietyPrice: item.variety.varietyPrice,
                        originalPrice: item.variety.originalPrice || item.variety.varietyPrice,
                        isOnSale: item.variety.isOnSale || false,
                        salePrice: item.variety.salePrice || null
                    } : null
                };
            })
        };
<<<<<<< HEAD

        // Check for expired sales
        checkExpiredSales();
=======
>>>>>>> e0ccb28ba7b3cbed835e3f00a02c97c98379eda6
    } catch (err) {
        console.error('Error loading order:', err);
        error.value = 'Failed to load order. Please try again.';
    } finally {
        loading.value = false;
    }
};

<<<<<<< HEAD
=======
// Check if a variety is on sale
const isVarietyOnSale = (variety) => {
    if (!variety?.onSale || !variety?.sale) return false;

    const now = Date.now();
    const startDate = variety.sale.startDate?.seconds * 1000;
    const endDate = variety.sale.endDate?.seconds * 1000;

    return now >= startDate && now <= endDate;
};

>>>>>>> e0ccb28ba7b3cbed835e3f00a02c97c98379eda6
// Calculate price for an item
const calculateItemPrice = (variety) => {
    if (!variety) return 0;

    if (isVarietyOnSale(variety)) {
        return variety.sale.salePrice;
    }

    return variety.price;
};

const updateItemQuantity = ({ index, quantity }) => {
    const item = orderData.value.items[index];

    if (quantity <= 0) {
        removeItem(index);
        return;
    }

    // Find current stock
    const product = products.value.find(p => p.id === item.productId);
    if (product) {
        const variety = product.varieties.find(v => v.name === item.variety?.varietyName);
        if (variety) {
            // Update max quantity based on current stock
            item.maxQuantity = variety.stockQuantity;

            // Limit quantity to available stock
            if (quantity > variety.stockQuantity) {
                quantity = variety.stockQuantity;
                console.log('Maximum Stock Reached');
            }
        }
    }

<<<<<<< HEAD
    const pricePerUnit = item.unitPrice;
=======
    const pricePerUnit = item.pricePerUnit || item.unitPrice;
>>>>>>> e0ccb28ba7b3cbed835e3f00a02c97c98379eda6

    orderData.value.items[index] = {
        ...item,
        quantity: quantity,
        totalPrice: pricePerUnit * quantity
    };
};

// Add item to order
<<<<<<< HEAD
const addToOrder = (newItemInfo) => {
    // Find if this exact product+variety combination already exists with compatible pricing
    const existingItemIndex = orderData.value.items.findIndex(item =>
        shouldCombineItems(item, newItemInfo)
=======
const addToOrder = ({ product, variety, quantity, pricePerUnit, totalPrice, saleInfo }) => {
    // Find if this exact product+variety combination already exists
    const existingItemIndex = orderData.value.items.findIndex(item =>
        item.productId === product.id &&
        item.variety?.varietyName === variety.name
>>>>>>> e0ccb28ba7b3cbed835e3f00a02c97c98379eda6
    );

    if (existingItemIndex !== -1) {
        // Update existing item with same variety
        const existingItem = orderData.value.items[existingItemIndex];
<<<<<<< HEAD
        const newQuantity = existingItem.quantity + newItemInfo.quantity;
        const maxQuantity = newItemInfo.variety.stockQuantity;

        // If existing item is not on sale but new item is on sale, update to sale price
        if (!existingItem.saleInfo?.onSale && newItemInfo.saleInfo.onSale) {
            orderData.value.items[existingItemIndex] = {
                ...existingItem,
                quantity: Math.min(newQuantity, maxQuantity),
                unitPrice: newItemInfo.pricePerUnit,
                saleInfo: newItemInfo.saleInfo,
                totalPrice: newItemInfo.pricePerUnit * Math.min(newQuantity, maxQuantity)
            };
        } else {
            // Just update quantity
            orderData.value.items[existingItemIndex] = {
                ...existingItem,
                quantity: Math.min(newQuantity, maxQuantity),
                totalPrice: existingItem.unitPrice * Math.min(newQuantity, maxQuantity)
            };
        }
    } else {
        // Add as a new item
        orderData.value.items.push({
            productId: newItemInfo.productId,
            productName: newItemInfo.productName,
            quantity: newItemInfo.quantity,
            variety: {
                varietyName: newItemInfo.variety.name,
                varietyUnit: newItemInfo.variety.unit,
                varietyQuantity: newItemInfo.variety.quantity,
                originalPrice: newItemInfo.variety.price,
                onSale: newItemInfo.saleInfo.onSale,
                salePrice: newItemInfo.saleInfo.onSale ? newItemInfo.saleInfo.salePrice : null
            },
            maxQuantity: newItemInfo.variety.stockQuantity,
            unitPrice: newItemInfo.pricePerUnit,
            totalPrice: newItemInfo.pricePerUnit * newItemInfo.quantity,
            saleInfo: newItemInfo.saleInfo,
            priceSource: newItemInfo.saleInfo.onSale ? 'sale' : 'regular'
=======
        const newQuantity = existingItem.quantity + quantity;

        // Check if new quantity exceeds stock
        if (newQuantity > variety.stockQuantity) {
            console.log('Maximum Stock Reached');
            orderData.value.items[existingItemIndex] = {
                ...existingItem,
                quantity: variety.stockQuantity,
                totalPrice: pricePerUnit * variety.stockQuantity
            };
        } else {
            orderData.value.items[existingItemIndex] = {
                ...existingItem,
                quantity: newQuantity,
                totalPrice: pricePerUnit * newQuantity
            };
        }
    } else {
        // Add as a new item for different varieties
        orderData.value.items.push({
            productId: product.id,
            productName: product.name,
            quantity,
            pricePerUnit,
            unitPrice: pricePerUnit,
            maxQuantity: variety.stockQuantity,
            pricingSnapshot: {
                unitPrice: pricePerUnit,
                originalPrice: variety.price,
                isOnSale: saleInfo.isOnSale,
                salePrice: saleInfo.isOnSale ? saleInfo.salePrice : null
            },
            variety: {
                varietyName: variety.name,
                varietyUnit: variety.unit,
                varietyQuantity: variety.quantity,
                varietyPrice: pricePerUnit,
                originalPrice: variety.price,
                isOnSale: saleInfo.isOnSale,
                salePrice: saleInfo.isOnSale ? saleInfo.salePrice : null
            },
            totalPrice: pricePerUnit * quantity
>>>>>>> e0ccb28ba7b3cbed835e3f00a02c97c98379eda6
        });
    }
};

const removeItem = (index) => {
    orderData.value.items.splice(index, 1);
};

<<<<<<< HEAD
// Handle price updates from OrderSummary component
const handlePriceUpdates = (updatedItems) => {
    orderData.value.items = updatedItems;
};

// Preview order before updating
const previewOrder = () => {
    if (orderData.value.items.length === 0) {
        alert('Cannot update an order with no items');
        return;
    }

    // Check for stock issues
    if (hasStockIssues.value) {
        if (!confirm('Some items have stock issues. Do you want to continue?')) {
            return;
        }
    }

    // Check for expired sales before previewing
    checkExpiredSales();

    // Check for price discrepancies
    priceChanges.value = findPriceDiscrepancies(orderData.value.items, productStore.products);

    showOrderPreview.value = true;
};

const updateOrder = async () => {
    try {
=======
const updateOrder = async () => {
    try {
        if (orderData.value.items.length === 0) {
            alert('Cannot update an order with no items');
            return;
        }

        // Check for stock issues
        if (hasStockIssues.value) {
            if (!confirm('Some items have stock issues. Do you want to continue?')) {
                return;
            }
        }

>>>>>>> e0ccb28ba7b3cbed835e3f00a02c97c98379eda6
        // Prepare items for submission
        const itemsForSubmission = orderData.value.items.map(item => ({
            productId: item.productId,
            product: item.productName,
            quantity: item.quantity,
<<<<<<< HEAD
            unitPrice: item.unitPrice,
            variety: {
                varietyName: item.variety.varietyName,
                varietyUnit: item.variety.varietyUnit,
                varietyQuantity: item.variety.varietyQuantity
            },
            totalPrice: item.totalPrice,
            pricingSnapshot: item.pricingSnapshot || {
                unitPrice: item.unitPrice,
                originalPrice: item.variety?.originalPrice || item.unitPrice,
                onSale: item.saleInfo?.onSale || false,
                salePrice: item.saleInfo?.salePrice || null,
                saleEndTime: item.saleInfo?.saleEndTime || null
=======
            unitPrice: item.pricePerUnit || item.unitPrice,
            variety: item.variety,
            totalPrice: item.totalPrice,
            pricingSnapshot: item.pricingSnapshot || {
                unitPrice: item.pricePerUnit || item.unitPrice,
                originalPrice: item.variety?.originalPrice || item.pricePerUnit,
                isOnSale: item.variety?.isOnSale || false,
                salePrice: item.variety?.salePrice || null
>>>>>>> e0ccb28ba7b3cbed835e3f00a02c97c98379eda6
            }
        }));

        await orderStore.updateOrder({
            id: orderData.value.id,
            customerName: orderData.value.customerName,
            items: itemsForSubmission,
            totalPrice: orderData.value.items.reduce((total, item) => total + item.totalPrice, 0)
        });

        alert('Order updated successfully');
        router.push('/administrator/orders');
    } catch (error) {
        console.error('Error updating order:', error);
        alert('Failed to update order: ' + error.message);
    }
};

const confirmVoidOrder = () => {
    confirmationTitle.value = 'Void Order';
    confirmationMessage.value = 'Are you sure you want to void this order? This action cannot be undone.';
    confirmationAction.value = voidOrder;
    showConfirmation.value = true;
};

const voidOrder = async () => {
    try {
        await orderStore.voidOrder(orderData.value.id);
        orderData.value.status = 'Voided';
        alert('Order voided successfully');
        showConfirmation.value = false;
    } catch (error) {
        console.error('Error voiding order:', error);
        alert('Failed to void order: ' + error.message);
    }
};

const cancelConfirmation = () => {
    showConfirmation.value = false;
    confirmationAction.value = null;
};

const confirmAction = () => {
    if (confirmationAction.value) {
        confirmationAction.value();
    }
    showConfirmation.value = false;
};

<<<<<<< HEAD
// Set up real-time stock monitoring and price checking
const setupMonitoring = () => {
    // Check for stock changes and expired sales every 30 seconds
    const intervalId = setInterval(() => {
        // Check for expired sales
        const hasExpiredSales = checkExpiredSales();

        // Update stock quantities
=======
// Set up real-time stock monitoring
const setupStockMonitoring = () => {
    // Check for stock changes every 30 seconds
    const intervalId = setInterval(() => {
>>>>>>> e0ccb28ba7b3cbed835e3f00a02c97c98379eda6
        if (orderData.value.items.length > 0) {
            // Update max quantities based on current stock
            orderData.value.items.forEach((item, index) => {
                const product = products.value.find(p => p.id === item.productId);
                if (product) {
                    const variety = product.varieties.find(v => v.name === item.variety?.varietyName);
                    if (variety) {
                        // Update max quantity
                        orderData.value.items[index].maxQuantity = variety.stockQuantity;

                        // If current quantity exceeds stock, adjust it
                        if (item.quantity > variety.stockQuantity) {
                            orderData.value.items[index].quantity = variety.stockQuantity;
<<<<<<< HEAD
                            orderData.value.items[index].totalPrice = item.unitPrice * variety.stockQuantity;
=======
                            orderData.value.items[index].totalPrice = item.pricePerUnit * variety.stockQuantity;
>>>>>>> e0ccb28ba7b3cbed835e3f00a02c97c98379eda6
                        }
                    }
                }
            });
        }
    }, 30000);

    // Clean up on component unmount
    onUnmounted(() => {
        clearInterval(intervalId);
    });
};

onMounted(async () => {
    await Promise.all([
        productStore.fetchProducts(),
        categoryStore.fetchCategoryNamesRealtime(),
        loadOrder()
    ]);

<<<<<<< HEAD
    // Set up real-time monitoring
    setupMonitoring();
=======
    // Set up real-time stock monitoring
    setupStockMonitoring();
>>>>>>> e0ccb28ba7b3cbed835e3f00a02c97c98379eda6
});
</script>