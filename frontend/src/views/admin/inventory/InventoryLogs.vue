<!-- frontend\src\views\admin\inventory\InventoryLogs.vue -->
<template>
    <div class="inventory-logs">
      <h2 class="text-xl font-semibold text-tBase-100 mb-6">Inventory Logs</h2>
      
      <!-- Filters -->
      <div class="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label for="log-type" class="block text-sm font-medium text-tBase-100 mb-2">Log Type</label>
          <select
            id="log-type"
            v-model="filters.type"
            class="bg-bgPrimary-0 border border-bgPrimary-200 text-tBase-100 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5"
          >
            <option value="">All Types</option>
            <option value="add_stock">Add Stock</option>
            <option value="deduct_stock">Deduct Stock</option>
            <option value="reject">Reject Stock</option>
            <option value="transfer">Transfer Stock</option>
            <option value="adjust_stock">Adjust Stock</option>
          </select>
        </div>
        
        <div>
          <label for="start-date" class="block text-sm font-medium text-tBase-100 mb-2">Start Date</label>
          <input
            id="start-date"
            v-model="filters.startDate"
            type="date"
            class="bg-bgPrimary-0 border border-bgPrimary-200 text-tBase-100 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5"
          />
        </div>
        
        <div>
          <label for="end-date" class="block text-sm font-medium text-tBase-100 mb-2">End Date</label>
          <input
            id="end-date"
            v-model="filters.endDate"
            type="date"
            class="bg-bgPrimary-0 border border-bgPrimary-200 text-tBase-100 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5"
          />
        </div>
      </div>
      
      <div class="mb-6 flex justify-end">
        <button
          @click="fetchLogs"
          class="text-white bg-primary-500 hover:bg-primary-600 focus:ring-4 focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 focus:outline-none"
          :disabled="loading"
        >
          <Loader2 v-if="loading" class="w-4 h-4 mr-2 inline animate-spin" />
          Apply Filters
        </button>
      </div>
      
      <!-- Logs table -->
      <div class="overflow-x-auto relative">
        <table class="w-full text-sm text-left text-tBase-100">
          <thead class="text-xs text-tBase-400 uppercase bg-bgPrimary-100">
            <tr>
              <th scope="col" class="py-3 px-4">Date & Time</th>
              <th scope="col" class="py-3 px-4">Type</th>
              <th scope="col" class="py-3 px-4">Product</th>
              <th scope="col" class="py-3 px-4">Quantity</th>
              <th scope="col" class="py-3 px-4">Old Qty</th>
              <th scope="col" class="py-3 px-4">New Qty</th>
              <th scope="col" class="py-3 px-4">Performed By</th>
              <th scope="col" class="py-3 px-4">Reason</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="inventoryLogs.length === 0" class="bg-bgPrimary-0 border-b">
              <td colspan="8" class="py-4 px-4 text-center text-tBase-400">
                No logs found. Try adjusting your filters.
              </td>
            </tr>
            <tr 
              v-for="log in inventoryLogs" 
              :key="log.id"
              class="bg-bgPrimary-0 border-b hover:bg-bgPrimary-100"
            >
              <td class="py-4 px-4">{{ formatDateTime(log.timestamp) }}</td>
              <td class="py-4 px-4">
                <span 
                  :class="[
                    'px-2 py-1 text-xs font-medium rounded-full',
                    getLogTypeClass(log.type)
                  ]"
                >
                  {{ formatLogType(log.type) }}
                </span>
              </td>
              <td class="py-4 px-4">{{ getProductInfo(log) }}</td>
              <td class="py-4 px-4 font-medium">{{ log.quantity }}</td>
              <td class="py-4 px-4 text-tBase-400">{{ log.oldQuantity }}</td>
              <td class="py-4 px-4 text-tBase-400">{{ log.newQuantity }}</td>
              <td class="py-4 px-4 text-tBase-400">{{ log.performedByName || log.performedBy }}</td>
              <td class="py-4 px-4 text-tBase-400">
                <span class="truncate block max-w-xs" :title="log.reason">
                  {{ log.reason }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- Pagination -->
      <div class="mt-6 flex justify-between items-center">
        <div class="text-sm text-tBase-400">
          Showing {{ inventoryLogs.length }} logs
        </div>
        <div>
          <button
            @click="loadMore"
            class="text-primary-500 hover:text-primary-600 font-medium text-sm"
            :disabled="loading || !hasMoreLogs"
          >
            <Loader2 v-if="loading" class="w-4 h-4 mr-2 inline animate-spin" />
            {{ hasMoreLogs ? 'Load More' : 'No More Logs' }}
          </button>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
  import { useInventoryStore } from '@/stores/inventoryStore';
  import { Loader2 } from 'lucide-vue-next';
  
  const props = defineProps({
    branchId: {
      type: String,
      required: true
    },
    inventoryLogs: {
      type: Array,
      default: () => []
    }
  });
  
  const emit = defineEmits(['fetch-logs']);
  
  const inventoryStore = useInventoryStore();
  
  // State
  const loading = computed(() => inventoryStore.isLoading);
  const filters = ref({
    type: '',
    startDate: '',
    endDate: '',
    limit: 20,
    startAfter: null
  });
  const hasMoreLogs = ref(true);
  
  // Computed properties
  const products = computed(() => inventoryStore.getProducts);
  
  // Methods
  const formatDateTime = (dateTime) => {
    if (!dateTime) return 'N/A';
    
    const date = new Date(dateTime);
    return date.toLocaleString();
  };
  
  const formatLogType = (type) => {
    switch (type) {
      case 'add_stock': return 'Add Stock';
      case 'deduct_stock': return 'Deduct Stock';
      case 'add_stock': return 'Add Stock';
      case 'deduct_stock': return 'Deduct Stock';
      case 'reject': return 'Reject Stock';
      case 'transfer': return 'Transfer Stock';
      case 'transfer_in': return 'Transfer In';
      case 'adjust_stock': return 'Adjust Stock';
      default: return type;
    }
  };
  
  const getLogTypeClass = (type) => {
    switch (type) {
      case 'add_stock': return 'bg-green-100 text-green-800';
      case 'deduct_stock': return 'bg-blue-100 text-blue-800';
      case 'reject': return 'bg-red-100 text-red-800';
      case 'transfer': return 'bg-purple-100 text-purple-800';
      case 'transfer_in': return 'bg-indigo-100 text-indigo-800';
      case 'adjust_stock': return 'bg-amber-100 text-amber-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getProductInfo = (log) => {
    // Try to find product in store
    const product = products.value.find(p => p.id === log.productId);
    
    if (product) {
      const variety = product.varieties?.find(v => v.id === log.varietyId);
      return `${product.name} - ${variety?.name || 'Default'}`;
    }
    
    // Fallback to IDs
    return `Product: ${log.productId?.substring(0, 8) || 'Unknown'}...`;
  };
  
  const fetchLogs = async () => {
    try {
      loading.value = true;
      
      // Reset pagination
      filters.value.startAfter = null;
      hasMoreLogs.value = true;
      
      await emit('fetch-logs', { ...filters.value });
      
      // Check if we have more logs
      if (props.inventoryLogs.length < filters.value.limit) {
        hasMoreLogs.value = false;
      } else {
        // Set startAfter to last log ID
        filters.value.startAfter = props.inventoryLogs[props.inventoryLogs.length - 1].id;
      }
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      loading.value = false;
    }
  };
  
  const loadMore = async () => {
    if (!hasMoreLogs.value || loading.value) return;
    
    try {
      loading.value = true;
      
      const currentLogsCount = props.inventoryLogs.length;
      
      await emit('fetch-logs', { ...filters.value });
      
      // Check if we got new logs
      if (props.inventoryLogs.length <= currentLogsCount) {
        hasMoreLogs.value = false;
      } else {
        // Set startAfter to last log ID
        filters.value.startAfter = props.inventoryLogs[props.inventoryLogs.length - 1].id;
      }
    } catch (error) {
      console.error('Error loading more logs:', error);
    } finally {
      loading.value = false;
    }
  };
  
  // Watch for branch ID changes
  watch(() => props.branchId, (newBranchId) => {
    if (newBranchId) {
      fetchLogs();
    }
  });
  
  // Lifecycle hooks
  onMounted(() => {
    if (props.branchId) {
      fetchLogs();
      
      // Set up real-time listener for logs
      inventoryStore.setupInventoryLogsListener({
        branchId: props.branchId,
        limit: filters.value.limit
      });
    }
  });
  
  // Clean up when component is unmounted
  onUnmounted(() => {
    if (inventoryStore.unsubscribeLogs) {
      inventoryStore.unsubscribeLogs();
    }
  });
  </script>