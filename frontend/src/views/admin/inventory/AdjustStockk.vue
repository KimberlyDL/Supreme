<!-- frontend\src\views\admin\inventory\AdjustStockk.vue -->
<!-- frontend\src\views\admin\inventory\AdjustStock.vue -->
<template>
  <div class="adjust-stock">
    <h2 class="text-xl font-semibold text-tBase-100 mb-6">Adjust Stock Count</h2>

    <div class="bg-amber-100 border-l-4 border-amber-500 text-amber-700 p-4 mb-6" role="alert">
      <p class="font-bold">Important</p>
      <p>Stock adjustments should only be made during inventory audits or when reconciling physical counts with system
        records.</p>
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Product selection -->
      <div>
        <label for="product" class="block text-sm font-medium text-tBase-100 mb-2">Product</label>
        <select id="product" v-model="selectedStockItem" required
          class="bg-bgPrimary-0 border border-bgPrimary-200 text-tBase-100 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5">
          <option value="">Select Product</option>
          <option v-for="item in branchStock" :key="`${item.productId}-${item.varietyId}`"
            :value="`${item.productId}|${item.varietyId}`">
            {{ item.product?.name || 'Unknown Product' }} - {{ item.variety?.name || 'Default' }}
            ({{ item.quantity }} in stock)
          </option>
        </select>
      </div>

      <!-- Adjustment Type -->
      <div>
        <label for="adjustment-type" class="block text-sm font-medium text-tBase-100 mb-2">Adjustment Type</label>
        <select id="adjustment-type" v-model="formData.adjustmentType" required
          class="bg-bgPrimary-0 border border-bgPrimary-200 text-tBase-100 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5">
          <option value="">Select Adjustment Type</option>
          <option value="count_adjustment">Count Adjustment</option>
          <option value="full_reset">Full Reset (Replace All)</option>
        </select>
      </div>

      <!-- Current Quantity (read-only) -->
      <div v-if="selectedStockItemData">
        <label class="block text-sm font-medium text-tBase-100 mb-2">Current Quantity</label>
        <input type="text" :value="selectedStockItemData.quantity" readonly
          class="bg-bgPrimary-100 border border-bgPrimary-200 text-tBase-400 text-sm rounded-lg block w-full p-2.5" />
      </div>

      <!-- New Quantity -->
      <div>
        <label for="new-quantity" class="block text-sm font-medium text-tBase-100 mb-2">New Quantity</label>
        <input id="new-quantity" v-model.number="formData.newQuantity" type="number" min="0" required
          class="bg-bgPrimary-0 border border-bgPrimary-200 text-tBase-100 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5" />
      </div>

      <!-- Expiration Date (for adding stock) -->
      <div v-if="isAddingStock">
        <label for="expiration-date" class="block text-sm font-medium text-tBase-100 mb-2">
          Expiration Date
          <span class="text-tBase-400 text-xs">(Required when adding stock)</span>
        </label>
        <input id="expiration-date" v-model="formData.expirationDate" type="date" required
          class="bg-bgPrimary-0 border border-bgPrimary-200 text-tBase-100 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5" />
      </div>

      <!-- Reason -->
      <div>
        <label for="reason" class="block text-sm font-medium text-tBase-100 mb-2">
          Reason for Adjustment
          <span class="text-red-500">*</span>
        </label>
        <textarea id="reason" v-model="formData.reason" rows="3" required
          placeholder="Reason for adjusting stock (e.g., physical count, inventory audit)"
          class="bg-bgPrimary-0 border border-bgPrimary-200 text-tBase-100 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5"></textarea>
      </div>

      <!-- Submit button -->
      <div class="flex justify-end">
        <button type="submit"
          class="text-white bg-primary-500 hover:bg-primary-600 focus:ring-4 focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 focus:outline-none"
          :disabled="loading || !isFormValid">
          <Loader2 v-if="loading" class="w-4 h-4 mr-2 inline animate-spin" />
          Adjust Stock
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { Loader2 } from 'lucide-vue-next';

const props = defineProps({
  branchId: {
    type: String,
    required: true
  },
  branchStock: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['adjust-stock']);

// State
const loading = ref(false);
const selectedStockItem = ref('');
const formData = ref({
  branchId: props.branchId,
  productId: '',
  varietyId: '',
  adjustmentType: '',
  newQuantity: 0,
  expirationDate: '',
  reason: ''
});

// Computed properties
const products = computed(() => inventoryStore.getProducts);

// Computed properties
const selectedStockItemData = computed(() => {
  if (!selectedStockItem.value) return null;

  const [productId, varietyId] = selectedStockItem.value.split('|');
  return props.branchStock.find(item =>
    item.productId === productId && item.varietyId === varietyId
  );
});

const isAddingStock = computed(() => {
  if (!selectedStockItemData.value || formData.value.newQuantity === undefined) return false;
  return formData.value.newQuantity > selectedStockItemData.value.quantity;
});

const isFormValid = computed(() => {
  if (!selectedStockItem.value) return false;
  if (!formData.value.adjustmentType) return false;
  if (formData.value.newQuantity === undefined || formData.value.newQuantity < 0) return false;
  if (!formData.value.reason) return false;

  // If adding stock, require expiration date
  if (isAddingStock.value && !formData.value.expirationDate) return false;

  return true;
});

// Watch for changes
watch(selectedStockItem, (newValue) => {
  if (newValue) {
    const [productId, varietyId] = newValue.split('|');
    formData.value.productId = productId;
    formData.value.varietyId = varietyId;

    // Set initial new quantity to current quantity
    if (selectedStockItemData.value) {
      formData.value.newQuantity = selectedStockItemData.value.quantity;
    }
  } else {
    formData.value.productId = '';
    formData.value.varietyId = '';
    formData.value.newQuantity = 0;
  }
});

watch(() => props.branchId, (newBranchId) => {
  formData.value.branchId = newBranchId;
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
    await emit('adjust-stock', { ...formData.value });

    // Reset form
    selectedStockItem.value = '';
    formData.value = {
      branchId: props.branchId,
      productId: '',
      varietyId: '',
      adjustmentType: '',
      newQuantity: 0,
      expirationDate: '',
      reason: ''
    };
  } catch (error) {
    console.error('Error submitting form:', error);
    // Error is handled by parent component
  } finally {
    loading.value = false;
  }
};


</script>