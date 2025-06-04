<!-- frontend\src\views\admin\inventory\RejectStock.vue -->
<template>
    <div class="reject-stock">
        <h2 class="text-xl font-semibold text-tBase-100 mb-6">Reject Stock</h2>

        <div class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
            <p class="font-bold">Important</p>
            <p>Rejected stock will be permanently removed from inventory. This action cannot be undone.</p>
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

            <!-- Quantity -->
            <div>
                <label for="quantity" class="block text-sm font-medium text-tBase-100 mb-2">Quantity to Reject</label>
                <input id="quantity" v-model.number="formData.quantity" type="number" min="1"
                    :max="selectedStockItemData ? selectedStockItemData.quantity : 1"
                    @input="clampRejectQuantity(selectedStockItemData)" required :disabled="!selectedStockItem"
                    class="bg-bgPrimary-0 border border-bgPrimary-200 text-tBase-100 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5" />
                <p v-if="selectedStockItemData" class="mt-1 text-xs text-tBase-400">
                    Maximum: {{ selectedStockItemData.quantity }} units
                </p>
            </div>







            <!-- Dropdown for selecting expiration date or FIFO -->
            <!-- <Listbox v-model="selectedDate">
                <div class="relative mt-2">
                    <ListboxButton class="relative w-full rounded border bg-white py-2 pl-3 pr-10 text-left shadow">
                        <span class="block truncate">
                            {{ selectedDate === 'FIFO' ? 'FIFO (Auto-select)' : selectedDate ? formatDate(selectedDate)
                                : 'Select Expiration Date' }}
                        </span>
                    </ListboxButton>
                    <ListboxOptions class="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded bg-white shadow">
                        <ListboxOption v-for="(exp, index) in availableExpirationDates" :key="index" :value="exp.date"
                            class="cursor-pointer select-none py-2 px-4 hover:bg-gray-100">
                            {{ formatDate(exp.date) }} ({{ exp.qty }} available)
                        </ListboxOption>

                        <ListboxOption :value="'FIFO'"
                            class="cursor-pointer select-none py-2 px-4 text-blue-500 hover:bg-blue-50">
                            FIFO (Auto-select from earliest stock)
                        </ListboxOption>
                    </ListboxOptions>
                </div>
            </Listbox> -->



            <!-- Info Label -->
            <!-- <p v-if="selectedDate === 'FIFO'" class="mt-2 text-sm italic text-gray-500">
                FIFO applied – earliest stock will be used automatically.
            </p> -->

            <!-- Selected expiration dates with quantity inputs -->
            <!-- <div v-if="formData.expirationDates.length > 0" class="space-y-2 mt-3">
                <div v-for="(exp, index) in formData.expirationDates" :key="index"
                    class="flex items-center space-x-3 p-2 bg-bgPrimary-50 rounded">
                    <input type="text" :value="formatDate(exp.date)" disabled
                        class="bg-bgPrimary-100 text-sm text-tBase-400 px-3 py-2 rounded w-[150px]" />

                    <input type="number" v-model.number="exp.qty" :disabled="isFIFO" min="1" :max="getMaxQty(exp.date)"
                        @input="enforceMaxQty(index)" @blur="checkQuantityMatch"
                        class="bg-white border text-sm rounded p-2 w-[120px]" />

                    <button type="button" @click="removeExpirationDate(index)" class="text-red-500 hover:text-red-700"
                        v-if="!isFIFO">
                        <Trash2 class="w-5 h-5" />
                    </button>
                </div>
            </div> -->




















            <!-- Dropdown to select expiration date -->
            <div class="mb-2" v-if="selectedStockItemData && selectedStockItemData.expirationDates?.length > 0">
                <label for="expiration-date" class="block text-sm font-medium text-tBase-100 mb-2">
                    Select Expiration Date
                    <span class="text-tBase-400 text-xs">(Required - used to match quantity per date)</span>
                </label>
                <select v-model="selectedExpirationOption" id="expiration-date"
                    class="bg-bgPrimary-0 border border-bgPrimary-200 text-tBase-100 text-sm rounded-lg block w-full p-2.5">
                    <option value="FiFo" selected>FIFO (First In, First Out)</option>
                    <option disabled value="">Select expiration date</option>
                    <option v-for="(exp, index) in availableExpirationOptions" :key="index" :value="exp">
                        {{ formatDate(exp.date) }} ({{ exp.qty }} available)
                    </option>
                </select>
                <button type="button" :disabled="!selectedExpirationOption" @click="addSelectedExpiration"
                    class="mt-2 text-white bg-primary-500 hover:bg-primary-600 px-3 py-1 rounded text-xs">
                    {{ selectedExpirationOption === "FiFo" ? 'Use FiFo' : 'Add Selected Date' }}
                </button>
            </div>

            <!-- Added expiration date + qty inputs -->
            <div v-if="formData.expirationDates.length > 0" class="space-y-2 mt-3">
                <div v-for="(exp, index) in formData.expirationDates" :key="index"
                    class="flex items-center space-x-3 p-2 bg-bgPrimary-50 rounded">
                    <input type="text" :value="formatDate(exp.date)" disabled
                        class="bg-bgPrimary-100 text-sm text-tBase-400 px-3 py-2 rounded w-[150px]" />
                    <input type="number" v-model.number="exp.qty" min="1" :max="getMaxQty(exp.date)"
                        @input="enforceMaxQty(index)" @blur="checkQuantityMatch"
                        class="bg-white border text-sm rounded p-2 w-[120px]" />
                    <button type="button" @click="removeExpirationDate(index)" class="text-red-500 hover:text-red-700">
                        <Trash2 class="w-5 h-5" />
                    </button>
                </div>
            </div>

            <!-- Validation feedback -->
            <div v-if="!isQuantityMatching" class="text-red-500 text-xs mt-2">
                Total quantity per expiration date does not match reject quantity ({{ formData.quantity }}).
            </div>


            <!-- Expiration Date selection -->
            <!-- <div v-if="selectedStockItemData && selectedStockItemData.expirationDates?.length > 0">
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
            </div> -->

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
                    <span class="text-red-500">*</span>
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
import { ref, computed, watch, onUnmounted } from 'vue';
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

