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
            <h2 class="text-lg font-semibold mb-4">Select Products</h2>

            <!-- Product List -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div v-for="product in products" :key="product.id"
                    class="border rounded-lg p-4 hover:shadow-lg transition-shadow">

                    <!-- Product Basic Info -->
                    <div class="flex items-start justify-between mb-3">
                        <div>
                            <h3 class="font-semibold">{{ product.name }}</h3>
                            <div class="text-sm text-gray-600">
                                Stock: {{ getTotalStockForProduct(product) }}
                            </div>
                        </div>
                    </div>

                    <!-- Variety Selection -->
                    <div class="mb-3">
                        <label class="block text-sm font-medium text-gray-700 mb-1">Select Variety</label>
                        <select v-model="selectedVarieties[product.id]"
                            class="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary">
                            <option value="">Select a variety</option>
                            <option v-for="variety in product.varieties" :key="variety.id" :value="variety">
                                {{ variety.name }} ({{ variety.quantity }} {{ variety.unit }}) -
                                {{ isVarietyOnSale(variety) ? `₱${variety.sale.salePrice.toFixed(2)} (Sale)` :
                                `₱${variety.price.toFixed(2)}` }}
                            </option>
                        </select>
                    </div>

                    <!-- Quantity Input -->
                    <div class="flex items-center space-x-3">
                        <button @click="decrementQuantity(product.id)" class="p-1 rounded-full hover:bg-gray-100"
                            :disabled="!getProductQuantity(product.id)">
                            <Minus class="w-5 h-5" />
                        </button>

                        <input type="number" v-model="quantities[product.id]" min="0"
                            :max="getMaxQuantityForProduct(product.id)"
                            class="w-20 text-center rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary" />

                        <button @click="incrementQuantity(product.id)" class="p-1 rounded-full hover:bg-gray-100"
                            :disabled="getProductQuantity(product.id) >= getMaxQuantityForProduct(product.id)">
                            <Plus class="w-5 h-5" />
                        </button>
                    </div>

                    <button @click="addToOrder(product)"
                        :disabled="!getProductQuantity(product.id) || !selectedVarieties[product.id]"
                        class="mt-3 w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-dark disabled:bg-gray-300">
                        Add to Order
                    </button>
                </div>
            </div>
        </div>

        <!-- Order Summary -->
        <div class="bg-white p-4 rounded-lg shadow">
            <h2 class="text-lg font-semibold mb-4">Order Summary</h2>

            <div v-if="orderItems.length > 0">
                <div class="space-y-4">
                    <div v-for="(item, index) in orderItems" :key="index"
                        class="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                        <div>
                            <div class="font-medium">{{ item.productName }}</div>
                            <div class="text-sm text-gray-600">
                                <span v-if="item.variety">
                                    {{ item.variety.name }} ({{ item.variety.quantity }} {{ item.variety.unit }})
                                </span>
                            </div>
                        </div>

                        <!-- Quantity controls in summary -->
                        <div class="flex items-center space-x-3">
                            <button @click="updateOrderItemQuantity(index, item.quantity - 1)"
                                class="p-1 rounded-full hover:bg-gray-100" :disabled="item.quantity <= 1">
                                <Minus class="w-4 h-4" />
                            </button>

                            <span class="w-8 text-center">{{ item.quantity }}</span>

                            <button @click="updateOrderItemQuantity(index, item.quantity + 1)"
                                class="p-1 rounded-full hover:bg-gray-100"
                                :disabled="item.maxQuantity <= item.quantity">
                                <Plus class="w-4 h-4" />
                            </button>
                        </div>

                        <div class="text-right">
                            <div class="font-bold">₱{{ item.totalPrice.toFixed(2) }}</div>
                            <button @click="removeFromOrderByIndex(index)" class="text-red-500 hover:text-red-600 p-1">
                                <Trash2 class="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                <div class="mt-6 border-t pt-4">
                    <div class="flex justify-between items-center font-bold text-lg">
                        <span>Total:</span>
                        <span>₱{{ totalOrderPrice.toFixed(2) }}</span>
                    </div>
                </div>

                <button @click="submitOrder"
                    class="mt-6 w-full bg-green-500 text-white py-3 px-4 rounded-md hover:bg-green-600 flex items-center justify-center"
                    :disabled="!customerName || orderItems.length === 0">
                    <ShoppingCart class="w-5 h-5 mr-2" />
                    Place Order
                </button>
            </div>

            <div v-else class="text-center text-gray-500 py-6">
                No items in order
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useProductStore } from '@/stores/productStore';
import { useOrderStore } from '@/stores/orderStore';
import { Plus, Minus, ShoppingCart, Trash2 } from 'lucide-vue-next';

const router = useRouter();
const productStore = useProductStore();
const orderStore = useOrderStore();

// State
const customerName = ref('');
const quantities = ref({});
const selectedVarieties = ref({});
const orderItems = ref([]);

// Computed
const products = computed(() => productStore.products);

