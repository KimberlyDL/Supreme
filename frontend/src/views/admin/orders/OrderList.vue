<template>
    <div class="container mx-auto p-4">
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <h1 class="text-2xl font-bold text-primary-700">Orders</h1>
            <router-link 
                to="/administrator/orders/create"
                class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center"
            >
                <PlusCircle class="w-5 h-5 mr-2" />
                New Order
            </router-link>
        </div>

        <!-- Filters -->
        <div class="bg-white p-4 rounded-lg shadow-md mb-6">
            <div class="flex flex-wrap gap-4">
                <div class="w-full sm:w-auto">
                    <label class="block text-sm font-medium text-tBase-100 mb-2">Status</label>
                    <select 
                        v-model="statusFilter"
                        class="w-full sm:w-48 px-4 py-2 border border-bgPrimary-200 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                    >
                        <option value="all">All Statuses</option>
                        <option value="Pending">Pending</option>
                        <option value="Completed">Completed</option>
                        <option value="Voided">Voided</option>
                    </select>
                </div>
                <div class="w-full sm:w-auto">
                    <label class="block text-sm font-medium text-tBase-100 mb-2">Search</label>
                    <div class="relative">
                        <input 
                            v-model="searchQuery" 
                            type="text" 
                            placeholder="Search orders..."
                            class="w-full sm:w-64 pl-10 pr-4 py-2 border border-bgPrimary-200 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                        />
                        <Search class="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                    </div>
                </div>
                <div class="w-full sm:w-auto flex items-end">
                    <button 
                        @click="fetchOrders" 
                        class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center"
                    >
                        <RefreshCw class="w-4 h-4 mr-2" :class="{ 'animate-spin': loading }" />
                        Refresh
                    </button>
                </div>
            </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="flex justify-center items-center h-64">
            <div class="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent"></div>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
            <p>{{ error }}</p>
            <button @click="fetchOrders" class="text-red-700 underline mt-2">Try Again</button>
        </div>

        <!-- Empty State -->
        <div v-else-if="filteredOrders.length === 0" class="bg-white rounded-lg shadow-md p-8 text-center">
            <ShoppingBag class="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 class="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
            <p class="text-gray-500 mb-6">
                {{ statusFilter !== 'all' ? `No ${statusFilter.toLowerCase()} orders found.` : 'Start by creating your first order.' }}
            </p>
            <router-link 
                to="/administrator/orders/create" 
                class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 inline-flex items-center"
            >
                <PlusCircle class="w-5 h-5 mr-2" />
                Create Order
            </router-link>
        </div>

        <!-- Orders Table -->
        <div v-else class="bg-white rounded-lg shadow-md overflow-hidden">
            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                        <tr>
                            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Order #
                            </th>
                            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Customer
                            </th>
                            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                                Date
                            </th>
                            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                                Items
                            </th>
                            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                                Quantity
                            </th>
                            <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Total
                            </th>
                            <th scope="col" class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                            <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                        <tr v-for="order in filteredOrders" :key="order.id" class="hover:bg-gray-50">
                            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {{ order.orderNumber }}
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {{ order.client }}
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">
                                {{ formatDate(order.createdAt) }}
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">
                                {{ getTotalItems(order) }} item/s
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">
                                {{ getTotalQuantity(order) }} unit/s
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                                {{ formatPrice(order.totalPrice) }}
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-center">
                                <span :class="{
                                    'px-2 py-1 text-xs font-medium rounded-full': true,
                                    'bg-yellow-100 text-yellow-800': order.status === 'Pending',
                                    'bg-green-100 text-green-800': order.status === 'Completed',
                                    'bg-red-100 text-red-800': order.status === 'Voided'
                                }">
                                    {{ order.status }}
                                </span>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <div class="flex justify-end space-x-2">
                                    <router-link 
                                        :to="getApproveLink(order)"
                                        class="text-green-600 hover:text-green-900" 
                                        title="Approve"
                                        :aria-disabled="order.status !== 'Pending'"
                                        :class="{ 'opacity-50 cursor-not-allowed': order.status !== 'Pending' }"
                                    >
                                        <CheckCircle class="w-5 h-5" />
                                    </router-link>
                                    <router-link 
                                        :to="getEditLink(order)"
                                        class="text-blue-600 hover:text-blue-900"
                                        title="Edit"
                                        :aria-disabled="order.status !== 'Pending'"
                                        :class="{ 'opacity-50 cursor-not-allowed': order.status !== 'Pending' }"
                                    >
                                        <Edit class="w-5 h-5" />
                                    </router-link>
                                    <router-link 
                                        :to="`/administrator/orders/${order.id}`"
                                        class="text-gray-600 hover:text-gray-900" 
                                        title="View"
                                    >
                                        <Eye class="w-5 h-5" />
                                    </router-link>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useOrderStore } from '@/stores/orderStore';
import { formatOrderDate } from '@/utils/productUtils';
import { 
    PlusCircle, 
    Search, 
    Edit, 
    Eye, 
    CheckCircle, 
    ShoppingBag, 
    RefreshCw 
} from 'lucide-vue-next';

const orderStore = useOrderStore();

// State
const loading = ref(false);
const error = ref(null);
const statusFilter = ref('all');
const searchQuery = ref('');

// Computed
const filteredOrders = computed(() => {
    let result = orderStore.orders;

    // Filter by status
    if (statusFilter.value !== 'all') {
        result = result.filter(order => order.status === statusFilter.value);
    }

    // Filter by search query
    if (searchQuery.value.trim()) {
        const query = searchQuery.value.toLowerCase();
        result = result.filter(order =>
            order.orderNumber?.toLowerCase().includes(query) ||
            order.client?.toLowerCase().includes(query)
        );
    }

    return result;
});

// Methods
const fetchOrders = async () => {
    loading.value = true;
    error.value = null;
    try {
        await orderStore.fetchOrders();
    } catch (err) {
        error.value = 'Failed to load orders. Please try again.';
    } finally {
        loading.value = false;
    }
};

const formatDate = (timestamp) => {
    // if (!timestamp) return '';

    // const date = timestamp.seconds ?
    //     new Date(timestamp.seconds * 1000) :
    //     new Date(timestamp);

    // return date.toLocaleString();

    return formatOrderDate(timestamp);
};

const formatPrice = (price) => {
    return `₱${Number(price).toFixed(2)}`;
};

const getTotalItems = (order) => {
    return order.items.length || 0;
};

function getTotalQuantity(order) {
  return order.items.reduce((total, item) => total + item.quantity, 0);
}

const getApproveLink = (order) => {
    return order.status === 'Pending' ? `/administrator/orders/${order.id}/approve` : undefined;
};

const getEditLink = (order) => {
    return order.status === 'Pending' ? `/administrator/orders/${order.id}/edit` : undefined;
};

onMounted(() => {
    fetchOrders();
});
</script>
