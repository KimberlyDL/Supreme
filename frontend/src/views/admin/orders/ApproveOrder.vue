<!-- frontend\src\views\admin\orders\ApproveOrder.vue -->
<template>
    <div class="container mx-auto p-4">
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-2xl font-bold text-primary-700">Approve Order</h1>
            <div class="flex space-x-3">
                <router-link 
                    to="/administrator/orders"
                    class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center"
                >
                    <ArrowLeft class="w-4 h-4 mr-2" />
                    Back to Orders
                </router-link>
            </div>
        </div>

        <div v-if="loading" class="flex justify-center items-center h-64">
            <div class="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent"></div>
        </div>

        <div v-else-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
            <p>{{ error }}</p>
            <button @click="loadOrder" class="text-red-700 underline mt-2">Try Again</button>
        </div>

        <div v-else>
            <!-- Order Status Banner -->
            <div v-if="orderData.status" :class="{
                'mb-6 p-4 rounded-lg text-white flex items-center': true,
                'bg-yellow-500': orderData.status === 'Pending',
                'bg-green-500': orderData.status === 'Completed',
                'bg-red-500': orderData.status === 'Voided'
            }">
                <AlertCircle v-if="orderData.status === 'Voided'" class="w-6 h-6 mr-2" />
                <CheckCircle v-else-if="orderData.status === 'Completed'"  class="w-6 h-6 mr-2" />
                <CheckCircle v-else-if="orderData.status === 'Completed'" class="w-6 h-6 mr-2" />
                <Clock v-else class="w-6 h-6 mr-2" />
                <div>
                    <span class="font-semibold">Order Status: {{ orderData.status }}</span>
                    <p v-if="orderData.status === 'Completed'" class="mt-1 text-sm">
                        This order has already been approved and inventory has been updated.
                    </p>
                    <p v-if="orderData.status === 'Voided'" class="mt-1 text-sm">
                        This order has been voided and cannot be approved.
                    </p>
                </div>
            </div>

            <!-- Order Details -->
            <div class="bg-white p-6 rounded-lg shadow-md mb-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                        <h2 class="text-lg font-semibold text-primary-700 mb-2">Order Information</h2>
                        <p><span class="font-medium">Order #:</span> {{ orderData.orderNumber }}</p>
                        <p><span class="font-medium">Customer:</span> {{ orderData.customerName }}</p>
                        <p><span class="font-medium">Date:</span> {{ formatDate(orderData.createdAt) }}</p>
                    </div>
                    <div>
                        <h2 class="text-lg font-semibold text-primary-700 mb-2">Order Summary</h2>
                        <p><span class="font-medium">Total Items:</span> {{ totalItems }}</p>
                        <p><span class="font-medium">Total Amount:</span> {{ formatPrice(totalOrderPrice) }}</p>
                    </div>
                </div>

                <!-- Stock Warning Banner -->
                <div v-if="hasStockIssues"
                    class="mb-6 bg-amber-100 border border-amber-300 text-amber-800 p-4 rounded-lg flex items-start">
                    <AlertTriangle class="w-6 h-6 mr-2 mt-0.5 flex-shrink-0" />
                    <div>
                        <span class="font-semibold">Stock Warning</span>
                        <p class="mt-1">
                            Some items in this order have stock issues. Please review the quantities before approving.
                        </p>
                    </div>
                </div>

                <!-- Order Items -->
                <h2 class="text-lg font-semibold text-primary-700 mb-4">Order Items</h2>
                <div class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-gray-200">
                        <thead class="bg-gray-50">
                            <tr>
                                <th scope="col"
                                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Product
                                </th>
                                <th scope="col"
                                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                                    Variety
                                </th>
                                <th scope="col"
                                    class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Price
                                </th>
                                <th scope="col"
                                    class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Quantity
                                </th>
                                <th scope="col"
                                    class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Total
                                </th>
                                <th scope="col"
                                    class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                                    Stock
                                </th>
                            </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200">
                            <tr v-for="(item, index) in orderData.items" :key="index"
                                :class="{ 'bg-red-50': item.quantity > item.maxQuantity }">
                                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {{ item.productName }}
                                    <div class="md:hidden text-xs text-gray-500">
                                        {{ item.variety.varietyName }}
                                    </div>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">
                                    {{ item.variety.varietyName }}
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                                    {{ formatPrice(item.unitPrice) }}
                                    <span v-if="item.saleInfo?.onSale" class="text-xs text-green-600 ml-1">(Sale)</span>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                                    {{ item.quantity }}
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium text-right">
                                    {{ formatPrice(item.totalPrice) }}
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-right hidden md:table-cell"
                                    :class="{ 'text-red-600 font-medium': item.quantity > item.maxQuantity }">
                                    {{ item.maxQuantity }} available
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- Total -->
                <div class="mt-6 border-t pt-4 flex justify-end">
                    <div class="text-right">
                        <div class="text-sm text-gray-500">Total</div>
                        <div class="text-2xl font-bold text-primary-700">{{ formatPrice(totalOrderPrice) }}</div>
                    </div>
                </div>
            </div>

            <!-- Approval Actions -->
            <div class="flex justify-end space-x-4">
                <button 
                    @click="confirmVoidOrder" 
                    :disabled="orderData.status !== 'Pending'"
                    class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center"
                >
                    <X class="w-4 h-4 mr-2" />
                    Void Order
                </button>
                <button 
                    @click="confirmApproveOrder" 
                    :disabled="orderData.status !== 'Pending' || hasStockIssues"
                    class="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center"
                >
                    <Check class="w-4 h-4 mr-2" />
                    Approve Order
                </button>
            </div>
        </div>

        <!-- Confirmation Modal -->
        <div v-if="showConfirmation" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                <h3 class="text-lg font-semibold mb-4">{{ confirmationTitle }}</h3>
                <p>{{ confirmationMessage }}</p>
                <div class="mt-6 flex justify-end space-x-3">
                    <button 
                        @click="cancelConfirmation" 
                        class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button 
                        @click="confirmAction"
                        :class="{ 
                            'px-4 py-2 text-white rounded-lg': true,
                            'bg-red-500 hover:bg-red-600': confirmationType === 'void', 
                            'bg-green-500 hover:bg-green-600': confirmationType === 'approve' 
                        }"
                    >
                        {{ confirmationType === 'void' ? 'Void' : 'Approve' }}
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useProductStore } from '@/stores/productStore';
import { useOrderStore } from '@/stores/orderStore';
import { 
    AlertCircle, 
    CheckCircle, 
    Clock, 
    AlertTriangle, 
    ArrowLeft, 
    Check, 
    X 
} from 'lucide-vue-next';

