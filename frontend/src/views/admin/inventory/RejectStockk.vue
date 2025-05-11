<!-- frontend\src\views\admin\inventory\RejectStock.vue -->
<template>
    <div class="reject-stock">
        <h2 class="text-xl font-semibold text-tBase-100 mb-6">Reject Stock</h2>

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

            <!-- Expiration Date selection (if available) -->
            <div v-if="selectedStockItemData && selectedStockItemData.expirationDates?.length > 0">
                <label for="expiration-date" class="block text-sm font-medium text-tBase-100 mb-2">
                    Expiration Date
                    <span class="text-tBase-400 text-xs">(Optional - if not selected, will use FIFO)</span>
                </label>
                <select id="expiration-date" v-model="formData.expirationDate"
                    class="bg-bgPrimary-0 border border-bgPrimary-200 text-tBase-100 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5">
                    <option value="">Use FIFO (First In, First Out)</option>
                    <option v-for="(exp, index) in selectedStockItemData.expirationDates" :key="index"
                        :value="exp.date">
                        {{ formatDate(exp.date) }} ({{ exp.qty }} units)
                    </option>
                </select>
            </div>

            <!-- Quantity -->
            <div>
                <label for="quantity" class="block text-sm font-medium text-tBase-100 mb-2">Quantity to Reject</label>
                <input id="quantity" v-model.number="formData.quantity" type="number" min="1"
                    :max="selectedStockItemData ? selectedStockItemData.quantity : 1" required
                    class="bg-bgPrimary-0 border border-bgPrimary-200 text-tBase-100 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5" />
                <p v-if="selectedStockItemData" class="mt-1 text-xs text-tBase-400">
                    Maximum: {{ selectedStockItemData.quantity }} units
                </p>
            </div>

            <!-- Reject Reason -->
            <div>
                <label for="reject-reason" class="block text-sm font-medium text-tBase-100 mb-2">Reject Reason</label>
                <select id="reject-reason" v-model="formData.rejectReason" required
                    class="bg-bgPrimary-0 border border-bgPrimary-200 text-tBase-100 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5">
                    <option value="">Select Reason</option>
                    <option value="expired">Expired</option>
                    <option value="damaged">Damaged</option>
                    <option value="quality_issue">Quality Issue</option>
                    <option value="recall">Product Recall</option>
                    <option value="other">Other</option>
                </select>
            </div>

            <!-- Additional Notes -->
            <div v-if="formData.rejectReason === 'other'">
                <label for="reason" class="block text-sm font-medium text-tBase-100 mb-2">
                    Additional Notes
                    <span class="text-tBase-400 text-xs">(Required for 'Other')</span>
                </label>
                <textarea id="reason" v-model="formData.reason" rows="3" required
                    placeholder="Please specify the reason for rejection"
                    class="bg-bgPrimary-0 border border-bgPrimary-200 text-tBase-100 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5"></textarea>
            </div>

            <!-- Submit button -->
            <div class="flex justify-end">
                <button type="submit"
                    class="text-white bg-red-500 hover:bg-red-600 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 focus:outline-none"
                    :disabled="loading || !isFormValid">
                    <Loader2 v-if="loading" class="w-4 h-4 mr-2 inline animate-spin" />
                    Reject Stock
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

const emit = defineEmits(['reject-stock']);

// State
const loading = ref(false);
const selectedStockItem = ref('');
const formData = ref({
    branchId: props.branchId,
    productId: '',
    varietyId: '',
    quantity: 1,
    expirationDate: '',
    rejectReason: '',
    reason: ''
});

// Computed properties
const selectedStockItemData = computed(() => {
    if (!selectedStockItem.value) return null;

    const [productId, varietyId] = selectedStockItem.value.split('|');
    return props.branchStock.find(item =>
        item.productId === productId && item.varietyId === varietyId
    );
});

const isFormValid = computed(() => {
    if (!selectedStockItem.value) return false;
    if (!formData.value.quantity || formData.value.quantity < 1) return false;
    if (!formData.value.rejectReason) return false;
    if (formData.value.rejectReason === 'other' && !formData.value.reason) return false;

    // Check if quantity is valid
    if (selectedStockItemData.value && formData.value.quantity > selectedStockItemData.value.quantity) {
        return false;
    }

    // Check if expiration date is valid
    if (formData.value.expirationDate) {
        const expirationDate = selectedStockItemData.value.expirationDates.find(
            exp => exp.date === formData.value.expirationDate
        );

        if (!expirationDate || formData.value.quantity > expirationDate.qty) {
            return false;
        }
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
        formData.value.expirationDate = '';
    } else {
        formData.value.productId = '';
        formData.value.varietyId = '';
    }
});

watch(() => props.branchId, (newBranchId) => {
    formData.value.branchId = newBranchId;
});

// Methods
const formatDate = (dateString) => {
    if (!dateString) return 'N/A';

    const date = new Date(dateString);
    return date.toLocaleDateString();
};

const handleSubmit = async () => {
    try {
        loading.value = true;

        // Validate form
        if (!isFormValid.value) {
            throw new Error('Please fill out all required fields correctly');
        }

        // Prepare data
        const rejectData = {
            ...formData.value,
            reason: formData.value.rejectReason === 'other'
                ? formData.value.reason
                : `Stock rejected due to: ${formData.value.rejectReason}`
        };

        // Submit form
        await emit('reject-stock', rejectData);

        // Reset form
        selectedStockItem.value = '';
        formData.value = {
            branchId: props.branchId,
            productId: '',
            varietyId: '',
            quantity: 1,
            expirationDate: '',
            rejectReason: '',
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