<!-- frontend\src\views\admin\inventory\TransferStock.vue -->
<template>
    <div class="transfer-stock">
        <h2 class="text-xl font-semibold text-tBase-100 mb-6">Transfer Stock Between Branches</h2>

        <div class="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-6" role="alert">
            <p class="font-bold">Important</p>
            <p>Stock transfers will move inventory from one branch to another. Make sure both branches are prepared for
                this operation.</p>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-6">
            <!-- Source Branch -->
            <div>
                <label for="source-branch" class="block text-sm font-medium text-tBase-100 mb-2">Source Branch</label>
                <select id="source-branch" v-model="formData.sourceBranchId" required
                    class="bg-bgPrimary-0 border border-bgPrimary-200 text-tBase-100 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5">
                    <option value="">Select Source Branch</option>
                    <option v-for="branch in branches" :key="branch.id" :value="branch.id">
                        {{ branch.name }}
                    </option>
                </select>
            </div>

            <!-- Destination Branch -->
            <div>
                <label for="dest-branch" class="block text-sm font-medium text-tBase-100 mb-2">Destination
                    Branch</label>
                <select id="dest-branch" v-model="formData.destBranchId" required
                    class="bg-bgPrimary-0 border border-bgPrimary-200 text-tBase-100 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5"
                    :disabled="!formData.sourceBranchId">
                    <option value="">Select Destination Branch</option>
                    <option v-for="branch in availableDestinationBranches" :key="branch.id" :value="branch.id">
                        {{ branch.name }}
                    </option>
                </select>
                <p v-if="!availableDestinationBranches.length && formData.sourceBranchId"
                    class="mt-1 text-xs text-red-500">
                    No other branches available for transfer
                </p>
            </div>

            <!-- Product selection with improved readability -->
            <div>
                <label for="product" class="block text-sm font-medium text-tBase-100 mb-2">Product</label>
                <select id="product" v-model="selectedStockItem" required
                    class="bg-bgPrimary-0 border border-bgPrimary-200 text-tBase-100 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5"
                    :disabled="!formData.sourceBranchId || !formData.destBranchId">
                    <option value="">Select Product</option>
                    <option v-for="item in enhancedSourceStockItems" :key="item.id" :value="item.id">
                        {{ item.displayName }} ({{ item.quantity }} in stock)
                    </option>
                </select>
            </div>

            <!-- Quantity -->
            <div>
                <label for="quantity" class="block text-sm font-medium text-tBase-100 mb-2">Quantity to Transfer</label>
                <input id="quantity" v-model.number="formData.quantity" type="number" min="1"
                    :max="selectedStockItemData ? selectedStockItemData.quantity : 1"
                    @input="clampRejectQuantity(selectedStockItemData)" required
                    class="bg-bgPrimary-0 border border-bgPrimary-200 text-tBase-100 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5"
                    :disabled="!selectedStockItem" />
                <p v-if="selectedStockItemData" class="mt-1 text-xs text-tBase-400">
                    Maximum: {{ selectedStockItemData.quantity }} units
                </p>
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
                Total quantity per expiration date does not match transfer quantity ({{ formData.quantity }}).
            </div>





            <!-- Reason -->
            <div>
                <label for="reason" class="block text-sm font-medium text-tBase-100 mb-2">
                    Reason for Transfer
                    <span class="text-tBase-400 text-xs">(Optional)</span>
                </label>
                <textarea id="reason" v-model="formData.reason" rows="3"
                    placeholder="Reason for transferring stock (e.g., rebalancing inventory, fulfilling branch needs)"
                    class="bg-bgPrimary-0 border border-bgPrimary-200 text-tBase-100 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5"></textarea>
            </div>

            <!-- Submit button -->
            <div class="flex justify-end">
                <button type="submit"
                    class="text-white bg-primary-500 hover:bg-primary-600 focus:ring-4 focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 focus:outline-none"
                    :disabled="loading || !isFormValid">
                    <Loader2 v-if="loading" class="w-4 h-4 mr-2 inline animate-spin" />
                    Transfer Stock
                </button>
            </div>
        </form>
    </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useInventoryStore } from '@/stores/inventoryStore';
import { Loader2, Trash2 } from 'lucide-vue-next';

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

//#region State
const loading = ref(false);
const selectedStockItem = ref('');
const sourceStockItems = ref([]);
const formData = ref({
    sourceBranchId: props.branchId || '',
    destBranchId: '',
    productId: '',
    varietyId: '',
    quantity: 1,
    expirationDates: [],
    reason: ''
});
//#endregion

//#region Computed Properties
const availableDestinationBranches = computed(() => {
    if (!formData.value.sourceBranchId) return [];
    return props.branches.filter(branch => branch.id !== formData.value.sourceBranchId);
});

const getSourceStockItems = () => {

    // console.log('stock items', sourceStockItems.value);

    // console.log('check if right nesting', sourceStockItems.value[0]);


    const stocks = sourceStockItems.value.map(item => {
        const product = item.product;
        const variety = item.variety;

        return {
            ...item,
            productName: product ? product.name : 'Unknown Product',
            varietyName: variety ? variety.name : 'Unknown Variety',
            displayName: `${product ? product.name : 'Unknown Product'} - ${variety ? variety.name : 'Default'}`,
            stock: item.quantity,
            expirationDates: item.expirationDates || [],
        };
    });


    console.log('stocks', stocks);

    return stocks;

};

const enhancedSourceStockItems = computed(() => {
    return getSourceStockItems();
});


