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
                class="mb-6" />

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
                <button @click="updateOrder" :disabled="orderData.status === 'Voided' || orderData.items.length === 0"
                    class="bg-green-500 text-white py-3 px-6 rounded-md hover:bg-green-600 flex items-center justify-center disabled:bg-gray-300 disabled:cursor-not-allowed">
                    <Save class="w-5 h-5 mr-2" />
                    Update Order
                </button>
            </div>
        </div>

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
import { Save, AlertCircle, CheckCircle, Clock, Search, AlertTriangle } from 'lucide-vue-next';
import ProductOrderCard from '@/components/order/ProductOrderCard.vue';
import OrderSummary from '@/components/order/OrderSummary.vue';

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

                return {
                    productId: item.productId,
                    productName: item.product,
                    quantity: item.quantity,
                    pricePerUnit: item.unitPrice || (item.variety ? item.variety.varietyPrice : 0),
                    unitPrice: item.unitPrice || (item.variety ? item.variety.varietyPrice : 0),
                    totalPrice: item.totalPrice,
                    maxQuantity: maxQuantity,
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
    } catch (err) {
        console.error('Error loading order:', err);
        error.value = 'Failed to load order. Please try again.';
    } finally {
        loading.value = false;
    }
};

// Check if a variety is on sale
const isVarietyOnSale = (variety) => {
    if (!variety?.onSale || !variety?.sale) return false;

    const now = Date.now();
    const startDate = variety.sale.startDate?.seconds * 1000;
    const endDate = variety.sale.endDate?.seconds * 1000;

    return now >= startDate && now <= endDate;
};

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

    const pricePerUnit = item.pricePerUnit || item.unitPrice;

    orderData.value.items[index] = {
        ...item,
        quantity: quantity,
        totalPrice: pricePerUnit * quantity
    };
};

// Add item to order
const addToOrder = ({ product, variety, quantity, pricePerUnit, totalPrice, saleInfo }) => {
    // Find if this exact product+variety combination already exists
    const existingItemIndex = orderData.value.items.findIndex(item =>
        item.productId === product.id &&
        item.variety?.varietyName === variety.name
    );

    if (existingItemIndex !== -1) {
        // Update existing item with same variety
        const existingItem = orderData.value.items[existingItemIndex];
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
        });
    }
};

const removeItem = (index) => {
    orderData.value.items.splice(index, 1);
};

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

        // Prepare items for submission
        const itemsForSubmission = orderData.value.items.map(item => ({
            productId: item.productId,
            product: item.productName,
            quantity: item.quantity,
            unitPrice: item.pricePerUnit || item.unitPrice,
            variety: item.variety,
            totalPrice: item.totalPrice,
            pricingSnapshot: item.pricingSnapshot || {
                unitPrice: item.pricePerUnit || item.unitPrice,
                originalPrice: item.variety?.originalPrice || item.pricePerUnit,
                isOnSale: item.variety?.isOnSale || false,
                salePrice: item.variety?.salePrice || null
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

// Set up real-time stock monitoring
const setupStockMonitoring = () => {
    // Check for stock changes every 30 seconds
    const intervalId = setInterval(() => {
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
                            orderData.value.items[index].totalPrice = item.pricePerUnit * variety.stockQuantity;
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

    // Set up real-time stock monitoring
    setupStockMonitoring();
});
</script>