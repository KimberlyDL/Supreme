<!-- frontend\src\views\admin\inventory\InventoryManagement.vue -->
<template>
    <div class="inventory-management">
        <div class="mb-6">
            <h1 class="text-2xl font-bold text-tBase-100">Inventory Management</h1>
            <p class="text-tBase-400">Manage stock across all branches</p>
        </div>

        <!-- Tabs -->
        <div class="mb-6 border-b border-bgPrimary-200">
            <ul class="flex flex-wrap -mb-px">
                <li class="mr-2" v-for="tab in tabs" :key="tab.id">
                    <button @click="handleTabClick(tab.id)" :class="[
                        'inline-block py-4 px-4 text-sm font-medium text-center border-b-2',
                        activeTab === tab.id
                            ? 'text-primary-500 border-primary-500'
                            : 'text-tBase-400 border-transparent hover:text-tBase-100 hover:border-tBase-300'
                    ]">
                        <component :is="tab.icon" class="w-5 h-5 inline-block mr-2" />
                        {{ tab.name }}
                    </button>
                </li>
            </ul>
        </div>

        <!-- Branch selector -->
        <div class="mb-6">
            <label for="branch-select" class="block text-sm font-medium text-tBase-100 mb-2">Select Branch</label>
            <select id="branch-select" v-model="selectedBranchId" @change="handleBranchChange"
                class="bg-bgPrimary-50 border border-bgPrimary-200 text-tBase-100 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5">
                <option v-if="!branches.length" value="">Loading branches...</option>
                <option v-else value="">Select a branch</option>
                <option v-if="branches" v-for="branch in branches" :key="branch.id" :value="branch.id">
                    {{ branch.name }}
                </option>
            </select>
        </div>

        <!-- Alert messages -->
        <div v-if="error" class="mb-6 p-4 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">
            <span class="font-medium">Error!</span> {{ error }}
            <button @click="clearMessages" class="float-right">
                <XCircle class="w-5 h-5" />
            </button>
        </div>

        <div v-if="success" class="mb-6 p-4 text-sm text-green-700 bg-green-100 rounded-lg" role="alert">
            <span class="font-medium">Success!</span> {{ success }}
            <button @click="clearMessages" class="float-right">
                <XCircle class="w-5 h-5" />
            </button>
        </div>

        <!-- FIXED: Remove the v-if/v-else structure that was causing the infinite loop -->
        <!-- Show loading indicator only for initial page load, not for individual component operations -->
        <div v-if="isInitialLoading" class="flex justify-center items-center py-10">
            <Loader2 class="w-8 h-8 animate-spin text-primary-500" />
            <span class="ml-2 text-tBase-100">Loading...</span>
        </div>

        <!-- Tab content - FIXED: Always render, don't depend on loading state -->
        <div v-else>
            <!-- Stock Overview Tab -->
            <div v-if="activeTab === 'overview'" class="bg-bgPrimary-50 p-6 rounded-lg">
                <StockOverview :branch-id="selectedBranchId" :branch-stock="branchStock" />
            </div>

            <!-- Add Stock Tab -->
            <div v-if="activeTab === 'add'" class="bg-bgPrimary-50 p-6 rounded-lg">
                <AddStock :branch-id="selectedBranchId" :branches="branches" @add-stock="handleAddStock" />
            </div>

            <!-- Reject Stock Tab -->
            <div v-if="activeTab === 'reject'" class="bg-bgPrimary-50 p-6 rounded-lg">
                <RejectStock :branch-id="selectedBranchId" :branch-stock="branchStock"
                    @reject-stock="handleRejectStock" />
            </div>

            <!-- Transfer Stock Tab -->
            <div v-if="activeTab === 'transfer'" class="bg-bgPrimary-50 p-6 rounded-lg">
                <TransferStock :branch-id="selectedBranchId" :branches="branches" :branch-stock="branchStock"
                    @transfer-stock="handleTransferStock" />
            </div>

            <!-- Adjust Stock Tab -->
            <div v-if="activeTab === 'adjust'" class="bg-bgPrimary-50 p-6 rounded-lg">
                <AdjustStock :branch-id="selectedBranchId" :branch-stock="branchStock"
                    @adjust-stock="handleAdjustStock" />
            </div>

            <!-- Inventory Logs Tab - FIXED: Always render when tab is active -->
            <div v-if="activeTab === 'logs'" class="bg-bgPrimary-50 p-6 rounded-lg">
                <div v-if="!selectedBranchId" class="text-center py-8 text-tBase-400">
                    <p>Please select a branch to view inventory logs</p>
                </div>
                <InventoryLogs v-else :key="`logs-${selectedBranchId}`" :branch-id="selectedBranchId" />
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed, watch, onUnmounted } from 'vue';
import { useInventoryStore } from '@/stores/inventoryStore';
import { useAuthStore } from '@/stores/authStore';
import {
    Boxes,
    PlusCircle,
    MinusCircle,
    ArrowLeftRight,
    ClipboardEdit,
    ClipboardList,
    Loader2,
    XCircle
} from 'lucide-vue-next';

