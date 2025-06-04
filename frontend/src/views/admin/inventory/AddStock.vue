<!-- frontend\src\views\admin\inventory\AddStock.vue -->
<template>
  <div class="add-stock">
    <h2 class="text-xl font-semibold text-tBase-100 mb-6">Add Stock</h2>

    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Branch selection -->
      <div v-if="showBranchSelector">
        <label for="branch" class="block text-sm font-medium text-tBase-100 mb-2">Branch</label>
        <select id="branch" v-model="formData.branchId" required
          class="bg-bgPrimary-0 border border-bgPrimary-200 text-tBase-100 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5">
          <option value="">Select Branch</option>
          <option v-for="branch in branches" :key="branch.id" :value="branch.id">
            {{ branch.name }}
          </option>
        </select>
      </div>

      <!-- Product selection with improved readability -->
      <div>
        <label for="product" class="block text-sm font-medium text-tBase-100 mb-2">Product</label>
        <select id="product" v-model="selectedProduct" required
          class="bg-bgPrimary-0 border border-bgPrimary-200 text-tBase-100 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5">
          <option value="">Select Product</option>
          <option v-for="product in products" :key="product.id" :value="product.id">
            {{ product.name }}
          </option>
        </select>
      </div>

      <!-- Variety selection -->
      <div v-if="selectedProduct && productVarieties.length > 0">
        <label for="variety" class="block text-sm font-medium text-tBase-100 mb-2">Variety</label>
        <select id="variety" v-model="formData.varietyId" required
          class="bg-bgPrimary-0 border border-bgPrimary-200 text-tBase-100 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5">
          <option value="">Select Variety</option>
          <option v-for="variety in productVarieties" :key="variety.id" :value="variety.id">
            {{ variety.name }}
          </option>
        </select>
      </div>

      <!-- Quantity -->
      <div>
        <label for="quantity" class="block text-sm font-medium text-tBase-100 mb-2">Quantity</label>
        <input id="quantity" v-model.number="formData.quantity" type="number" min="1" @blur="onStockQtyChanged" required
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
                  @blur="onExpirationQtyChanged" @input="enforceMaxQty(index)"
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
          No expiration dates specified. Add at least one expiration date.
        </div>
      </div>

      <!-- Reason -->
      <div>
        <label for="reason" class="block text-sm font-medium text-tBase-100 mb-2">
          Reason
          <span class="text-tBase-400 text-xs">(Optional)</span>
        </label>
        <textarea id="reason" v-model="formData.reason" rows="3"
          placeholder="Reason for adding stock (e.g., new shipment, inventory restock)"
          class="bg-bgPrimary-0 border border-bgPrimary-200 text-tBase-100 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5"></textarea>
      </div>

      <!-- Submit button -->
      <div class="flex justify-end">
        <button type="submit"
          class="text-white bg-primary-500 hover:bg-primary-600 focus:ring-4 focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 focus:outline-none"
          :disabled="loading">
          <Loader2 v-if="loading" class="w-4 h-4 mr-2 inline animate-spin" />
          Add Stock
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed, watch, onUnmounted } from 'vue';
import { Loader2, Trash2 } from 'lucide-vue-next';
import { useInventoryStore } from '@/stores/inventoryStore';