const totalOrderPrice = computed(() => {
    return orderItems.value.reduce((total, item) => total + item.totalPrice, 0);
});

// Methods
// Check if a variety is on sale
const isVarietyOnSale = (variety) => {
    if (!variety?.onSale || !variety?.sale) return false;

    const now = Date.now();
    const startDate = variety.sale.startDate?.seconds * 1000;
    const endDate = variety.sale.endDate?.seconds * 1000;

    return now >= startDate && now <= endDate;
};

// Get total stock for a product (sum of all varieties)
const getTotalStockForProduct = (product) => {
    if (!product.varieties || product.varieties.length === 0) return 0;
    return product.varieties.reduce((sum, variety) => sum + variety.stockQuantity, 0);
};

// Get quantity for a product
const getProductQuantity = (productId) => {
    return quantities.value[productId] || 0;
};

// Get max quantity for a product based on selected variety
const getMaxQuantityForProduct = (productId) => {
    const variety = selectedVarieties.value[productId];
    if (!variety) return 0;
    return variety.stockQuantity;
};

// Increment quantity
const incrementQuantity = (productId) => {
    const currentQty = getProductQuantity(productId);
    const maxQty = getMaxQuantityForProduct(productId);
    if (currentQty < maxQty) {
        quantities.value[productId] = currentQty + 1;
    }
};

// Decrement quantity
const decrementQuantity = (productId) => {
    const currentQty = getProductQuantity(productId);
    if (currentQty > 0) {
        quantities.value[productId] = currentQty - 1;
    }
};

// Check if two varieties are the same
const isSameVariety = (variety1, variety2) => {
    if (!variety1 && !variety2) return true;
    if (!variety1 || !variety2) return false;

    // Compare by name (primary identifier)
    if (variety1.name && variety2.name) {
        return variety1.name === variety2.name;
    }

    return false;
};

// Calculate price for an item
const calculateItemPrice = (variety) => {
    if (!variety) return 0;

    if (isVarietyOnSale(variety)) {
        return variety.sale.salePrice;
    }

    return variety.price;
};

// Update quantity for an item in the order
const updateOrderItemQuantity = (index, newQuantity) => {
    const item = orderItems.value[index];

    if (newQuantity <= 0) {
        removeFromOrderByIndex(index);
        return;
    }

    if (newQuantity > item.maxQuantity) {
        newQuantity = item.maxQuantity;
        console.log('Maximum Stock Reached');
    }

    const pricePerUnit = item.pricePerUnit;

    orderItems.value[index] = {
        ...item,
        quantity: newQuantity,
        totalPrice: pricePerUnit * newQuantity
    };
};

// Add item to order
const addToOrder = (product) => {
    const quantity = getProductQuantity(product.id);
    if (quantity <= 0) return;

    const variety = selectedVarieties.value[product.id];
    if (!variety) return;

    const pricePerUnit = calculateItemPrice(variety);

    // Find if this exact product+variety combination already exists
    const existingItemIndex = orderItems.value.findIndex(item =>
        item.productId === product.id && isSameVariety(item.variety, variety)
    );

    if (existingItemIndex !== -1) {
        // Update existing item with same variety
        const existingItem = orderItems.value[existingItemIndex];
        const newQuantity = existingItem.quantity + quantity;

        // Check if new quantity exceeds stock
        if (newQuantity > variety.stockQuantity) {
            console.log('Maximum Stock Reached');
            orderItems.value[existingItemIndex] = {
                ...existingItem,
                quantity: variety.stockQuantity,
                totalPrice: pricePerUnit * variety.stockQuantity
            };
        } else {
            orderItems.value[existingItemIndex] = {
                ...existingItem,
                quantity: newQuantity,
                totalPrice: pricePerUnit * newQuantity
            };
        }
    } else {
        // Add as a new item
        orderItems.value.push({
            productId: product.id,
            productName: product.name,
            quantity,
            pricePerUnit,
            variety: {
                name: variety.name,
                unit: variety.unit,
                quantity: variety.quantity,
                discountPrice: pricePerUnit
            },
            maxQuantity: variety.stockQuantity,
            totalPrice: pricePerUnit * quantity
        });
    }

    // Reset inputs
    quantities.value[product.id] = 0;
    selectedVarieties.value[product.id] = null;
};

// Remove item from order by index
const removeFromOrderByIndex = (index) => {
    orderItems.value.splice(index, 1);
};

// Submit order
const submitOrder = async () => {
    try {
        if (!customerName.value) {
            alert('Please enter a customer name');
            return;
        }

        if (orderItems.value.length === 0) {
            alert('Please add at least one item to the order');
            return;
        }

        await orderStore.createOrder({
            customerName: customerName.value,
            items: orderItems.value,
            totalPrice: totalOrderPrice.value
        });

        alert('Order created successfully');
        router.push('/administrator/orders');
    } catch (error) {
        console.error('Error creating order:', error);
        alert('Failed to create order: ' + error.message);
    }
};

onMounted(async () => {
    await productStore.fetchProducts();
});
</script>