const emit = defineEmits(['reject-stock']);

// Initialize inventory store
const inventoryStore = useInventoryStore();

//#region State
const loading = ref(false);
const selectedStockItem = ref('');
const formData = ref({
    branchId: props.branchId,
    productId: '',
    varietyId: '',
    quantity: 1,
    // expirationDate: '',
    expirationDates: [],
    rejectReason: '',
    reason: ''
});
//#endregion

//#region Computed Properties
const enhancedBranchStock = computed(() => {
    return inventoryStore.getProductBranchStock;
});

const selectedStockItemData = computed(() => {
    if (!selectedStockItem.value) return null;
    return props.branchStock.find(item => item.id === selectedStockItem.value);
});













const selectedExpirationOption = ref(null);

// const selectedStockItemData = ref({
//     expirationDates: [
//         // etc...
//     ]
// });

const availableExpirationOptions = computed(() => {
    const selectedDates = formData.value.expirationDates.map(e => e.date);
    return selectedStockItemData.value.expirationDates.filter(
        exp => !selectedDates.includes(exp.date)
    );
});

function debounce(fn, delay) {
    let timer;
    return function (...args) {
        clearTimeout(timer);
        timer = setTimeout(() => {
            fn.apply(this, args);
        }, delay);
    };
}

const clampRejectQuantity = debounce((value) => {

    console.log("clampRejectQuantity", value.quantity, formData.value.quantity);

    if (value.quantity < (Number(formData.value.quantity) || 0))
        if (formData.value.quantity === '' || formData.value.quantity === null || formData.value.quantity === undefined) return;
    formData.value.quantity = Math.max(0, value.quantity);
}, 300);

const getMaxQty = (date) => {
    const found = selectedStockItemData.value.expirationDates.find(e => e.date === date);
    return found ? found.qty : 9999; // fallback max value
};

const isFIFO = ref(false);

