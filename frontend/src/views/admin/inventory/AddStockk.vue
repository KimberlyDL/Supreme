<!-- frontend\src\views\admin\inventory\AddStock.vue -->
<template>
    <div class="add-stock">
        <h2 class="text-xl font-semibold text-tBase-100 mb-6">Add Stock</h2>

        <form @submit.prevent="handleSubmit" class="space-y-6">
            <!-- Branch selection (if not provided)
            <div v-if="!branchId">
                <label for="branch" class="block text-sm font-medium text-tBase-100 mb-2">Branch</label>
                <select id="branch" v-model="formData.branchId" required
                    class="bg-bgPrimary-0 border border-bgPrimary-200 text-tBase-100 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5">
                    <option value="">Select Branch</option>
                    <option v-for="branch in branches" :key="branch.id" :value="branch.id">
                        {{ branch.name }}
                    </option>
                </select>
            </div> -->

            <!-- Product selection -->
            <div>
                <label for="product" class="block text-sm font-medium text-tBase-100 mb-2">Product</label>
                <select id="product" v-model="selectedProductId" required
                    class="bg-bgPrimary-0 border border-bgPrimary-200 text-tBase-100 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5">
                    <option value="">Select Product</option>
                    <option v-for="product in products" :key="product.id" :value="product.id">
                        {{ product.name }}
                    </option>
                </select>
            </div>

            <!-- Variety selection -->
            <div v-if="selectedProduct">
                <label for="variety" class="block text-sm font-medium text-tBase-100 mb-2">Variety</label>
                <select id="variety" v-model="selectedVarietyId" required
                    class="bg-bgPrimary-0 border border-bgPrimary-200 text-tBase-100 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5">
                    <option value="">Select Variety</option>
                    <option v-for="variety in selectedProduct.varieties" :key="variety.id" :value="variety.id">
                        {{ variety.name }} ({{ variety.unit }})
                    </option>
                </select>
            </div>

            <!-- Quantity -->
            <div>
                <label for="quantity" class="block text-sm font-medium text-tBase-100 mb-2">Quantity</label>
                <input id="quantity" v-model.number="formData.quantity" type="number" min="1" required
                    class="bg-bgPrimary-0 border border-bgPrimary-200 text-tBase-100 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5" />
            </div>

            <!-- Expiration Date -->
            <div>
                <label for="expiration-date" class="block text-sm font-medium text-tBase-100 mb-2">
                    Expiration Date
                    <span class="text-tBase-400 text-xs">(Optional)</span>
                </label>
                <input id="expiration-date" v-model="formData.expirationDate" type="date"
                    class="bg-bgPrimary-0 border border-bgPrimary-200 text-tBase-100 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5" />
            </div>

            <!-- Reason -->
            <div>
                <label for="reason" class="block text-sm font-medium text-tBase-100 mb-2">
                    Reason
                    <span class="text-tBase-400 text-xs">(Optional)</span>
                </label>
                <textarea id="reason" v-model="formData.reason" rows="3"
                    placeholder="Reason for adding stock (e.g., new shipment, returned items)"
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
    }
});

const emit = defineEmits(['add-stock']);

const inventoryStore = useInventoryStore();

// State
const loading = computed(() => inventoryStore.isLoading);
const selectedProductId = ref('');
const selectedVarietyId = ref('');
const formData = ref({
    branchId: props.branchId || '',
    productId: '',
    varietyId: '',
    quantity: 1,
    expirationDate: '',
    reason: ''
});

// Computed properties
const products = computed(() => inventoryStore.getProducts);

const selectedProduct = computed(() => {
    if (!selectedProductId.value) return null;
    return products.value.find(p => p.id === selectedProductId.value);
});

// Watch for changes in selected product/variety
watch(selectedProductId, (newProductId) => {
    selectedVarietyId.value = '';
    formData.value.productId = newProductId;

    console.log('From watch selectedProductId Selected variety:', newProductId);
    console.log('From watch selectedProductId Form data:', formData.value);

});

watch(selectedVarietyId, (newVarietyId) => {
    formData.value.varietyId = newVarietyId;

    console.log('From watch selectedVarietyId Selected variety:', newVarietyId);
    console.log('From watch selectedVarietyId Form data:', formData.value);
});

watch(() => props.branchId, (newBranchId) => {
    formData.value.branchId = newBranchId;

    console.log('From watch branchId Form data:', formData.value);
    console.log('From watch branchId New branch ID:', newBranchId);
});

// Methods
const handleSubmit = async () => {
    try {
        loading.value = true;


        // Validate form
        if (!formData.value.branchId) {
            throw new Error('Please select a branch');
        }

        if (!formData.value.productId) {
            throw new Error('Please select a product');
        }

        if (!formData.value.varietyId && selectedProduct.value?.varieties?.length > 0) {
            throw new Error('Please select a variety');
        }

        if (!formData.value.quantity || formData.value.quantity < 1) {
            throw new Error('Please enter a valid quantity');
        }

        // ✅ Convert expirationDate to UTC format if provided
        if (formData.value.expirationDate) {
            const date = new Date(formData.value.expirationDate);
            formData.value.expirationDate = date.toISOString(); // ISO 8601 UTC format
        }


        console.log('Form data before submission:', formData.value);
        // Submit form
        const result = await inventoryStore.addStock(formData.value);

        // if (result.success) {
        //     // Reset form
        //     selectedProductId.value = '';
        //     selectedVarietyId.value = '';
        //     formData.value = {
        //         branchId: props.branchId || '',
        //         productId: '',
        //         varietyId: '',
        //         quantity: 1,
        //         expirationDate: '',
        //         reason: ''
        //     };

        //     // Notify parent
        //     emit('add-stock', result);
        // }
    } catch (error) {
        console.error('Error submitting form:', error);
        inventoryStore.setError(error.message);
    } finally {
        loading.value = false;
    }
};
</script>