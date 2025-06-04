<!-- frontend\src\views\admin\inventory\StockOverview.vue -->
<template>
    <div class="stock-overview">
        <h2 class="text-xl font-semibold text-tBase-100 mb-6">Stock Overview</h2>

        <!-- Search and filter -->
        <div class="mb-6 flex flex-col md:flex-row gap-4">
            <div class="flex-1">
                <label for="search" class="block text-sm font-medium text-tBase-100 mb-2">Search Products</label>
                <div class="relative">
                    <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <Search class="w-4 h-4 text-tBase-400" />
                    </div>
                    <input id="search" v-model="searchQuery" type="text"
                        class="bg-bgPrimary-0 border border-bgPrimary-200 text-tBase-100 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 p-2.5"
                        placeholder="Search by product name..." />
                </div>
            </div>

            <div>
                <label for="category-filter" class="block text-sm font-medium text-tBase-100 mb-2">Category</label>
                <select id="category-filter" v-model="categoryFilter"
                    class="bg-bgPrimary-0 border border-bgPrimary-200 text-tBase-100 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5">
                    <option value="">All Categories</option>
                    <option v-for="category in categories" :key="category" :value="category">
                        {{ category }}
                    </option>
                </select>
            </div>

            <div>
                <label for="stock-filter" class="block text-sm font-medium text-tBase-100 mb-2">Stock Level</label>
                <select id="stock-filter" v-model="stockFilter"
                    class="bg-bgPrimary-0 border border-bgPrimary-200 text-tBase-100 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5">
                    <option value="all">All Stock</option>
                    <option value="low">Low Stock</option>
                    <option value="out">Out of Stock</option>
                </select>
            </div>
        </div>

        <!-- Loading state -->
        <div v-if="loading" class="flex justify-center items-center py-8">
            <Loader2 class="w-8 h-8 animate-spin text-primary-500" />
            <span class="ml-2 text-tBase-100">Loading stock data...</span>
        </div>

        <!-- Stock table -->
        <div v-else-if="branchId && filteredStockItems.length > 0" class="overflow-x-auto relative">
            <table class="w-full text-sm text-left text-tBase-100">
                <thead class="text-xs text-tBase-400 uppercase bg-bgPrimary-100">
                    <tr>
                        <th scope="col" class="py-3 px-4">Product</th>
                        <th scope="col" class="py-3 px-4">Category</th>
                        <th scope="col" class="py-3 px-4">Variety</th>
                        <th scope="col" class="py-3 px-4">Quantity</th>
                        <th scope="col" class="py-3 px-4">Status</th>
                        <th scope="col" class="py-3 px-4">Last Updated</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="item in filteredStockItems" :key="`${item.productId}-${item.varietyId}`"
                        class="bg-bgPrimary-0 border-b hover:bg-bgPrimary-100">
                        <td class="py-4 px-4 font-medium">
                            {{ item.product?.name || 'Unknown Product' }}
                        </td>
                        <td class="py-4 px-4">
                            {{ (item.product?.category || []).join(', ') || 'N/A' }}
                        </td>
                        <td class="py-4 px-4">
                            {{ item.variety?.name || 'Default' }}
                        </td>
                        <td class="py-4 px-4 font-medium">
                            {{ item.quantity }}
                        </td>
                        <td class="py-4 px-4">
                            <span :class="[
                                'px-2 py-1 text-xs font-medium rounded-full',
                                getStockStatusClass(item)
                            ]">
                                {{ getStockStatusText(item) }}
                            </span>
                        </td>
                        <td class="py-4 px-4 text-tBase-400">
                            {{ formatDate(item.updatedAt) }}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Empty state -->
        <div v-else-if="branchId" class="text-center py-8">
            <PackageOpen class="w-16 h-16 mx-auto text-tBase-400" />
            <h3 class="mt-4 text-lg font-medium text-tBase-100">No stock items found</h3>
            <p class="mt-2 text-tBase-400">
                {{ searchQuery || categoryFilter ? 'Try adjusting your filters' : 'This branch has no stock items yet'
                }}
            </p>
        </div>

        <!-- Select branch prompt -->
        <div v-else class="text-center py-8 bg-bgPrimary-100 rounded-lg">
            <Store class="w-16 h-16 mx-auto text-tBase-400" />
            <h3 class="mt-4 text-lg font-medium text-tBase-100">Select a Branch</h3>
            <p class="mt-2 text-tBase-400">
                Please select a branch to view its inventory
            </p>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { Search, Loader2, PackageOpen, Store } from 'lucide-vue-next';