function applyFIFOExpirationDates(totalToReject, availableDates) {
    const sorted = [...availableDates].sort((a, b) => a.date - b.date);
    const result = [];
    let remaining = totalToReject;

    for (const item of sorted) {
        if (remaining <= 0) break;

        const useQty = Math.min(item.qty, remaining);
        if (useQty > 0) {
            result.push({ date: item.date, qty: useQty });
            remaining -= useQty;
        }
    }

    if (remaining > 0) {
        // Not enough stock to fulfill FIFO rejection
        throw new Error(`Insufficient total stock to reject ${totalToReject}`);
    }

    return result;
}

function applyFIFOAutoFill() {
    try {
        const fifo = applyFIFOExpirationDates(
            Number(formData.value.quantity),
            selectedStockItemData.value.expirationDates // ← your source list
        );
        formData.value.expirationDates = fifo;
    } catch (err) {
        alert(err.message);
        formData.value.expirationDates = [];
    }
}

const addSelectedExpiration = () => {
    if (!selectedExpirationOption.value) return;

    if (selectedExpirationOption.value === "FiFo") {
        console.log("is fifo used", selectedExpirationOption.value);
        isFIFO.value = true;
        applyFIFOAutoFill();
        selectedExpirationOption.value = null;
        // formData.value.expirationDates = applyFIFOExpirationDates(formData.value.quantity, availableExpirationOptions.value);
        // console.log("FIFO applied", formData.value.expirationDates);
        return;
    }

    console.log("button clicked", selectedExpirationOption.value.date);

    formData.value.expirationDates.push({
        date: selectedExpirationOption.value.date,
        qty: 0
    });

    selectedExpirationOption.value = null;
};

const removeExpirationDate = (index) => {
    formData.value.expirationDates.splice(index, 1);
};

// const isQuantityMatching = ref(false);

// const enforceMaxQty = (index) => {
//     // const exp = formData.value.expirationDates[index];
//     // const max = getMaxQty(exp.date);

//     // if (exp.qty > max) {
//     //     exp.qty = max;
//     // } else if (exp.qty < 1) {
//     //     exp.qty = 1;
//     // }


//     const exp = formData.value.expirationDates[index];
//     const max = getMaxQty(exp.date);

//     // Allow empty input while typing
//     if (exp.qty === null || exp.qty === undefined || exp.qty === '') return;

//     // Clamp only if value is valid
//     if (exp.qty > max) {
//         exp.qty = max;
//     } else if (exp.qty < 1) {
//         exp.qty = 1;
//     }
//     //checkQuantityMatch(); // still validate total qty
// };


const enforceMaxQty = (index) => {
    // const exp = formData.value.expirationDates[index];
    // const max = getMaxQty(exp.date);

    // if (exp.qty > max) {
    //     exp.qty = max;
    // } else if (exp.qty < 1) {
    //     exp.qty = 1;
    // }


    const exp = formData.value.expirationDates[index];
    const maxPerDate = getMaxQty(exp.date);

    const totalAllowed = Number(formData.value.quantity) || 0;

    if (exp.qty === '' || exp.qty === null || exp.qty === undefined) return;

    // Calculate already used qty (excluding current input)
    const totalSoFar = formData.value.expirationDates.reduce((sum, e, i) => {
        return sum + (i === index ? 0 : Number(e.qty) || 0);
    }, 0);

    const maxForThisInput = Math.min(maxPerDate, totalAllowed - totalSoFar);

    // ✅ Don't force min 1. Allow 0 if no quantity left.
    exp.qty = Math.max(0, Math.min(exp.qty, maxForThisInput));
    //checkQuantityMatch(); // still validate total qty

};

const isQuantityMatching = computed(() => {
    return checkQuantityMatch();
});

const checkQuantityMatch = () => {
    const total = formData.value.expirationDates.reduce((sum, e) => sum + (e.qty || 0), 0);
    const isMatch = total === formData.value.quantity;

    // isQuantityMatching.value = isMatch;
    return isMatch;
};




// function applyFIFOExpirationDates(totalToReject, availableDates) {
//     const sorted = [...availableDates].sort((a, b) => a.date - b.date);
//     const result = [];
//     let remaining = totalToReject;

//     for (const item of sorted) {
//         if (remaining <= 0) break;

