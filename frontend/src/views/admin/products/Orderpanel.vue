<!-- frontend\src\views\admin\products\Products.vue -->
<template>
    <div class="flex flex-col md:flex-row space-x-4 w-full min-h-screen">


        <!-- Branch Selector -->
        <BranchSelector :branches="catalogStore.branches" v-model="selectedBranchId" />

        <div class="space-y-6">

            <div class="mb-2">
                <label class="block font-medium">Customer Name</label>
                <input v-model="customerName" type="text" class="input input-bordered w-full" />{{ customerName }}
            </div>

            <div class="mb-2">
                <label class="block font-medium">Remarks</label>
                <textarea v-model="remarks" class="textarea textarea-bordered w-full">{{ remarks }}</textarea>
            </div>

            <!-- Product selection with improved readability -->
            <div>
                <label for="product" class="block text-sm font-medium text-tBase-100 mb-2">Products</label>
                <select id="product" v-model="selectedProduct" required
                    class="bg-bgPrimary-0 border border-bgPrimary-200 text-tBase-100 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5">
                    <option value="">Select Product</option>
                    <option v-for="product in catalogStore.filteredProducts" :key="product.id" :value="product">
                        {{ product.name }}
                    </option>
                </select>
            </div>

            <!-- Variety selection -->
            <div v-if="selectedProduct && selectedProduct.varieties.length > 0" class="mb-4">
                <label for="variety" class="block text-sm font-medium text-tBase-100 mb-2">Choose Variety</label>
                <select id="variety" v-model="selectedVariety" required
                    class="bg-bgPrimary-0 border border-bgPrimary-200 text-tBase-100 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5">
                    <option value="">Select Variety</option>
                    <option v-for="variety in selectedProduct.varieties" :key="variety.id" :value="variety">
                        {{ variety.id }} - {{ variety.name }}
                    </option>
                </select>
            </div>

            <!-- Quantity -->
            <div>
                <label for="quantity" class="block text-sm font-medium text-tBase-100 mb-2">Quantity</label>
                <input id="quantity" v-model.number="selectedItemQuantity" type="number" min="1" required
                    class="bg-bgPrimary-0 border border-bgPrimary-200 text-tBase-100 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5" />
            </div>

            <!-- Submit button -->
            <div class="flex justify-end">
                <button @click.prevent="addOrder"
                    class="text-white bg-primary-500 hover:bg-primary-600 focus:ring-4 focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 focus:outline-none"
                    :disabled="loading">
                    <Loader2 v-if="loading" class="w-4 h-4 mr-2 inline animate-spin" />
                    Add to Order
                </button>
            </div>
        </div>


        <!-- Order Summary List -->
        <div v-if="orderItems.length" class="mt-6">
            <h3 class="text-lg font-semibold text-tBase-100 mb-4">Order Items</h3>

            <div class="space-y-4">
                <div v-for="(item, index) in orderItems" :key="index"
                    class="flex items-center justify-between bg-bgPrimary-50 p-4 rounded-lg shadow-sm border border-bgPrimary-200">
                    <div class="flex flex-col text-sm text-tBase-100">
                        <span class="font-medium">{{ item.product.name }}</span>
                        <span class="text-xs">{{ item.variety.name }} (Stock: {{ item.variety.stockQuantity }})</span>
                    </div>

                    <div class="flex items-center gap-2">
                        <input type="number" min="1" :max="item.variety.stockQuantity" v-model.number="item.quantity"
                            @change="updateQuantity(index, item.quantity)"
                            class="w-20 px-2 py-1 border border-bgPrimary-200 rounded-md text-sm" />

                        <button @click="removeItem(index)"
                            class="text-red-600 hover:text-red-800 text-sm font-medium">Remove</button>
                    </div>
                </div>
            </div>
        </div>


        <div class="mt-4 font-semibold">
            Total: ₱{{ totalPrice }}
        </div>

        <button @click="saveOrder" class="btn btn-primary mt-4">
            Submit Order
        </button>
    </div>
</template>

<script setup>
import router from '@/router';
import { ref, computed, onMounted, onUnmounted, watch } from "vue";

import BranchSelector from "@/components/catalog/BranchSelector.vue"

// import { useInventoryStore } from '@/stores/inventoryStore';
import { useCatalogStore } from "@/stores/catalogStore"
import { useCartStore } from "@/stores/cartStore"
const catalogStore = useCatalogStore()
const cartStore = useCartStore()

// import { initDropdowns, initCarousels, Dropdown } from 'flowbite';
import { Loader2, Info, Filter, Plus, SquarePlus, ShoppingBasket, Image } from 'lucide-vue-next';


