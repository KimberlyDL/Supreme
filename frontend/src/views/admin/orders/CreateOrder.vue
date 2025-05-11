<!-- frontend\src\views\admin\orders\CreateOrder.vue -->
<template>
    <div class="container mx-auto p-4">
        <h1 class="text-2xl font-bold mb-6">Create Order</h1>

        <!-- Customer Information -->
        <div class="mb-6 bg-white p-4 rounded-lg shadow">
            <h2 class="text-lg font-semibold mb-4">Customer Information</h2>
            <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700">Customer Name</label>
                <input v-model="customerName" type="text"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary" />
            </div>
        </div>

        <!-- Product Selection -->
        <div class="mb-6 bg-white p-4 rounded-lg shadow">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-lg font-semibold">Select Products</h2>

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
                    :order-items="orderItems" @add-to-order="addToOrder" />
            </div>
        </div>

        <!-- Order Summary -->
        <OrderSummary :items="orderItems" @update-quantity="updateOrderItemQuantity"
            @remove-item="removeFromOrderByIndex" @update-prices="handlePriceUpdates">
            <template #actions>
                <button @click="previewOrder"
                    class="mt-6 w-full bg-green-500 text-white py-3 px-4 rounded-md hover:bg-green-600 flex items-center justify-center"
                    :disabled="!customerName || orderItems.length === 0">
                    <ShoppingCart class="w-5 h-5 mr-2" />
                    Review Order
                </button>
            </template>
        </OrderSummary>

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
                    <p class="font-medium">Customer: <span class="font-normal">{{ customerName }}</span></p>
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
                                    Item
                                </th>
                                <th scope="col"
                                    class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Variety</th>
                                <th scope="col"
                                    class="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Price</th>
                                <th scope="col"
                                    class="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Qty
                                </th>
                                <th scope="col"
                                    class="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Total</th>
                            </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200">
                            <tr v-for="(item, index) in orderItems" :key="index">
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
                    <button @click="submitOrder" class="bg-primary text-white px-4 py-2 rounded-md">
                        Place Order
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import { useProductStore } from '@/stores/productStore';
import { useOrderStore } from '@/stores/orderStore';
import { useCategoryStore } from '@/stores/categoryStore';
import { ShoppingCart, Search, X } from 'lucide-vue-next';
import ProductOrderCard from '@/components/order/ProductOrderCard.vue';
import OrderSummary from '@/components/order/OrderSummary.vue';
import {
    isSalePriceValid,
    shouldCombineItems,
    findPriceDiscrepancies
} from '@/utils/priceUtils';

const router = useRouter();
const productStore = useProductStore();
const orderStore = useOrderStore();
const categoryStore = useCategoryStore();

// State
const customerName = ref('Guest');
const orderItems = ref([]);
const searchQuery = ref('');
const selectedCategory = ref('All');
const showOrderPreview = ref(false);
const priceChanges = ref([]);
let priceUpdateTimer = null;

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
            product.name.toLowerCase().includes(query)
        );
    }

    return result;
});

const totalOrderPrice = computed(() => {
    return orderItems.value.reduce((total, item) => total + item.totalPrice, 0);
});

// Methods
const selectCategory = (category) => {
    selectedCategory.value = category;
};

// Check if a sale has expired and grace period is over
const isSaleExpired = (item) => {
    if (!item.saleInfo?.onSale || !item.saleInfo?.gracePeriodEnd) return false;

    const now = Date.now();
    return now > item.saleInfo.gracePeriodEnd;
};

// Check for expired sales and update prices
const checkExpiredSales = () => {
    let hasUpdates = false;

    orderItems.value.forEach((item, index) => {
        if (item.saleInfo?.onSale && isSaleExpired(item)) {
            // Sale has expired and grace period is over - update to regular price
            if (item.unitPrice !== item.saleInfo.originalPrice) {
                orderItems.value[index].unitPrice = item.saleInfo.originalPrice;
                orderItems.value[index].totalPrice = item.saleInfo.originalPrice * item.quantity;
                hasUpdates = true;
            }
        }
    });

    if (hasUpdates) {
        saveOrderToLocalStorage();
    }
};