// watch(enhancedSourceStockItems, (newValue) => {
//     console.log('changes:', newValue);
// });

const selectedStockItemData = computed(() => {
    if (!selectedStockItem.value) return null;
    return sourceStockItems.value.find(item => item.id === selectedStockItem.value);
});











const selectedExpirationOption = ref(null);

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

    if (value.quantity < (Number(formData.value.quantity) || 0)) {
        if (formData.value.quantity === '' || formData.value.quantity === null || formData.value.quantity === undefined) return;
        formData.value.quantity = Math.max(0, value.quantity);
    }
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

const enforceMaxQty = debounce((index) => {
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

}, 300);

const isQuantityMatching = computed(() => {
    return checkQuantityMatch();
});

const checkQuantityMatch = () => {
    const total = formData.value.expirationDates.reduce((sum, e) => sum + (e.qty || 0), 0);
    const isMatch = total === formData.value.quantity;

    // isQuantityMatching.value = isMatch;
    return isMatch;
};









const isFormValid = computed(() => {
    if (!formData.value.sourceBranchId) return false;
    if (!formData.value.destBranchId) return false;
    if (!selectedStockItem.value) return false;
    if (!formData.value.quantity || formData.value.quantity < 1) return false;

    // Check if quantity is valid
    if (selectedStockItemData.value && formData.value.quantity > selectedStockItemData.value.quantity)
        return false;

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
        const stockItem = sourceStockItems.value.find(item => item.id === newValue);
        if (stockItem) {
            formData.value.productId = stockItem.productId;
            formData.value.varietyId = stockItem.varietyId;
            formData.value.quantity = 1;
            formData.value.expirationDates = [];
        }
    } else {
        formData.value.productId = '';
        formData.value.varietyId = '';
        formData.value.quantity = 1;
        formData.value.expirationDates = [];
    }
});

watch(() => props.branchId, (newBranchId) => {
    if (newBranchId) {
        formData.value.sourceBranchId = newBranchId;

        sourceStockItems.value = props.branchStock;

        console.log('Branch ID changed in the main branch selection sourceSelectionItems:', sourceStockItems.value);

        // sourceStockItems.value = props.branchStock.map(item => {
        //     const product = item.product;
        //     const variety = item.variety;

        //     return {
        //         ...item,
        //         productName: product ? product.name : 'Unknown Product',
        //         varietyName: variety ? variety.name : 'Unknown Variety',
        //         displayName: `${product ? product.name : 'Unknown Product'} - ${variety ? variety.name : 'Default'}`,
        //         stock: item.quantity,
        //         expirationDates: item.expirationDates || [],
        //     };
        // });
    }
});

watch(() => formData.value.sourceBranchId, async (newSourceBranchId) => {
    if (newSourceBranchId) {
        // Reset selection
        selectedStockItem.value = '';
        formData.value.productId = '';
        formData.value.varietyId = '';
        formData.value.quantity = 1;
        formData.value.expirationDates = [];

        // Fetch stock for source branch
        try {
            loading.value = true;

            // If the source branch is the current branch, use the existing stock data
            // if (newSourceBranchId === props.branchId) {
            //     sourceStockItems.value = props.branchStock;
            // } else {
            //     // Otherwise fetch the stock data for the selected branch
            //     await inventoryStore.setupBranchStockListener(newSourceBranchId);
            //     sourceStockItems.value = inventoryStore.getEnhancedBranchStock;

            //     console.log('Fetched source branch stock:', sourceStockItems.value);


            //     console.log('Getting source branch stock', getSourceStockItems());
            // }

            if (newSourceBranchId !== props.branchId) {
                // sourceStockItems.value = props.branchStock;
                // Otherwise fetch the stock data for the selected branch
                await inventoryStore.setupBranchStockListener(newSourceBranchId);


                sourceStockItems.value = inventoryStore.getEnhancedBranchStock;

                console.log('sourceStockItems after branch chagned in the transfer stock source branch selection:', sourceStockItems.value);
                // console.log('Getting source branch stock', getSourceStockItems());
            }
        } catch (error) {
            console.error('Error fetching source branch stock:', error);
            inventoryStore.setError(error.message);
        } finally {
            loading.value = false;
        }
    } else {
        sourceStockItems.value = [];
    }
});
//#endregion

//#region Methods
const formatDate = (dateValue) => {
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
            throw new Error('Please fill out all required fields correctly');
        }

        console.log('Form data before submission:', formData.value);

        // return;

        // Submit form
        const result = await inventoryStore.transferStock(formData.value);

        if (result.success) {
            // // Reset form
            // selectedStockItem.value = '';
            // formData.value = {
            //     sourceBranchId: props.branchId || '',
            //     destBranchId: '',
            //     productId: '',
            //     varietyId: '',
            //     quantity: 1,
            //     expirationDates: [],
            //     reason: ''
            // };

            // Refresh source branch stock
            if (formData.value.sourceBranchId) {
                await inventoryStore.setupBranchStockListener(formData.value.sourceBranchId);
                sourceStockItems.value = inventoryStore.getEnhancedBranchStock;
            }

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

onMounted(async () => {
    // Fetch initial stock for the selected branch
    if (props.branchId) {
        // inventoryStore.setupBranchStockListener(formData.value.sourceBranchId);
        sourceStockItems.value = props.branchStock;
    }

    console.log(sourceStockItems.value, 'sourceStockItems in the transfer stock component');
});
//#endregion
</script>