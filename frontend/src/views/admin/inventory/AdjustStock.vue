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
      <!-- Product selection with improved readability -->
      <div>
        <label for="product" class="block text-sm font-medium text-tBase-100 mb-2">Product</label>
        <select id="product" v-model="selectedStockItem" required
          class="bg-bgPrimary-0 border border-bgPrimary-200 text-tBase-100 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5">
          <option value="">Select Product</option>
          <option v-for="item in enhancedBranchStock" :key="item.id" :value="item.id">
            {{ item.displayName }} ({{ item.quantity }} in stock)
          </option>
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

      <!-- Expiration Date Management -->
      <div>
        <div class="flex justify-between items-center mb-2">
          <label class="block text-sm font-medium text-tBase-100">Expiration Dates</label>
          <button type="button" @click="addExpirationDate"
            class="text-white bg-primary-500 hover:bg-primary-600 focus:ring-4 focus:ring-primary-300 font-medium rounded-lg text-xs px-3 py-1 focus:outline-none">
            Add Date
          </button>
        </div>

        <!-- Current expiration dates -->
        <div v-if="formData.expirationDates.length > 0" class="mb-4 space-y-3">
          <div v-for="(exp, index) in formData.expirationDates" :key="index"
            class="flex items-center space-x-2 p-2 bg-bgPrimary-50 rounded-lg">
            <div class="flex-grow grid grid-cols-2 gap-2">
              <div>
                <label :for="`exp-date-${index}`" class="block text-xs font-medium text-tBase-400 mb-1">Date</label>
                <input :id="`exp-date-${index}`" v-model="exp.date" type="date"
                  class="bg-bgPrimary-0 border border-bgPrimary-200 text-tBase-100 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2" />
              </div>
              <div>
                <label :for="`exp-qty-${index}`" class="block text-xs font-medium text-tBase-400 mb-1">Quantity</label>
                <input :id="`exp-qty-${index}`" v-model.number="exp.qty" type="number" min="1"
                  @input="enforceMaxQty(index)"
                  class="bg-bgPrimary-0 border border-bgPrimary-200 text-tBase-100 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2" />
              </div>
            </div>
            <button type="button" @click="removeExpirationDate(index)"
              class="text-red-500 hover:text-red-700 focus:outline-none">
              <Trash2 class="w-5 h-5" />
            </button>
          </div>
        </div>

        <div v-else class="text-sm text-tBase-400 italic mb-4">
          No expiration dates specified. Add dates if you're increasing stock quantity.
        </div>
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
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { Loader2, Trash2 } from 'lucide-vue-next';
import { useInventoryStore } from '@/stores/inventoryStore';

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

// Initialize inventory store
const inventoryStore = useInventoryStore();

// State
const loading = ref(false);
const selectedStockItem = ref('');
const formData = ref({
  branchId: props.branchId,
  productId: '',
  varietyId: '',
  adjustmentType: 'count_adjustment', // Default to count adjustment
  newQuantity: 0,
  expirationDates: [],
  reason: ''
});

// Computed properties
const enhancedBranchStock = computed(() => {
  return inventoryStore.getProductBranchStock;
});

// Get selected stock item data
const selectedStockItemData = computed(() => {
  if (!selectedStockItem.value) return null;
  return props.branchStock.find(item => item.id === selectedStockItem.value);
});

// Check if we're adding stock (new quantity > current quantity)
const isAddingStock = computed(() => {
  if (!selectedStockItemData.value || formData.value.newQuantity === undefined) return false;
  return formData.value.newQuantity > selectedStockItemData.value.quantity;
});

// Form validation
const isFormValid = computed(() => {
  if (!selectedStockItem.value) return false;
  if (formData.value.newQuantity === undefined || formData.value.newQuantity < 0) return false;
  if (!formData.value.reason) return false;

  // If adding stock, require at least one expiration date
  if (isAddingStock.value && formData.value.expirationDates.length === 0) return false;

  // Validate each expiration date
  for (const exp of formData.value.expirationDates) {
    if (!exp.date || !exp.qty || exp.qty <= 0) return false;
  }

  if (!checkQuantityMatch) return false;

  return true;
});