const addToOrder = (newItemInfo) => {
    // Find if this exact product+variety combination already exists with compatible pricing
    const existingItemIndex = orderItems.value.findIndex(item =>
        shouldCombineItems(item, newItemInfo)
    );

    if (existingItemIndex !== -1) {
        // Update existing item with same variety
        const existingItem = orderItems.value[existingItemIndex];
        const newQuantity = existingItem.quantity + newItemInfo.quantity;
        const maxQuantity = newItemInfo.variety.stockQuantity;

        // If existing item is not on sale but new item is on sale, update to sale price
        if (!existingItem.saleInfo?.onSale && newItemInfo.saleInfo.onSale) {
            orderItems.value[existingItemIndex] = {
                ...existingItem,
                quantity: Math.min(newQuantity, maxQuantity),
                unitPrice: newItemInfo.pricePerUnit,
                saleInfo: newItemInfo.saleInfo,
                totalPrice: newItemInfo.pricePerUnit * Math.min(newQuantity, maxQuantity)
            };
        } else {
            // Just update quantity
            orderItems.value[existingItemIndex] = {
                ...existingItem,
                quantity: Math.min(newQuantity, maxQuantity),
                totalPrice: existingItem.unitPrice * Math.min(newQuantity, maxQuantity)
            };
        }
    } else {
        // Add as a new item
        orderItems.value.push({
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
        });
    }

    // Save to localStorage for persistence
    saveOrderToLocalStorage();
};

// Update quantity for an item in the order
const updateOrderItemQuantity = ({ index, quantity }) => {
    const item = orderItems.value[index];
    const pricePerUnit = item.unitPrice;

    orderItems.value[index] = {
        ...item,
        quantity: quantity,
        totalPrice: pricePerUnit * quantity
    };

    // Save to localStorage for persistence
    saveOrderToLocalStorage();
};

// Remove item from order by index
const removeFromOrderByIndex = (index) => {
    orderItems.value.splice(index, 1);

    // Save to localStorage for persistence
    saveOrderToLocalStorage();
};

// Handle price updates from OrderSummary component
const handlePriceUpdates = (updatedItems) => {
    orderItems.value = updatedItems;
    saveOrderToLocalStorage();
};

// Preview order before submitting
const previewOrder = () => {
    if (customerName.value.trim() === '') {
        alert('Please enter a customer name');
        return;
    }

    if (orderItems.value.length === 0) {
        alert('Please add at least one item to the order');
        return;
    }

    // Check for expired sales before previewing
    checkExpiredSales();

    // Check for price discrepancies
    priceChanges.value = findPriceDiscrepancies(orderItems.value, productStore.products);

    showOrderPreview.value = true;
};

// Submit order
const submitOrder = async () => {
    try {
        // Prepare items for submission
        const itemsForSubmission = orderItems.value.map(item => ({
            productId: item.productId,
            product: item.productName,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            variety: {
                varietyName: item.variety.varietyName,
                varietyUnit: item.variety.varietyUnit,
                varietyQuantity: item.variety.varietyQuantity
            },
            totalPrice: item.totalPrice,
            // Store pricing information for historical reference
            pricingSnapshot: {
                originalPrice: item.variety?.originalPrice || item.unitPrice,
                onSale: item.saleInfo?.onSale || false,
                salePrice: item.saleInfo?.salePrice || null,
                saleEndTime: item.saleInfo?.saleEndTime || null
            }
        }));

        await orderStore.createOrder({
            customerName: customerName.value,
            items: itemsForSubmission,
            totalPrice: orderItems.value.reduce((total, item) => total + item.totalPrice, 0),
            status: 'Pending' // Orders start as pending until approved
        });

        // Clear localStorage after successful order
        localStorage.removeItem('draftOrder');

        alert('Order created successfully');
        router.push('/administrator/orders');
    } catch (error) {
        console.error('Error creating order:', error);
        alert('Failed to create order: ' + error.message);
    }
};

// Save current order to localStorage
const saveOrderToLocalStorage = () => {
    const orderData = {
        customerName: customerName.value,
        orderItems: orderItems.value
    };

    localStorage.setItem('draftOrder', JSON.stringify(orderData));
};

// Load order from localStorage
const loadOrderFromLocalStorage = () => {
    const savedOrder = localStorage.getItem('draftOrder');
    if (savedOrder) {
        try {
            const orderData = JSON.parse(savedOrder);
            customerName.value = orderData.customerName || '';
            orderItems.value = orderData.orderItems || [];
        } catch (error) {
            console.error('Error loading saved order:', error);
        }
    }
};

// Watch for changes to save to localStorage
watch(customerName, () => {
    saveOrderToLocalStorage();
});

onMounted(async () => {
    await Promise.all([
        productStore.fetchProducts(true),
        categoryStore.fetchCategoryNamesRealtime()
    ]);

    // Load any saved order data
    loadOrderFromLocalStorage();

    // Check for expired sales every 30 seconds
    priceUpdateTimer = setInterval(checkExpiredSales, 30000);

    // Initial check
    checkExpiredSales();
});

onBeforeUnmount(() => {
    if (priceUpdateTimer) {
        clearInterval(priceUpdateTimer);
    }
});
</script>