//         const useQty = Math.min(item.qty, remaining);
//         if (useQty > 0) {
//             result.push({ date: item.date, qty: useQty });
//             remaining -= useQty;
//         }
//     }

//     if (remaining > 0) {
//         // Not enough stock to fulfill FIFO rejection
//         throw new Error(`Insufficient total stock to reject ${totalToReject}`);
//     }

//     return result;
// }


// const selectedDate = ref(null);



// // Watcher to handle FIFO or manual selection
// watch(selectedDate, (val) => {
//     if (val === 'FIFO') {
//         // Clear previous manual entries
//         formData.value.expirationDates = [];

//         try {
//             formData.value.expirationDates = applyFIFOExpirationDates(
//                 formData.value.rejectedQty,
//                 availableExpirationDates.value
//             );
//         } catch (err) {
//             alert(err.message);
//         }
//     } else if (val) {
//         const already = formData.value.expirationDates.find((e) => e.date === val);
//         if (!already) {
//             formData.value.expirationDates.push({ date: val, qty: 1 });
//         }
//     }

//     selectedDate.value = null; // reset dropdown
// });








const isFormValid = computed(() => {
    if (!selectedStockItem.value) return false;
    if (!formData.value.quantity || formData.value.quantity < 1) return false;
    if (!formData.value.rejectReason) return false;
    if (formData.value.rejectReason === 'other' && !formData.value.reason) return false;

    // Check if quantity is valid
    if (selectedStockItemData.value && formData.value.quantity > selectedStockItemData.value.quantity) {
        return false;
    }

    // // Check if expiration date is valid
    // if (formData.value.expirationDate && selectedStockItemData.value?.expirationDates) {
    //     const expirationDate = selectedStockItemData.value.expirationDates.find(
    //         exp => exp.date === formData.value.expirationDate
    //     );

    //     if (!expirationDate || formData.value.quantity > expirationDate.qty) {
    //         return false;
    //     }
    // }

    if (!checkQuantityMatch()) return false;

    return true;
});
//#endregion

//#region Watchers
watch(selectedStockItem, (newValue) => {
    if (newValue) {
        const stockItem = props.branchStock.find(item => item.id === newValue);
        if (stockItem) {
            formData.value.productId = stockItem.productId;
            formData.value.varietyId = stockItem.varietyId;
            formData.value.quantity = 1;
            formData.value.expirationDate = '';
        }
    } else {
        formData.value.productId = '';
        formData.value.varietyId = '';
        formData.value.quantity = 1;
        formData.value.expirationDate = '';
    }
});

watch(() => props.branchId, (newBranchId) => {
    formData.value.branchId = newBranchId;
});
//#endregion

//#region Methods
const formatDate = (dateValue) => {

    // console.log('formatDate', dateValue);
    if (!dateValue) return 'N/A';

    // Handle different date formats
    let date;
    if (typeof dateValue === 'number') {
        // Unix timestamp in seconds
        date = new Date(dateValue * 1000);
    } else {
        date = new Date(dateValue);
    }

    // Check if date is valid
    if (isNaN(date.getTime())) return 'Invalid Date';

    return date.toLocaleDateString();
};

const handleSubmit = async () => {
    try {
        loading.value = true;

        // Validate form
        if (!isFormValid.value) {
            throw new Error('Please fill out all fields correctly');
        }

        console.log('Form data before submission:', formData.value);
        // return;

        // Prepare data
        const rejectData = {
            ...formData.value,
            reason: formData.value.rejectReason === 'other'
                ? formData.value.reason
                : `Stock rejected due to: ${formData.value.rejectReason}`
        };

        // Submit form
        await emit('reject-stock', rejectData);

        // // Reset form
        // selectedStockItem.value = '';
        // formData.value = {
        //     branchId: props.branchId,
        //     productId: '',
        //     varietyId: '',
        //     quantity: 1,
        //     expirationDate: '',
        //     rejectReason: '',
        //     reason: ''
        // };
    } catch (error) {
        console.error('Error submitting form:', error);
        // Error is handled by parent component

        inventoryStore.setError(error.message);
    } finally {
        loading.value = false;
    }
};


onUnmounted(() => {
    inventoryStore.clearMessages();
});
//#endregion
</script>