import { useInventoryStore } from '@/stores/inventoryStore';

const props = defineProps({
    branchId: {
        type: String,
        default: ''
    },
    branchStock: {
        type: Array,
        default: () => []
    }
});

const inventoryStore = useInventoryStore();

// State
const loading = computed(() => inventoryStore.isLoading);
const searchQuery = ref('');
const categoryFilter = ref('');
const stockFilter = ref('all');

// Computed properties
const categories = computed(() => {
    const uniqueCategories = new Set();
    props.branchStock.forEach(item => {
        if (item.product?.category) {
            // Handle both string and array categories
            if (Array.isArray(item.product.category)) {
                item.product.category.forEach(cat => uniqueCategories.add(cat));
            } else {
                uniqueCategories.add(item.product.category);
            }
        }
    });
    return Array.from(uniqueCategories).sort();
});

const filteredStockItems = computed(() => {
    let filtered = [...props.branchStock];

    // Apply search filter
    if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
        filtered = filtered.filter(item =>
            item.product?.name?.toLowerCase().includes(query)
        );
    }

    // Apply category filter
    if (categoryFilter.value) {
        filtered = filtered.filter(item => {
            if (!item.product?.category) return false;

            // Handle both string and array categories
            if (Array.isArray(item.product.category)) {
                return item.product.category.includes(categoryFilter.value);
            } else {
                return item.product.category === categoryFilter.value;
            }
        });
    }

    // Apply stock level filter
    if (stockFilter.value === 'low') {
        filtered = filtered.filter(item =>
            item.quantity > 0 && item.quantity <= (item.product?.lowStockThreshold || 10)
        );
    } else if (stockFilter.value === 'out') {
        filtered = filtered.filter(item => item.quantity === 0);
    }

    return filtered;
});

// Methods
const getStockStatusClass = (item) => {
    const quantity = item.quantity;
    const threshold = item.product?.lowStockThreshold || 10;

    if (quantity === 0) {
        return 'bg-red-100 text-red-800';
    } else if (quantity <= threshold) {
        return 'bg-amber-100 text-amber-800';
    } else {
        return 'bg-green-100 text-green-800';
    }
};

const getStockStatusText = (item) => {
    const quantity = item.quantity;
    const threshold = item.product?.lowStockThreshold || 10;

    if (quantity === 0) {
        return 'Out of Stock';
    } else if (quantity <= threshold) {
        return 'Low Stock';
    } else {
        return 'In Stock';
    }
};

// const formatDate = (timestamp) => {
//     if (!timestamp) return 'N/A';

//     // Convert Firebase timestamp to Date
//     const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);

//     return new Intl.DateTimeFormat('en-US', {
//         year: 'numeric',
//         month: 'short',
//         day: 'numeric',
//         hour: '2-digit',
//         minute: '2-digit'
//     }).format(date);
// };

const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';

    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp.seconds * 1000);

    return date.toLocaleString('en-PH', {
        timeZone: 'Asia/Manila',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
};

// Watch for branch selection changes
watch(() => props.branchId, (newBranchId) => {
    if (newBranchId) {
        inventoryStore.setSelectedBranch(newBranchId);
    }
});

// Lifecycle hooks
onMounted(() => {
    if (props.branchId) {
        inventoryStore.setSelectedBranch(props.branchId);
    }
});
</script>