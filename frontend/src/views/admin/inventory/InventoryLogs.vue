<script setup>
import { ref, onMounted, watch, onUnmounted, nextTick } from 'vue';
import { useInventoryStore } from '@/stores/inventoryStore';
import { useToastStore } from '@/stores/toastStore';

// Define props properly
const props = defineProps({
  branchId: {
    type: String,
    required: true
  }
});

const inventoryStore = useInventoryStore();
const toastStore = useToastStore();

// Local state - completely isolated from store
const logs = ref([]);
const selectedType = ref('');
const startDate = ref('');
const endDate = ref('');
const hasMoreLogs = ref(true);
const limit = 10;
const currentPage = ref(1);
const lastVisible = ref(null);
const isLoading = ref(false);

// Track what we've already loaded to prevent duplicates
const loadedBranchId = ref(null);
const loadedFilters = ref({
  type: '',
  startDate: '',
  endDate: ''
});

// Flag to prevent multiple simultaneous calls
const isLoadingInProgress = ref(false);

// Component mounted flag
const isMounted = ref(false);

const loadLogs = async (reset = true) => {
  // Prevent multiple simultaneous calls
  if (isLoadingInProgress.value) {
    console.log('Load already in progress, skipping');
    return;
  }

  // Check if component is still mounted
  if (!isMounted.value) {
    console.log('Component not mounted, skipping load');
    return;
  }

  // Validate required data
  if (!props.branchId) {
    console.log('No branchId provided, skipping load');
    return;
  }

  // Check if we need to load (avoid unnecessary calls)
  const currentFilters = {
    type: selectedType.value,
    startDate: startDate.value,
    endDate: endDate.value
  };

  if (!reset &&
    loadedBranchId.value === props.branchId &&
    JSON.stringify(loadedFilters.value) === JSON.stringify(currentFilters) &&
    logs.value.length > 0) {
    console.log('Data already loaded for current branch and filters, skipping');
    return;
  }

  isLoadingInProgress.value = true;
  isLoading.value = true;

  console.log(`Loading logs for branch: ${props.branchId}, reset: ${reset}`);

  try {
    if (reset) {
      currentPage.value = 1;
      lastVisible.value = null;
      logs.value = []; // Clear local logs
    }

    // Call the API directly without using store state
    const response = await inventoryStore.fetchInventoryLogsFromAPI({
      branchId: props.branchId,
      type: selectedType.value || null,
      startDate: startDate.value || null,
      endDate: endDate.value || null,
      limit,
      lastVisible: lastVisible.value
    });

    // Check if component is still mounted after async operation
    if (!isMounted.value) {
      console.log('Component unmounted during API call, aborting');
      return;
    }

    if (response.success) {
      const newLogs = response.data.logs || [];

      if (reset) {
        logs.value = newLogs;
      } else {
        // Append new logs, avoiding duplicates
        const existingIds = new Set(logs.value.map(log => log.id));
        const uniqueNewLogs = newLogs.filter(log => !existingIds.has(log.id));
        logs.value = [...logs.value, ...uniqueNewLogs];
      }

      lastVisible.value = response.data.lastVisible;
      hasMoreLogs.value = response.data.hasMore;

      // Update tracking variables
      loadedBranchId.value = props.branchId;
      loadedFilters.value = { ...currentFilters };

      if (reset) {
        toastStore.addToast({
          type: 'success',
          message: 'Logs loaded successfully',
          duration: 2000
        });
      }
    } else {
      toastStore.addToast({
        type: 'error',
        message: response.message || 'Failed to load logs'
      });
    }
  } catch (error) {
    console.error('Error fetching inventory logs:', error);
    if (isMounted.value) {
      toastStore.addToast({
        type: 'error',
        message: 'Error fetching inventory logs'
      });
    }
  } finally {
    if (isMounted.value) {
      isLoading.value = false;
    }
    isLoadingInProgress.value = false;
  }
};

const loadMore = async () => {
  if (!hasMoreLogs.value || isLoadingInProgress.value || !isMounted.value) return;
  currentPage.value++;
  await loadLogs(false);
};

// Reset filters
const resetFilters = () => {
  if (!isMounted.value) return;

  selectedType.value = '';
  startDate.value = '';
  endDate.value = '';
  // Force reload by clearing tracking
  loadedBranchId.value = null;
  loadedFilters.value = { type: '', startDate: '', endDate: '' };
  loadLogs(true);
};

// Manual filter application
const applyFilters = () => {
  if (!isMounted.value) return;

  // Force reload by clearing tracking
  loadedBranchId.value = null;
  loadedFilters.value = { type: '', startDate: '', endDate: '' };
  loadLogs(true);
};

onMounted(async () => {
  console.log('InventoryLogs mounted with branchId:', props.branchId);
  isMounted.value = true;

  // Wait for next tick to ensure parent component is fully initialized
  await nextTick();

  if (props.branchId && isMounted.value) {
    await loadLogs(true);
  }
});

onUnmounted(() => {
  console.log('InventoryLogs unmounted');
  isMounted.value = false;
  // Clear local state
  logs.value = [];
  loadedBranchId.value = null;
  loadedFilters.value = { type: '', startDate: '', endDate: '' };
  isLoadingInProgress.value = false;
});

