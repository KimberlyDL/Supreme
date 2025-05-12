<template>
    <div class="p-4">
      <div v-if="loading" class="flex justify-center items-center h-64">
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
      <div v-else-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {{ error }}
      </div>
      <div v-else-if="order" class="bg-white rounded-lg shadow-md p-6">
        <!-- Order Header -->
        <div class="flex justify-between items-center mb-6">
          <div>
            <h1 class="text-2xl font-bold">Order #{{ order.orderNumber }}</h1>
            <p class="text-gray-600">
              {{ formatDate(order.createdAt) }}
            </p>
          </div>
          <div class="flex items-center">
            <span
              :class="{
                'bg-yellow-100 text-yellow-800': order.status === 'Pending',
                'bg-green-100 text-green-800': order.status === 'Completed',
                'bg-red-100 text-red-800': order.status === 'Voided',
                'bg-blue-100 text-blue-800': order.status === 'Returned',
              }"
              class="px-3 py-1 rounded-full text-sm font-medium"
            >
              {{ order.status }}
            </span>
          </div>
        </div>
  
        <!-- Customer Info -->
        <div class="mb-6 p-4 bg-gray-50 rounded-lg">
          <h2 class="text-lg font-semibold mb-2">Customer Information</h2>
          <p><span class="font-medium">Name:</span> {{ order.client }}</p>
          <p><span class="font-medium">Payment Method:</span> {{ order.paymentType }}</p>
          <p v-if="order.notes"><span class="font-medium">Notes:</span> {{ order.notes }}</p>
        </div>
  
        <!-- Order Items -->
        <div class="mb-6">
          <h2 class="text-lg font-semibold mb-4">Order Items</h2>
          <div class="overflow-x-auto">
            <table class="min-w-full bg-white">
              <thead class="bg-gray-100">
                <tr>
                  <th class="py-2 px-4 text-left">Product</th>
                  <th class="py-2 px-4 text-left">Variety</th>
                  <th class="py-2 px-4 text-right">Unit Price</th>
                  <th class="py-2 px-4 text-right">Quantity</th>
                  <th class="py-2 px-4 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in order.items" :key="index" class="border-b">
                  <td class="py-2 px-4">{{ item.product }}</td>
                  <td class="py-2 px-4">{{ item.varietyName }}</td>
                  <td class="py-2 px-4 text-right">
                    {{ formatCurrency(item.unitPrice) }}
                    <span v-if="item.onSale" class="text-xs text-green-600 ml-1">(Sale)</span>
                  </td>
                  <td class="py-2 px-4 text-right">{{ item.quantity }} {{ item.unit }}</td>
                  <td class="py-2 px-4 text-right">{{ formatCurrency(item.totalPrice) }}</td>
                </tr>
              </tbody>
              <tfoot class="bg-gray-50">
                <tr>
                  <td colspan="4" class="py-2 px-4 text-right font-medium">Subtotal:</td>
                  <td class="py-2 px-4 text-right">{{ formatCurrency(calculateSubtotal()) }}</td>
                </tr>
                <tr v-if="order.discounts">
                  <td colspan="4" class="py-2 px-4 text-right font-medium">Discounts:</td>
                  <td class="py-2 px-4 text-right text-red-600">-{{ formatCurrency(order.discounts) }}</td>
                </tr>
                <tr class="font-bold">
                  <td colspan="4" class="py-2 px-4 text-right">Total:</td>
                  <td class="py-2 px-4 text-right">{{ formatCurrency(order.totalPrice) }}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
  
        <!-- Expiration Dates (for completed orders) -->
        <div v-if="(order.status === 'Completed' || order.status === 'Returned' ) && order.itemExpirationDates" class="mb-6">
          <h2 class="text-lg font-semibold mb-4">Expiration Dates Used</h2>
          <div class="overflow-x-auto">
            <table class="min-w-full bg-white">
              <thead class="bg-gray-100">
                <tr>
                  <th class="py-2 px-4 text-left">Product</th>
                  <th class="py-2 px-4 text-left">Variety</th>
                  <th class="py-2 px-4 text-left">Expiration Date</th>
                  <th class="py-2 px-4 text-right">Quantity</th>
                </tr>
              </thead>
              <tbody>
                <template v-for="(item, itemIndex) in order.items" :key="itemIndex">
                  <tr 
                    v-for="(expDate, expIndex) in getItemExpirationDates(item)" 
                    :key="`${itemIndex}-${expIndex}`"
                    class="border-b"
                  >
                    <td class="py-2 px-4" v-if="expIndex === 0" :rowspan="getItemExpirationDates(item).length || 1">
                      {{ item.product }}
                    </td>
                    <td class="py-2 px-4" v-if="expIndex === 0" :rowspan="getItemExpirationDates(item).length || 1">
                      {{ item.varietyName }}
                    </td>
                    <td class="py-2 px-4">
                      {{ formatExpirationDate(expDate.date) }}
                    </td>
                    <td class="py-2 px-4 text-right">
                      {{ expDate.qty }} {{ item.unit }}
                    </td>
                  </tr>
                  <!-- If no expiration dates, show a single row -->
                  <tr v-if="!getItemExpirationDates(item) || getItemExpirationDates(item).length === 0" class="border-b">
                    <td class="py-2 px-4">{{ item.product }}</td>
                    <td class="py-2 px-4">{{ item.varietyName }}</td>
                    <td class="py-2 px-4 text-gray-500">No expiration date</td>
                    <td class="py-2 px-4 text-right">{{ item.quantity }} {{ item.unit }}</td>
                  </tr>
                </template>
              </tbody>
            </table>
          </div>
        </div>
  
        <!-- Return Reason (for returned orders) -->
        <div v-if="order.status === 'Returned' && order.returnReason" class="mb-6 p-4 bg-blue-50 rounded-lg">
          <h2 class="text-lg font-semibold mb-2">Return Information</h2>
          <p><span class="font-medium">Return Date:</span> {{ formatDate(order.returnedAt) }}</p>
          <p><span class="font-medium">Return Reason:</span> {{ order.returnReason }}</p>
        </div>
  
        <!-- Order Timeline -->
        <div class="mb-6">
          <h2 class="text-lg font-semibold mb-4">Order Timeline</h2>
          <div class="relative pl-8 border-l-2 border-gray-200">
            <div class="mb-4 relative">
              <div class="absolute -left-10 mt-1.5 w-4 h-4 rounded-full bg-blue-500"></div>
              <p class="font-medium">Created</p>
              <p class="text-sm text-gray-600">{{ formatDate(order.createdAt) }}</p>
            </div>
            <div v-if="order.updatedAt && order.updatedAt !== order.createdAt" class="mb-4 relative">
              <div class="absolute -left-10 mt-1.5 w-4 h-4 rounded-full bg-yellow-500"></div>
              <p class="font-medium">Updated</p>
              <p class="text-sm text-gray-600">{{ formatDate(order.updatedAt) }}</p>
            </div>
            <div v-if="order.completedAt" class="mb-4 relative">
              <div class="absolute -left-10 mt-1.5 w-4 h-4 rounded-full bg-green-500"></div>
              <p class="font-medium">Completed</p>
              <p class="text-sm text-gray-600">{{ formatDate(order.completedAt) }}</p>
            </div>
            <div v-if="order.voidedAt" class="mb-4 relative">
              <div class="absolute -left-10 mt-1.5 w-4 h-4 rounded-full bg-red-500"></div>
              <p class="font-medium">Voided</p>
              <p class="text-sm text-gray-600">{{ formatDate(order.voidedAt) }}</p>
            </div>
            <div v-if="order.returnedAt" class="mb-4 relative">
              <div class="absolute -left-10 mt-1.5 w-4 h-4 rounded-full bg-blue-500"></div>
              <p class="font-medium">Returned</p>
              <p class="text-sm text-gray-600">{{ formatDate(order.returnedAt) }}</p>
            </div>
          </div>
        </div>
  
        <!-- Action Buttons -->
        <div class="flex justify-end space-x-4">
          <button
            v-if="order.status === 'Pending'"
            @click="approveOrder"
            class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Approve Order
          </button>
          <button
            v-if="order.status === 'Pending'"
            @click="voidOrder"
            class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Void Order
          </button>
          <button
            v-if="order.status === 'Completed'"
            @click="returnOrder"
            class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Return Order
          </button>
          <button @click="goBack" class="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300">
            Back
          </button>
        </div>
      </div>
      <div v-else class="text-center py-8">
        <p>Order not found</p>
      </div>
  
      <!-- Return Order Modal -->
      <div v-if="showReturnModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg p-6 w-full max-w-md">
          <h2 class="text-xl font-bold mb-4">Return Order</h2>
          <div class="mb-4">
            <label class="block text-gray-700 mb-2">Return Reason</label>
            <textarea
              v-model="returnReason"
              class="w-full px-3 py-2 border rounded"
              rows="4"
              placeholder="Enter reason for return..."
            ></textarea>
          </div>
          <div class="flex justify-end space-x-3">
            <button
              @click="showReturnModal = false"
              class="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              @click="confirmReturn"
              class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              :disabled="!returnReason.trim()"
            >
              Confirm Return
            </button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from "vue"
  import { useRoute, useRouter } from "vue-router"
  import { useOrderStore } from "@/stores/orderStore"
  import { formatOrderDate } from '@/utils/productUtils';
  
  const route = useRoute()
  const router = useRouter()
  const orderStore = useOrderStore()
  
  const order = ref(null)
  const loading = ref(true)
  const error = ref(null)
  const showReturnModal = ref(false)
  const returnReason = ref("")
  
  const orderId = ref(null);
  
  onMounted(() => {
    orderId.value = route.params.id;
    fetchOrder();
  })
  
  const fetchOrder = async () => {
    loading.value = true;
    error.value = null;
    try {
      const fetchedOrder = await orderStore.fetchOrderById(orderId.value);
      order.value = fetchedOrder;
    } catch (err) {
      error.value = err.message || "Failed to load order";
    } finally {
      loading.value = false;
    }
  };
  
  const formatDate = (timestamp) => {
    // if (!timestamp) return "N/A"
    
    // // Handle Firestore timestamps
    // const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    // return date.toLocaleString()

    return formatOrderDate(timestamp);
  }
  
  const formatExpirationDate = (timestamp) => {
    if (!timestamp) return "N/A"
    
    // Convert Unix timestamp to Date if needed
    const date = typeof timestamp === 'number' 
      ? new Date(timestamp * 1000) 
      : new Date(timestamp)
    
    return date.toLocaleDateString()
  }
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }
  
  const calculateSubtotal = () => {
    if (!order.value || !order.value.items) return 0
    return order.value.items.reduce((total, item) => total + item.totalPrice, 0)
  }
  
  const getItemExpirationDates = (item) => {
    
    console.log("expirationDates", order.value);

    if (!order.value || !order.value.itemExpirationDates) return []

    
    const key = `${item.productId}-${item.varietyId}`
    return order.value.itemExpirationDates[key] || []
  }
  
  const approveOrder = async () => {
    if (confirm("Are you sure you want to approve this order? This will update inventory.")) {
      loading.value = true
      try {
        await orderStore.approveOrder(order.value.id)
        order.value = await orderStore.fetchOrderById(order.value.id)
      } catch (err) {
        error.value = err.message || "Failed to approve order"
      } finally {
        loading.value = false
      }
    }
  }
  
  const voidOrder = async () => {
    if (confirm("Are you sure you want to void this order?")) {
      loading.value = true
      try {
        await orderStore.voidOrder(order.value.id)
        order.value = await orderStore.fetchOrderById(order.value.id)
      } catch (err) {
        error.value = err.message || "Failed to void order"
      } finally {
        loading.value = false
      }
    }
  }
  
  const returnOrder = () => {
    showReturnModal.value = true
  }
  
  const confirmReturn = async () => {
    if (!returnReason.value.trim()) return
    
    loading.value = true
    showReturnModal.value = false
    
    try {
      await orderStore.returnOrder(order.value.id, returnReason.value)
      order.value = await orderStore.fetchOrderById(order.value.id)
      returnReason.value = ""
    } catch (err) {
      error.value = err.message || "Failed to return order"
    } finally {
      loading.value = false
    }
  }
  
  const goBack = () => {
    router.back()
  }
  </script>
  