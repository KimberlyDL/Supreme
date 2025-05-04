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
            @remove-item="removeFromOrderByIndex">
            <template #actions>
                <button @click="submitOrder"
                    class="mt-6 w-full bg-green-500 text-white py-3 px-4 rounded-md hover:bg-green-600 flex items-center justify-center"
                    :disabled="!customerName || orderItems.length === 0">
                    <ShoppingCart class="w-5 h-5 mr-2" />
                    Place Order
                </button>
            </template>
        </OrderSummary>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useProductStore } from '@/stores/productStore';
import { useOrderStore } from '@/stores/orderStore';
import { useCategoryStore } from '@/stores/categoryStore';
import { ShoppingCart, Search } from 'lucide-vue-next';
import ProductOrderCard from '@/components/order/ProductOrderCard.vue';
import OrderSummary from '@/components/order/OrderSummary.vue';

const router = useRouter();
const productStore = useProductStore();
const orderStore = useOrderStore();
const categoryStore = useCategoryStore();

// State
const customerName = ref('Guest');
const orderItems = ref([]);
const searchQuery = ref('');
const selectedCategory = ref('All');

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
            // || (product.description && product.description.toLowerCase().includes(query))
        );
    }

    return result;
});

// Methods
const selectCategory = (category) => {
    selectedCategory.value = category;
};


//#region AddToOrder
const addToOrder = ({ product, productId, productName, variety, quantity, pricePerUnit, totalPrice, saleInfo }) => {

    console.log('Adding to p:', product,);
    console.log('Adding to v:', variety);
    console.log('Adding to q:', quantity);
    console.log('Adding to ppu:', pricePerUnit);
    console.log('Adding to tp:', totalPrice);
    console.log('Adding to s:', saleInfo);

    // Find if this exact product+variety combination already exists
    const existingItemIndex = orderItems.value.findIndex(item =>
        item.productId === productId &&
        item.variety?.varietyName === variety.name
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
            // productId: product.id,
            // productName: product.name,
            productId: productId,
            productName: productName,
            quantity,
            // pricePerUnit: pricePerUnit,
            variety: {
                varietyName: variety.name,
                varietyUnit: variety.unit,
                varietyQuantity: variety.quantity,

                //   varietyPrice: pricePerUnit,

                originalPrice: variety.price,
                onSale: saleInfo.onSale,
                salePrice: saleInfo.onSale ? saleInfo.salePrice : null
            },

            maxQuantity: variety.stockQuantity,
            unitPrice: pricePerUnit,
            totalPrice: pricePerUnit * quantity
        });
    }

    // Save to localStorage for persistence
    saveOrderToLocalStorage();
};

//#endregion

// Update quantity for an item in the order
const updateOrderItemQuantity = ({ index, quantity }) => {
    const item = orderItems.value[index];
    const pricePerUnit = item.pricePerUnit || item.unitPrice;

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

// Submit order
const submitOrder = async () => {
    try {
        if (customerName.value.trim() === '') {
            alert('Please enter a customer name');
            return;
        }

        if (orderItems.value.length === 0) {
            alert('Please add at least one item to the order');
            return;
        }

        // console.log('Submitting order with items:', orderItems.value);

        // Prepare items for submission
        const itemsForSubmission = orderItems.value.map(item => (
            // console.log('Submitting item:', item),
            {
                productId: item.productId,
                productName: item.productName,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                variety: item.variety,
                totalPrice: item.totalPrice,
                // Store pricing information for historical reference
                pricingSnapshot: {
                    // unitPrice: item.pricePerUnit || item.unitPrice,
                    originalPrice: item.variety?.originalPrice || item.pricePerUnit,
                    onSale: item.variety?.onSale || false,
                    salePrice: item.variety?.salePrice || null
                }
            }));


        console.log('Submitting order with items:', itemsForSubmission);

        await orderStore.createOrder({
            customerName: customerName.value,
            items: itemsForSubmission,
            totalPrice: orderItems.value.reduce((total, item) => total + item.totalPrice, 0)
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
});
</script>