// Watch for branch changes ONLY - with mounted check
watch(() => props.branchId, async (newBranchId, oldBranchId) => {
  if (!isMounted.value) return;

  console.log(`Branch changed from ${oldBranchId} to ${newBranchId}`);

  if (!newBranchId) {
    // Clear logs if no branch selected
    logs.value = [];
    loadedBranchId.value = null;
    return;
  }

  // Only load if branch actually changed
  if (newBranchId !== oldBranchId) {
    console.log('Loading logs for new branch:', newBranchId);
    // Clear tracking to force reload
    loadedBranchId.value = null;
    loadedFilters.value = { type: '', startDate: '', endDate: '' };
    await loadLogs(true);
  }
}, { immediate: false });
</script>

<template>
  <div class="space-y-6">
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div>
        <label for="type" class="block text-sm font-medium text-tBase-100 mb-2">Type</label>
        <select id="type" v-model="selectedType"
          class="bg-bgPrimary-0 border border-bgPrimary-200 text-tBase-100 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5">
          <option value="">All</option>
          <option value="add_stock">Add Stock</option>
          <option value="deduct_stock">Deduct Stock</option>
          <option value="reject">Reject Stock</option>
          <option value="transfer">Transfer Stock</option>
          <option value="adjust_stock">Adjust Stock</option>
        </select>
      </div>

      <div>
        <label for="startDate" class="block text-sm font-medium text-tBase-100 mb-2">Start Date</label>
        <input id="startDate" type="date" v-model="startDate"
          class="bg-bgPrimary-0 border border-bgPrimary-200 text-tBase-100 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5" />
      </div>

      <div>
        <label for="endDate" class="block text-sm font-medium text-tBase-100 mb-2">End Date</label>
        <input id="endDate" type="date" v-model="endDate"
          class="bg-bgPrimary-0 border border-bgPrimary-200 text-tBase-100 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5" />
      </div>

      <div class="flex items-end gap-2">
        <button @click="applyFilters" :disabled="isLoading"
          class="flex-1 bg-primary-500 hover:bg-primary-600 disabled:bg-primary-300 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          {{ isLoading ? 'Loading...' : 'Apply Filters' }}
        </button>
        <button @click="resetFilters" :disabled="isLoading"
          class="bg-bgPrimary-200 hover:bg-bgPrimary-300 disabled:bg-bgPrimary-100 text-tBase-100 px-3 py-2 rounded-lg text-sm font-medium transition-colors">
          Reset
        </button>
      </div>
    </div>

    <div class="overflow-x-auto bg-bgPrimary-0 rounded-lg border border-bgPrimary-200">
      <table class="min-w-full table-auto">
        <thead class="bg-bgPrimary-100">
          <tr>
            <th
              class="px-4 py-3 text-left text-xs font-medium text-tBase-400 uppercase tracking-wider border-b border-bgPrimary-200">
              Date
            </th>
            <th
              class="px-4 py-3 text-left text-xs font-medium text-tBase-400 uppercase tracking-wider border-b border-bgPrimary-200">
              User
            </th>
            <th
              class="px-4 py-3 text-left text-xs font-medium text-tBase-400 uppercase tracking-wider border-b border-bgPrimary-200">
              Action
            </th>
            <th
              class="px-4 py-3 text-left text-xs font-medium text-tBase-400 uppercase tracking-wider border-b border-bgPrimary-200">
              Details
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-bgPrimary-200">
          <tr v-for="log in logs" :key="log.id" class="hover:bg-bgPrimary-50 transition-colors">
            <td class="px-4 py-3 text-sm text-tBase-100">
              {{ log.timestamp ? new Date(log.timestamp).toLocaleString() : '-' }}
            </td>
            <td class="px-4 py-3 text-sm text-tBase-100">
              {{ log?.createdBy?.firstName || '' }} {{ log?.createdBy?.lastName || '' }}
            </td>
            <td class="px-4 py-3 text-sm text-tBase-100 capitalize">
              <span class="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-primary-100 text-primary-800">
                {{ log.type?.replace('_', ' ') || 'Unknown' }}
              </span>
            </td>
            <td class="px-4 py-3 text-sm text-tBase-100">
              {{ log.details || log.reason || '-' }}
            </td>
          </tr>

          <!-- Empty state -->
          <tr v-if="!isLoading && logs.length === 0">
            <td colspan="4" class="text-center py-8 text-tBase-400">
              <div class="flex flex-col items-center">
                <svg class="w-12 h-12 mb-2 text-tBase-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z">
                  </path>
                </svg>
                <p class="text-sm font-medium">No logs found</p>
                <p class="text-xs">Try adjusting your filters or check back later</p>
              </div>
            </td>
          </tr>

          <!-- Loading state -->
          <tr v-if="isLoading">
            <td colspan="4" class="text-center py-8 text-tBase-400">
              <div class="flex items-center justify-center">
                <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-primary-500" xmlns="http://www.w3.org/2000/svg"
                  fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                  </path>
                </svg>
                Loading logs...
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Load more button -->
    <div class="flex justify-center">
      <button @click="loadMore" :disabled="!hasMoreLogs || isLoading"
        class="bg-primary-100 hover:bg-primary-200 disabled:bg-bgPrimary-100 text-primary-700 disabled:text-tBase-400 px-6 py-2 rounded-lg text-sm font-medium transition-colors">
        {{ isLoading ? 'Loading...' : hasMoreLogs ? 'Load More Logs' : 'No More Logs' }}
      </button>
    </div>
  </div>
</template>