// Import components
import StockOverview from './StockOverview.vue';
import AddStock from './AddStock.vue';
import RejectStock from './RejectStock.vue';
import TransferStock from './TransferStock.vue';
import AdjustStock from './AdjustStock.vue';
import InventoryLogs from './InventoryLogs.vue';

const inventoryStore = useInventoryStore();
const authStore = useAuthStore();

// Tabs configuration
const tabs = ref([
    { id: 'overview', name: 'Stock Overview', icon: Boxes },
    { id: 'add', name: 'Add Stock', icon: PlusCircle },
    { id: 'reject', name: 'Reject Stock', icon: MinusCircle },
    { id: 'transfer', name: 'Transfer Stock', icon: ArrowLeftRight },
    { id: 'adjust', name: 'Adjust Stock', icon: ClipboardEdit },
    { id: 'logs', name: 'Inventory Logs', icon: ClipboardList }
]);

// State
const activeTab = ref('overview');
const selectedBranchId = ref('');

// FIXED: Separate initial loading from component-specific loading
const isInitialLoading = ref(true);

// Add debugging for tab changes
const handleTabClick = (tabId) => {
    console.log(`Manual tab click: ${activeTab.value} -> ${tabId}`);
    activeTab.value = tabId;
};

// Computed properties - FIXED: Don't use store loading state for component mounting
const error = computed(() => inventoryStore.getError);
const success = computed(() => inventoryStore.getSuccess);

const branches = computed(() => {
    const activeBranches = inventoryStore.getActiveBranches;
    return activeBranches || [];
});

const branchStock = computed(() => inventoryStore.getProductBranchStock);

// Check user role and adjust tabs
const userRole = computed(() => {
    try {
        return authStore.user?.role;
    } catch (error) {
        console.error("Error accessing authStore.user.role:", error);
        return null;
    }
});

watch(userRole, (newRole) => {
    console.log('User role changed:', newRole);

    // Reset tabs
    tabs.value = [
        { id: 'overview', name: 'Stock Overview', icon: Boxes },
        { id: 'add', name: 'Add Stock', icon: PlusCircle },
        { id: 'reject', name: 'Reject Stock', icon: MinusCircle },
        { id: 'transfer', name: 'Transfer Stock', icon: ArrowLeftRight },
        { id: 'adjust', name: 'Adjust Stock', icon: ClipboardEdit },
        { id: 'logs', name: 'Inventory Logs', icon: ClipboardList }
    ];

    // Remove transfer tab if not owner
    if (newRole !== 'owner') {
        tabs.value = tabs.value.filter(tab => tab.id !== 'transfer');
    }

    // Remove adjust tab if not owner or manager
    if (newRole !== 'owner' && newRole !== 'manager') {
        tabs.value = tabs.value.filter(tab => tab.id !== 'adjust');
    }

    // If current tab is no longer available, switch to overview
    const availableTabIds = tabs.value.map(tab => tab.id);
    if (!availableTabIds.includes(activeTab.value)) {
        console.log(`Current tab ${activeTab.value} not available, switching to overview`);
        activeTab.value = 'overview';
    }
});

// Methods
const handleBranchChange = () => {
    console.log('Branch changed to:', selectedBranchId.value);
    if (selectedBranchId.value) {
        inventoryStore.setSelectedBranch(selectedBranchId.value);
    }
};

const handleAddStock = async (stockData) => {
    try {
        await inventoryStore.addStock(stockData);
    } catch (error) {
        console.error('Error adding stock:', error);
    }
};

const handleRejectStock = async (rejectData) => {
    try {
        await inventoryStore.rejectStock(rejectData);
    } catch (error) {
        console.error('Error rejecting stock:', error);
    }
};

const handleTransferStock = async (transferData) => {
    try {
        await inventoryStore.transferStock(transferData);
    } catch (error) {
        console.error('Error transferring stock:', error);
    }
};

const handleAdjustStock = async (adjustData) => {
    try {
        await inventoryStore.adjustStock(adjustData);
    } catch (error) {
        console.error('Error adjusting stock:', error);
    }
};

const clearMessages = () => {
    inventoryStore.clearMessages();
};

// Lifecycle hooks
onMounted(async () => {
    console.log('InventoryManagement mounted');

    try {
        // Initialize listeners
        await inventoryStore.initializeListeners();

        // Set selected branch from store or use first branch
        if (inventoryStore.selectedBranchId) {
            selectedBranchId.value = inventoryStore.selectedBranchId;
            inventoryStore.setSelectedBranch(selectedBranchId.value);
        } else if (branches.value.length > 0) {
            selectedBranchId.value = branches.value[0].id;
            inventoryStore.setSelectedBranch(selectedBranchId.value);
        }
    } catch (error) {
        console.error('Error during initialization:', error);
    } finally {
        // FIXED: Set initial loading to false after initialization
        isInitialLoading.value = false;
    }
});

// Clean up listeners when component is unmounted
onUnmounted(async () => {
    console.log('InventoryManagement unmounted');
    inventoryStore.cleanup();
    inventoryStore.selectedBranchId = null;
});
</script>