const orders = ref([]);


// Local state
const loading = ref(true)
const selectedBranchId = ref(null)


const selectedProduct = ref();
const selectedVariety = ref();
const selectedItemQuantity = ref(0);
const customerName = ref('');
const remarks = ref('');


const formData = ref({
    branchId: selectedBranchId.value || '',
    customerId: '00008',
    items: [],
    discount: 0,
    paymentMethod: 'cash',
    paymentStatus: 'pending',
    productId: selectedProduct.value?.id || '',
    product: selectedProduct.value || {},
    varietyId: selectedVariety.value?.id || '',
    variety: selectedVariety.value || {},
    quantity: selectedItemQuantity.value,
});
// const formData = ref({
//     branchId: props.branchId || '',
//     productId: '',
//     varietyId: '',
//     quantity: 1,
//     // expirationDates: [],
//     // reason: ''

// });

// const addOrder = () => {
//     // Validate form data
//     if (!selectedProduct.value || !selectedVariety.value || selectedItemQuantity.value <= 0) {
//         alert("Please fill in all required fields.")
//         return
//     }

//     // Prepare the order data
//     const orderData = {
//         branchId: selectedBranchId.value,
//         customerId: '00008',
//         items: [
//             {
//                 productId: selectedProduct.value.id,
//                 product: selectedProduct.value,
//                 variety: selectedVariety.value,
//                 varietyId: selectedVariety.value.id,
//                 quantity: selectedItemQuantity.value,
//             },
//         ],
//         discount: 0,
//         paymentMethod: 'cash',
//         paymentStatus: 'pending',
//     }

//     console.log("Order Data:", orderData);

//     // Add the order to the cart store
//     // cartStore.addOrder(orderData)

//     // // Reset form data
//     // selectedProduct.value = null
//     // selectedVariety.value = null
//     // selectedItemQuantity.value = 0

//     // // Optionally, navigate to another page or show a success message
//     // router.push('/administrator/products')
// }


// Orders list
const orderItems = ref([])

const addOrder = () => {
    if (!selectedProduct.value || !selectedVariety.value || selectedItemQuantity.value <= 0) {
        alert("Please fill in all required fields.")
        return
    }

    const stockAvailable = selectedVariety.value.stockQuantity || 0
    if (selectedItemQuantity.value > stockAvailable) {
        alert(`Only ${stockAvailable} in stock.`)
        return
    }

    const existingItemIndex = orderItems.value.findIndex(
        item => item.varietyId === selectedVariety.value.id
    )

    if (existingItemIndex !== -1) {
        orderItems.value[existingItemIndex].quantity += selectedItemQuantity.value
    } else {
        orderItems.value.push({
            productId: selectedProduct.value.id,
            product: selectedProduct.value,
            variety: selectedVariety.value,
            varietyId: selectedVariety.value.id,
            quantity: selectedItemQuantity.value,
        })
    }

    // Reset selection
    selectedProduct.value = null
    selectedVariety.value = null
    selectedItemQuantity.value = 0
}

const removeItem = (index) => {
    orderItems.value.splice(index, 1)
}

const updateQuantity = (index, quantity) => {
    const maxStock = orderItems.value[index].variety.stockQuantity
    if (quantity > maxStock) {
        alert(`Maximum available stock is ${maxStock}`)
        return
    }
    orderItems.value[index].quantity = quantity
}

// Computed total price
const totalPrice = computed(() =>
    orderItems.value.reduce((total, item) => {
        const price = item.price || 0;
        const quantity = item.quantity || 0;
        return total + price * quantity;
    }, 0)
);

const saveOrder = async () => {
    try {
        await orderStore.saveAdminOrder({
            orderItems: orderItems.value,
            customerName: customerName.value,
            paymentType: paymentType.value,
            remarks: remarks.value,
            selectedBranchId: selectedBranchId.value
        });
        toast.success("Order saved successfully!");
        // Optional: reset form
    } catch (err) {
        toast.error("Failed to save order: " + err.message);
    }
};

// Watch for branch changes
watch(selectedBranchId, (newBranchId) => {
    if (newBranchId) {
        catalogStore.setBranch(newBranchId)
    }
})

// Watch for filtered products changes
watch(
    () => catalogStore.filteredProducts,
    (newProducts) => {
        console.log("Filtered Products Updated:", newProducts)
    },
)

// Lifecycle hooks
onMounted(async () => {
    await catalogStore.initialize()
    selectedBranchId.value = catalogStore.selectedBranchId
    loading.value = false
})

onUnmounted(() => {
    catalogStore.cleanup()
})


</script>