const props = defineProps({
  branchId: {
    type: String,
    default: ''
  },
  branches: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['add-stock']);

// Initialize inventory store
const inventoryStore = useInventoryStore();

// State
const loading = ref(false);
const selectedProduct = ref('');
const formData = ref({
  branchId: props.branchId || '',
  productId: '',
  varietyId: '',
  quantity: 1,
  expirationDates: [],
  reason: ''
});

// Computed properties
const products = computed(() => {
  // return inventoryStore.getProducts;
  return inventoryStore.getActiveProducts;
  
});

const showBranchSelector = computed(() => {
  return !props.branchId;
});

const productVarieties = computed(() => {
  if (!selectedProduct.value) return [];

  const product = products.value.find(p => p.id === selectedProduct.value);
  return product?.varieties || [];
});

const stockQtyMatchesExpQty = () => {
  const totalExpQty = formData.value.expirationDates.reduce((sum, exp) => sum + (exp.qty || 0), 0);
  return totalExpQty === formData.value.quantity;
};

const enforceMaxQty = (index) => {
  const exp = formData.value.expirationDates[index];

  const totalAllowed = Number(formData.value.quantity) || 0;

  if (exp.qty === '' || exp.qty === null || exp.qty === undefined) return;

  const totalSoFar = formData.value.expirationDates.reduce((sum, e, i) => {
    return sum + (i === index ? 0 : Number(e.qty) || 0);
  }, 0);

  const maxForThisInput = Math.min(totalAllowed - totalSoFar);

  exp.qty = Math.max(0, Math.min(exp.qty, maxForThisInput));
};



const isFormValid = computed(() => {
  if (showBranchSelector.value && !formData.value.branchId) return false;
  if (!selectedProduct.value) return false;
  if (productVarieties.value.length > 0 && !formData.value.varietyId) return false;
  if (!formData.value.quantity || formData.value.quantity < 1) return false;

  // Require at least one expiration date
  if (formData.value.expirationDates.length === 0) return false;

  // Validate each expiration date
  for (const exp of formData.value.expirationDates) {
    if (!exp.date || !exp.qty || exp.qty <= 0) return false;
  }

  if (!stockQtyMatchesExpQty()) return false;


  return true;
});

const onExpirationQtyChanged = () => {
  stockQtyMatchesExpQty();
};
const onStockQtyChanged = () => {
  stockQtyMatchesExpQty();
};


// Methods
const addExpirationDate = () => {
  // Calculate remaining quantity to allocate
  const currentTotal = formData.value.expirationDates.reduce((sum, exp) => sum + (exp.qty || 0), 0);
  const remainingQty = Math.max(1, formData.value.quantity - currentTotal);

  formData.value.expirationDates.push({
    date: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
    qty: remainingQty
  });
};

const removeExpirationDate = (index) => {
  formData.value.expirationDates.splice(index, 1);
};

// // Update total quantity when expiration date quantities change
// const updateTotalQuantity = () => {
//   const totalExpQty = formData.value.expirationDates.reduce((sum, exp) => sum + (exp.qty || 0), 0);
//   formData.value.quantity = totalExpQty;
// };

// Watch for changes
watch(selectedProduct, (newValue) => {
  if (newValue) {
    formData.value.productId = newValue;
    formData.value.varietyId = '';

    // If only one variety, select it automatically
    if (productVarieties.value.length === 1) {
      formData.value.varietyId = productVarieties.value[0].id;
    }
  } else {
    formData.value.productId = '';
    formData.value.varietyId = '';
  }
});

watch(() => props.branchId, (newBranchId) => {
  if (newBranchId) {
    formData.value.branchId = newBranchId;
  }
});

// // Watch for changes in expiration dates to update total quantity
// watch(() => formData.value.expirationDates, () => {
//   updateTotalQuantity();
// }, { deep: true });

// Handle form submission
const handleSubmit = async () => {
  try {
    loading.value = true;

    // // Validate form
    // if (!isFormValid.value) {
    //   throw new Error('Please fill out all fields correctly');
    // }

    // Submit form
    await emit('add-stock', formData.value);

    // Reset form
    selectedProduct.value = '';
    formData.value = {
      branchId: props.branchId || '',
      productId: '',
      varietyId: '',
      quantity: 1,
      expirationDates: [],
      reason: ''
    };
  } catch (error) {
    console.error('Error submitting form:', error);

    inventoryStore.setError(error.message);
    // Error is handled by parent component
  } finally {
    loading.value = false;
  }
};

// Initialize with one expiration date
if (formData.value.expirationDates.length === 0) {
  addExpirationDate();
}


onUnmounted(() => {
  inventoryStore.clearMessages();
});
</script>