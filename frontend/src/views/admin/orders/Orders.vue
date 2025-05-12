<template>
    <div class="container mx-auto p-4">
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-2xl font-bold">Orders</h1>
            <router-link to="/administrator/orders/create"
                class="bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-dark">
                <PlusCircle class="w-5 h-5 inline-block mr-1" />
                New Order
            </router-link>
        </div>

        <!-- Filters -->
        <div class="mb-6 bg-white p-4 rounded-lg shadow">
            <div class="flex flex-wrap gap-4">
                <div class="w-full md:w-auto">
                    <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select v-model="filters.status" @change="loadOrders"
                        class="rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary">
                        <option value="all">All</option>
                        <option value="Pending">Pending</option>
                        <option value="Completed">Completed</option>
                        <option value="Voided">Voided</option>
                    </select>
                </div>
                <div class="w-full md:w-auto">
                    <label class="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
                    <div class="flex space-x-2">
                        <input type="date" v-model="filters.startDate" @change="loadOrders"
                            class="rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary" />
                        <span class="self-center">to</span>
                        <input type="date" v-model="filters.endDate" @change="loadOrders"
                            class="rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary" />
                    </div>
                </div>
                <div class="w-full md:w-auto">
                    <label class="block text-sm font-medium text-gray-700 mb-1">Search</label>
                    <div class="relative">
                        <input type="text" v-model="filters.search" @input="debounceSearch"
                            placeholder="Search by customer or order #"
                            class="pl-10 rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary w-full" />
                        <Search class="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                    </div>
                </div>
            </div>
        </div>

        <!-- Orders List -->
        <div class="bg-white rounded-lg shadow overflow-hidden">
            <div v-if="orderStore.loading" class="p-8 text-center">
                <div
                    class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent">
                </div>
                <p class="mt-2 text-gray-600">Loading orders...</p>
            </div>

            <div v-else-if="orders.length === 0" class="p-8 text-center">
                <ShoppingBag class="mx-auto h-12 w-12 text-gray-400" />
                <p class="mt-2 text-gray-600">No orders found</p>
                <router-link to="/administrator/orders/create" class="mt-4 inline-block text-primary hover:underline">
                    Create your first order
                </router-link>
            </div>

            <div v-else>
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
                                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Total
                            </th>
                            <th scope="col"
                                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                            <th scope="col"
                                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                        <tr v-for="order in orders" :key="order.id" class="hover:bg-gray-50">
                            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {{ order.orderNumber || 'N/A' }}
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {{ order.client }}
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {{ formatDate(order.createdAt) }}
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {{ order.items.length }}
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                ₱{{ order.totalPrice.toFixed(2) }}
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <span :class="{
                                    'px-2 py-1 text-xs font-semibold rounded-full': true,
                                    'bg-yellow-100 text-yellow-800': order.status === 'Pending',
                                    'bg-green-100 text-green-800': order.status === 'Completed',
                                    'bg-red-100 text-red-800': order.status === 'Voided'
                                }">
                                    {{ order.status }}
                                </span>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <div class="flex space-x-2">
                                    <router-link :to="`/administrator/orders/edit/${order.id}`"
                                        class="text-primary hover:text-primary-dark">
                                        <Edit class="w-5 h-5" />
                                    </router-link>
                                    <button @click="viewOrderDetails(order)" class="text-blue-500 hover:text-blue-700">
                                        <Eye class="w-5 h-5" />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>

                <!-- Pagination -->
                <div class="px-6 py-3 flex items-center justify-between border-t border-gray-200">
                    <div class="flex-1 flex justify-between sm:hidden">
                        <button @click="prevPage" :disabled="currentPage === 1"
                            class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                            Previous
                        </button>
                        <button @click="nextPage" :disabled="!hasMorePages"
                            class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                            Next
                        </button>
                    </div>
                    <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                        <div>
                            <p class="text-sm text-gray-700">
                                Showing <span class="font-medium">{{ (currentPage - 1) * pageSize + 1 }}</span> to <span
                                    class="font-medium">{{ Math.min(currentPage * pageSize, totalOrders) }}</span> of
                                <span class="font-medium">{{ totalOrders }}</span> results
                            </p>
                        </div>
                        <div>
                            <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                                aria-label="Pagination">
                                <button @click="prevPage" :disabled="currentPage === 1"
                                    class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                                    <span class="sr-only">Previous</span>
                                    <ChevronLeft class="h-5 w-5" />
                                </button>
                                <button @click="nextPage" :disabled="!hasMorePages"
                                    class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                                    <span class="sr-only">Next</span>
                                    <ChevronRight class="h-5 w-5" />
                                </button>
                            </nav>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Order Details Modal -->
        <div v-if="selectedOrder" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div class="p-6">
                    <div class="flex justify-between items-center mb-4">
                        <h2 class="text-xl font-bold">Order Details</h2>
                        <button @click="selectedOrder = null" class="text-gray-500 hover:text-gray-700">
                            <X class="w-6 h-6" />
                        </button>
                    </div>

                    <div class="mb-4">
                        <p class="text-sm text-gray-500">Order #: {{ selectedOrder.orderNumber || 'N/A' }}</p>
                        <p class="text-sm text-gray-500">Date: {{ formatDate(selectedOrder.createdAt) }}</p>
                        <p class="font-medium">Customer: {{ selectedOrder.client }}</p>
                        <p class="font-medium">Status: {{ selectedOrder.status }}</p>
                    </div>

                    <div class="border-t border-b py-4 my-4">
                        <h3 class="font-semibold mb-2">Items</h3>
                        <div class="space-y-3">
                            <div v-for="(item, index) in selectedOrder.items" :key="index" class="flex justify-between">
                                <div>
                                    <p class="font-medium">{{ item.product }}</p>
                                    <p v-if="item.variety" class="text-sm text-gray-600">
                                        {{ item.variety.varietyName }} ({{ item.variety.varietyQuantity }})
                                    </p>
                                    <p class="text-sm text-gray-600">Qty: {{ item.quantity }}</p>
                                </div>
                                <p class="font-medium">₱{{ item.totalPrice.toFixed(2) }}</p>
                            </div>
                        </div>
                    </div>

                    <div class="flex justify-between items-center font-bold text-lg">
                        <span>Total:</span>
                        <span>₱{{ selectedOrder.totalPrice.toFixed(2) }}</span>
                    </div>

                    <div class="mt-6 flex justify-end space-x-3">
                        <button @click="selectedOrder = null" class="px-4 py-2 border border-gray-300 rounded-md">
                            Close
                        </button>
                        <router-link :to="`/administrator/orders/edit/${selectedOrder.id}`"
                            class="bg-primary text-white px-4 py-2 rounded-md">
                            Edit Order
                        </router-link>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useOrderStore } from '@/stores/orderStore';
