<!-- frontend\src\views\admin\inventory\TransferStock.vue -->
<template>
    <div class="transfer-stock">
      <h2 class="text-xl font-semibold text-tBase-100 mb-6">Transfer Stock Between Branches</h2>
      
      <form @submit.prevent="handleSubmit" class="space-y-6">
        <!-- Source Branch -->
        <div>
          <label for="source-branch" class="block text-sm font-medium text-tBase-100 mb-2">Source Branch</label>
          <select
            id="source-branch"
            v-model="formData.sourceBranchId"
            required
            class="bg-bgPrimary-0 border border-bgPrimary-200 text-tBase-100 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5"
          >
            <option value="">Select Source Branch</option>
            <option v-for="branch in branches" :key="branch.id" :value="branch.id">
              {{ branch.name }}
            </option>
          </select>
        </div>
        
        <!-- Destination Branch -->
        <div>
          <label for="dest-branch" class="block text-sm font-medium text-tBase-100 mb-2">Destination Branch</label>
          <select
            id="dest-branch"
            v-model="formData.destBranchId"
            required
            class="bg-bgPrimary-0 border border-bgPrimary-200 text-tBase-100 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5"
            :disabled="!formData.sourceBranchId"
          >
            <option value="">Select Destination Branch</option>
            <option 
              v-for="branch in availableDestinationBranches" 
              :key="branch.id" 
              :value="branch.id"
            >
              {{ branch.name }}
            </option>
          </select>
          <p v-if="!availableDestinationBranches.length && formData.sourceBranchId" class="mt-1 text-xs text-red-500">
            No other branches available for transfer
          </p>
        </div>
        
        <!-- Product selection -->
        <div>
          <label for="product" class="block text-sm font-medium text-tBase-100 mb-2">Product</label>
          <select
            id="product"
            v-model="selectedStockItem"
            required
            class="bg-bgPrimary-0 border border-bgPrimary-200 text-tBase-100 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5"
            :disabled="!formData.sourceBranchId || !formData.destBranchId"
          >
            <option value="">Select Product</option>
            <option 
              v-for="item in sourceStockItems" 
              :key="`${item.productId}-${item.varietyId}`" 
              :value="`${item.productId}|${item.varietyId}`"
            >
              {{ item.product?.name || 'Unknown Product' }} - {{ item.variety?.name || 'Default' }} 
              ({{ item.quantity }} in stock)
            </option>
          </select>
        </div>
        
        <!-- Quantity -->
        <div>
          <label for="quantity" class="block text-sm font-medium text-tBase-100 mb-2">Quantity to Transfer</label>
          <input
            id="quantity"
            v-model.number="formData.quantity"
            type="number"
            min="1"
            :max="selectedStockItemData ? selectedStockItemData.quantity : 1"
            required
            class="bg-bgPrimary-0 border border-bgPrimary-200 text-tBase-100 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5"
            :disabled="!selectedStockItem"
          />
          <p v-if="selectedStockItemData" class="mt-1 text-xs text-tBase-400">
            Maximum: {{ selectedStockItemData.quantity }} units
          </p>
        </div>
        
        <!-- Reason -->
        <div>
          <label for="reason" class="block text-sm font-medium text-tBase-100 mb-2">
            Reason for Transfer
            <span class="text-tBase-400 text-xs">(Optional)</span>
          </label>
          <textarea
            id="reason"
            v-model="formData.reason"
            rows="3"
            placeholder="Reason for transferring stock (e.g., rebalancing inventory, fulfilling branch needs)"
            class="bg-bgPrimary-0 border border-bgPrimary-200 text-tBase-100 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5"
          ></textarea>
        </div>
        
        <!-- Submit button -->
        <div class="flex justify-end">
          <button
            type="submit"
            class="text-white bg-primary-500 hover:bg-primary-600 focus:ring-4 focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 focus:outline-none"
            :disabled="loading || !isFormValid"
          >
            <Loader2 v-if="loading" class="w-4 h-4 mr-2 inline animate-spin" />
            Transfer Stock
          </button>
        </div>
      </form>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, watch } from 'vue';
  import { useInventoryStore } from '@/stores/inventoryStore';
  import { Loader2 } from 'lucide-vue-next';
  
  const props = defineProps({
    branchId: {
      type: String,
      default: ''
    },
    branches: {
      type: Array,
      default: () => []
    },
    branchStock: {
      type: Array,
      default: () => []
    }
  });
  
  const emit = defineEmits(['transfer-stock']);
  
  const inventoryStore = useInventoryStore();
  
  // State
  const loading = computed(() => inventoryStore.isLoading);
  const selectedStockItem = ref('');
  const sourceStockItems = ref([]);
  const formData = ref({
    sourceBranchId: props.branchId || '',
    destBranchId: '',
    productId: '',
    varietyId: '',
    quantity: 1,
    reason: ''
  });
  
  // Computed properties
  const availableDestinationBranches = computed(() => {
    if (!formData.value.sourceBranchId) return [];
    return props.branches.filter(branch => branch.id !== formData.value.sourceBranchId);
  });
  
  const selectedStockItemData = computed(() => {
    if (!selectedStockItem.value) return null;
    
    const [productId, varietyId] = selectedStockItem.value.split('|');
    return sourceStockItems.value.find(item => 
      item.productId === productId && item.varietyId === varietyId
    );
  });
  
  const isFormValid = computed(() => {
    if (!formData.value.sourceBranchId) return false;
    if (!formData.value.destBranchId) return false;
    if (!selectedStockItem.value) return false;
    if (!formData.value.quantity || formData.value.quantity < 1) return false;
    
    // Check if quantity is valid
    if (selectedStockItemData.value && formData.value.quantity > selectedStockItemData.value.quantity) {
      return false;
    }
    
    return true;
  });
  
  // Watch for changes
  watch(selectedStockItem, (newValue) => {
    if (newValue) {
      const [productId, varietyId] = newValue.split('|');
      formData.value.productId = productId;
      formData.value.varietyId = varietyId;
      formData.value.quantity = 1;
    } else {
      formData.value.productId = '';
      formData.value.varietyId = '';
    }
  });
  
  watch(() => props.branchId, (newBranchId) => {
    if (newBranchId) {
      formData.value.sourceBranchId = newBranchId;
    }
  });
  
  watch(() => formData.value.sourceBranchId, async (newSourceBranchId) => {
    if (newSourceBranchId) {
      // Reset selection
      selectedStockItem.value = '';
      formData.value.productId = '';
      formData.value.varietyId = '';
      
      // Fetch stock for source branch
      try {
        loading.value = true;
        await inventoryStore.fetchBranchStock(newSourceBranchId);
        sourceStockItems.value = inventoryStore.getProductBranchStock;
      } catch (error) {
        console.error('Error fetching source branch stock:', error);
      } finally {
        loading.value = false;
      }
    } else {
      sourceStockItems.value = [];
    }
  });
  
  // Methods
  const handleSubmit = async () => {
    try {
      loading.value = true;
      
      // Validate form
      if (!isFormValid.value) {
        throw new Error('Please fill out all required fields correctly');
      }
      
      // Submit form
      const result = await inventoryStore.transferStock(formData.value);
      
      if (result.success) {
        // Reset form
        selectedStockItem.value = '';
        formData.value = {
          sourceBranchId: props.branchId || '',
          destBranchId: '',
          productId: '',
          varietyId: '',
          quantity: 1,
          reason: ''
        };
        
        // Refresh source branch stock
        await inventoryStore.fetchBranchStock(formData.value.sourceBranchId);
        sourceStockItems.value = inventoryStore.getProductBranchStock;
        
        // Notify parent
        emit('transfer-stock', result);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      inventoryStore.setError(error.message);
    } finally {
      loading.value = false;
    }
  };
  </script>