const enforceMaxQty = (index) => {
  const exp = formData.value.expirationDates[index];

  const totalAllowed = Number(formData.value.newQuantity) || 0;

  if (exp.qty === '' || exp.qty === null || exp.qty === undefined) return;

  // Calculate already used qty (excluding current input)
  const totalSoFar = formData.value.expirationDates.reduce((sum, e, i) => {
    return sum + (i === index ? 0 : Number(e.qty) || 0);
  }, 0);

  const maxForThisInput = Math.min(totalAllowed - totalSoFar);

  // ✅ Don't force min 1. Allow 0 if no quantity left.
  exp.qty = Math.max(0, maxForThisInput);
  //checkQuantityMatch(); // still validate total qty

};


const checkQuantityMatch = () => {
  const total = formData.value.expirationDates.reduce((sum, e) => sum + (e.qty || 0), 0);
  const isMatch = total === formData.value.newQuantity;

  // isQuantityMatching.value = isMatch;
  return isMatch;
};








// Methods
const addExpirationDate = () => {
  formData.value.expirationDates.push({
    date: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
    qty: 1
  });
};

const removeExpirationDate = (index) => {
  formData.value.expirationDates.splice(index, 1);
};

// Initialize expiration dates from selected stock item
const initializeExpirationDates = () => {
  if (selectedStockItemData.value && selectedStockItemData.value.expirationDates) {
    // Clone the expiration dates to avoid modifying the original data
    formData.value.expirationDates = selectedStockItemData.value.expirationDates.map(exp => ({
      date: typeof exp.date === 'number'
        ? new Date(exp.date * 1000).toISOString().split('T')[0] // Convert timestamp to YYYY-MM-DD
        : new Date(exp.date).toISOString().split('T')[0], // Convert date string to YYYY-MM-DD
      qty: exp.qty
    }));
  } else {
    formData.value.expirationDates = [];
  }
};

// Watch for changes
watch(selectedStockItem, (newValue) => {
  if (newValue) {
    const stockItem = props.branchStock.find(item => item.id === newValue);
    if (stockItem) {
      formData.value.productId = stockItem.productId;
      formData.value.varietyId = stockItem.varietyId;
      formData.value.newQuantity = stockItem.quantity;

      // Initialize expiration dates
      initializeExpirationDates();
    }
  } else {
    formData.value.productId = '';
    formData.value.varietyId = '';
    formData.value.newQuantity = 0;
    formData.value.expirationDates = [];
  }
});

watch(() => props.branchId, (newBranchId) => {
  formData.value.branchId = newBranchId;
});

// Handle form submission
const handleSubmit = async () => {
  try {
    loading.value = true;

    // console.log('helloe');

    // // Validate form
    // if (!isFormValid.value) {
    //   throw new Error('Please fill out all required fields correctly');
    // }

    // Prepare data for submission
    const adjustData = {
      ...formData.value
    };

    // Submit form
    await emit('adjust-stock', adjustData);

    // Reset form
    selectedStockItem.value = '';
    formData.value = {
      branchId: props.branchId,
      productId: '',
      varietyId: '',
      adjustmentType: 'count_adjustment',
      newQuantity: 0,
      expirationDates: [],
      reason: ''
    };
  } catch (error) {
    console.error('Error submitting form:', error);
    // Error is handled by parent component

    inventoryStore.setError(error.message);
  } finally {
    loading.value = false;
  }
};

// Initialize component
onMounted(() => {
  // Set default adjustment type
  formData.value.adjustmentType = 'count_adjustment';
});

onUnmounted(() => {
  inventoryStore.clearMessages();
});
</script>