import { PlusCircle, Search, Edit, Eye, ChevronLeft, ChevronRight, ShoppingBag, X } from 'lucide-vue-next';

const orderStore = useOrderStore();
const orders = computed(() => orderStore.orders);
const totalOrders = computed(() => orderStore.totalOrders);
const hasMorePages = computed(() => orderStore.hasMore);

const selectedOrder = ref(null);
const currentPage = ref(1);
const pageSize = 10;

const filters = ref({
    status: 'all',
    startDate: '',
    endDate: '',
    search: '',
});

// Debounce search
let searchTimeout = null;
const debounceSearch = () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        loadOrders();
    }, 500);
};

const loadOrders = async () => {
    currentPage.value = 1;
    await orderStore.fetchOrders({
        page: currentPage.value,
        limit: pageSize,
        status: filters.value.status,
        startDate: filters.value.startDate,
        endDate: filters.value.endDate,
        search: filters.value.search,
    });
};

const nextPage = async () => {
    if (hasMorePages.value) {
        currentPage.value++;
        await orderStore.fetchOrders({
            page: currentPage.value,
            limit: pageSize,
            status: filters.value.status,
            startDate: filters.value.startDate,
            endDate: filters.value.endDate,
            search: filters.value.search,
        });
    }
};

const prevPage = async () => {
    if (currentPage.value > 1) {
        currentPage.value--;
        await orderStore.fetchOrders({
            page: currentPage.value,
            limit: pageSize,
            status: filters.value.status,
            startDate: filters.value.startDate,
            endDate: filters.value.endDate,
            search: filters.value.search,
        });
    }
};

const viewOrderDetails = (order) => {
    selectedOrder.value = order;
};

const formatDate = (timestamp) => {
    if (!timestamp) return '';

    const date = timestamp.seconds
        ? new Date(timestamp.seconds * 1000)
        : new Date(timestamp);

    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

onMounted(async () => {
    await loadOrders();
});
</script>