const route = useRoute();
const router = useRouter();
const productStore = useProductStore();
const orderStore = useOrderStore();

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

const showConfirmation = ref(false);
const confirmationTitle = ref('');
const confirmationMessage = ref('');
const confirmationAction = ref(null);
const confirmationType = ref('');

// Computed
const totalOrderPrice = computed(() => {
    return orderData.value.items.reduce((total, item) => total + item.totalPrice, 0);
});

const totalItems = computed(() => {
    return orderData.value.items.reduce((total, item) => total + item.quantity, 0);
});

// Check if any items have stock issues
const hasStockIssues = computed(() => {
    return orderData.value.items.some(item => {
        // Find the product
        const product = productStore.products.find(p => p.id === item.productId);
        if (!product) return true; // Product not found is a stock issue

        // Find the variety
        const variety = product.varieties.find(v => v.id === item.varietyId);
        if (!variety) return true; // Variety not found is a stock issue

        // Check if current quantity exceeds available stock
        return item.quantity > variety.stockQuantity;
    });
});

// Methods
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
                    const variety = product.varieties.find(v => v.id === item.varietyId);
                    if (variety) {
                        maxQuantity = variety.stockQuantity;
                    }
                }

                // Extract sale info
                const saleInfo = item.onSale ? {
                    originalPrice: item.unitPrice,
                    salePrice: item.sale?.salePrice,
                    onSale: true,
                    saleEndTime: item.sale?.endDate
                } : null;

                return {
                    productId: item.productId,
                    productName: item.product,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                    totalPrice: item.totalPrice,
                    maxQuantity: maxQuantity,
                    saleInfo: saleInfo,
                    variety: {
                        varietyName: item.varietyName || 'Default',
                        varietyUnit: item.unit || 'unit',
                        varietyQuantity: 1
                    }
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

const formatDate = (timestamp) => {
    if (!timestamp) return '';

    const date = timestamp.seconds ?
        new Date(timestamp.seconds * 1000) :
        new Date(timestamp);

    return date.toLocaleString();
};

const formatPrice = (price) => {
    return `₱${Number(price).toFixed(2)}`;
};

const confirmApproveOrder = () => {
    confirmationTitle.value = 'Approve Order';
    confirmationMessage.value = 'Are you sure you want to approve this order? This will update inventory levels.';
    confirmationAction.value = approveOrder;
    confirmationType.value = 'approve';
    showConfirmation.value = true;
};

const approveOrder = async () => {
    try {
        await orderStore.approveOrder(orderData.value.id);
        orderData.value.status = 'Completed';
        alert('Order approved successfully');
        showConfirmation.value = false;

        // Refresh product data to get updated stock levels
        await productStore.fetchProducts(true);

        // Reload order to get updated data
        await loadOrder();
    } catch (error) {
        console.error('Error approving order:', error);
        alert('Failed to approve order: ' + error.message);
    }
};

const confirmVoidOrder = () => {
    confirmationTitle.value = 'Void Order';
    confirmationMessage.value = 'Are you sure you want to void this order? This action cannot be undone.';
    confirmationAction.value = voidOrder;
    confirmationType.value = 'void';
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

onMounted(async () => {
    await Promise.all([
        productStore.fetchProducts(true),
        loadOrder()
    ]);
});
</script>
