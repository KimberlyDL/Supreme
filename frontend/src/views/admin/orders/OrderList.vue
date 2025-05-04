<template>
    <div class="container mx-auto p-4">
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-2xl font-bold">Orders</h1>
            <router-link to="/administrator/orders/create"
                class="bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-dark flex items-center">
                <PlusCircle class="w-5 h-5 mr-2" />
                New Order
            </router-link>
        </div>

        <div v-if="loading" class="flex justify-center items-center h-64">
            <div class="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
        </div>

        <div v-else-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p>{{ error }}</p>
            <button @click="fetchOrders" class="text-red-700 underline mt-2">Try Again</button>
        </div>

        <div v-else>
            <!-- Filters -->
            <div class="bg-white p-4 rounded-lg shadow mb-6">
                <div class="flex flex-wrap gap-4">
                    <div class="w-full md:w-auto">
                        <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select v-model="statusFilter"
                            class="w-full md:w-48 rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary">
                            <option value="all">All Statuses</option>
                            <option value="Pending">Pending</option>
                            <option value="Completed">Completed</option>
                            <option value="Voided">Voided</option>
                        </select>
                    </div>
                    <div class="w-full md:w-auto">
                        <label class="block text-sm font-medium text-gray-700 mb-1">Search</label>
                        <div class="relative">
                            <input v-model="searchQuery" type="text" placeholder="Search orders..."
                                class="w-full md:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary" />
                            <Search class="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                        </div>
                    </div>
                </div>
            </div>

            <!-- Orders Table -->
            <div class="bg-white rounded-lg shadow overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-gray-200">
                        <thead class="bg-gray-50">
                            <tr>
                                <th scope="col"
                                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Order #
                                </th>
                                <th scope="col"
                                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Customer
                                </th>
                                <th scope="col"
                                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Date
                                </th>
                                <th scope="col"
                                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Items
                                </th>
                                <th scope="col"
                                    class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Total
                                </th>
                                <th scope="col"
                                    class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th scope="col"
                                    class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
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
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {{ formatDate(order.createdAt) }}
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {{ getTotalItems(order) }} items
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                                    ₱{{ order.totalPrice.toFixed(2) }}
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
                                        <router-link :to="`/administrator/orders/${order.id}/approve`"
                                            v-if="order.status === 'Pending'"
                                            class="text-green-600 hover:text-green-900" title="Approve">
                                            <CheckCircle class="w-5 h-5" />
                                        </router-link>
                                        <router-link :to="`/administrator/orders/${order.id}/edit`"
                                            v-if="order.status === 'Pending'" class="text-blue-600 hover:text-blue-900"
                                            title="Edit">
                                            <Edit class="w-5 h-5" />
                                        </router-link>
                                        <router-link :to="`/administrator/orders/${order.id}`"
                                            class="text-gray-600 hover:text-gray-900" title="View">
                                            <Eye class="w-5 h-5" />
                                        </router-link>
                                    </div>
                                </td>
                            </tr>
                            <tr v-if="filteredOrders.length === 0">
                                <td colspan="7" class="px-6 py-4 text-center text-gray-500">
                                    No orders found
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useOrderStore } from '@/stores/orderStore';
import { PlusCircle, Search, Edit, Eye, CheckCircle } from 'lucide-vue-next';

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
            order.orderNumber.toLowerCase().includes(query) ||
            order.client.toLowerCase().includes(query)
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
    if (!timestamp) return '';

    const date = timestamp.seconds ?
        new Date(timestamp.seconds * 1000) :
        new Date(timestamp);

    return date.toLocaleString();
};

const getTotalItems = (order) => {
    return order.items.reduce((total, item) => total + item.quantity, 0);
};

onMounted(() => {
    fetchOrders();
});
</script>