<template>
    <div class="p-4">
      <div v-if="loading" class="flex justify-center items-center h-64">
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
      <div v-else-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {{ error }}
      </div>
      <div v-else class="bg-white rounded-lg shadow-md p-6">
        <h1 class="text-2xl font-bold mb-6">{{ isNewOrder ? 'Create Order' : 'Edit Order' }}</h1>
  
        <form @submit.prevent="saveOrder">
          <!-- Customer Information -->
          <div class="mb-6">
            <h2 class="text-lg font-semibold mb-4">Customer Information</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-gray-700 mb-2">Customer Name</label>
                <input
                  v-model="orderData.customerName"
                  type="text"
                  class="w-full px-3 py-2 border rounded"
                  required
                />
              </div>
              <div>
                <label class="block text-gray-700 mb-2">Payment Method</label>
                <select v-model="orderData.paymentType" class="w-full px-3 py-2 border rounded">
                  <option value="cash">Cash</option>
                  <option value="credit">Credit Card</option>
                  <option value="bank">Bank Transfer</option>
                </select>
              </div>
            </div>
            <div class="mt-4">
              <label class="block text-gray-700 mb-2">Notes</label>
              <textarea
                v-model="orderData.notes"
                class="w-full px-3 py-2 border rounded"
                rows="2"
              ></textarea>
            </div>
          </div>
  
          <!-- Branch Selection -->
          <div class="mb-6">
            <h2 class="text-lg font-semibold mb-4">Branch</h2>
            <div>
              <label class="block text-gray-700 mb-2">Select Branch</label>
              <select 
                v-model="orderData.branchId" 
                class="w-full px-3 py-2 border rounded"
                required
                @change="loadBranchStock"
              >
                <option v-for="branch in branches" :key="branch.id" :value="branch.id">
                  {{ branch.name }}
                </option>
              </select>
            </div>
          </div>
  
          <!-- Order Items -->
          <div class="mb-6">
            <div class="flex justify-between items-center mb-4">
              <h2 class="text-lg font-semibold">Order Items</h2>
              <button
                type="button"
                @click="showProductSelector = true"
                class="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Add Item
              </button>
            </div>
  
            <!-- Validation Errors -->
            <div v-if="orderStore.hasValidationErrors" class="mb-4">
              <div v-if="orderStore.saleValidationErrors.length > 0" class="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-2">
                <h3 class="font-bold">Sale Price Issues:</h3>
                <ul class="list-disc pl-5">
                  <li v-for="(error, index) in orderStore.saleValidationErrors" :key="index">
                    {{ error.item.product }} ({{ error.item.varietyName }}): {{ error.issue }}
                    <span v-if="error.currentPrice">
                      - Current price: {{ formatCurrency(error.currentPrice) }}
                    </span>
                  </li>
                </ul>
              </div>
              <div v-if="orderStore.stockValidationErrors.length > 0" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                <h3 class="font-bold">Stock Issues:</h3>
                <ul class="list-disc pl-5">
                  <li v-for="(error, index) in orderStore.stockValidationErrors" :key="index">
                    {{ error.item.product }} ({{ error.item.varietyName }}): {{ error.issue }}
                    <span v-if="error.available !== undefined">
                      - Available: {{ error.available }}
                    </span>
                  </li>
                </ul>
              </div>
            </div>
  
            <!-- Items Table -->
            <div v-if="orderData.items.length > 0" class="overflow-x-auto">
              <table class="min-w-full bg-white">
                <thead class="bg-gray-100">
                  <tr>
                    <th class="py-2 px-4 text-left">Product</th>
                    <th class="py-2 px-4 text-left">Variety</th>
                    <th class="py-2 px-4 text-right">Unit Price</th>
                    <th class="py-2 px-4 text-right">Quantity</th>
                    <th class="py-2 px-4 text-right">Total</th>
                    <th class="py-2 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, index) in orderData.items" :key="index" class="border-b">
                    <td class="py-2 px-4">{{ item.product }}</td>
                    <td class="py-2 px-4">{{ item.varietyName }}</td>
                    <td class="py-2 px-4 text-right">
                      {{ formatCurrency(item.unitPrice) }}
                      <span v-if="item.onSale" class="text-xs text-green-600 ml-1">(Sale)</span>
                    </td>
                    <td class="py-2 px-4 text-right">
                      <input
                        v-model.number="item.quantity"
                        type="number"
                        min="1"
                        class="w-16 px-2 py-1 border rounded text-right"
                        @change="updateItemTotal(item)"
                      />
                      {{ item.unit }}
                    </td>
                    <td class="py-2 px-4 text-right">{{ formatCurrency(item.totalPrice) }}</td>
                    <td class="py-2 px-4 text-center">
                      <button
                        type="button"
                        @click="removeItem(index)"
                        class="text-red-600 hover:text-red-800"
                      >
                        <span class="sr-only">Remove</span>
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                </tbody>
                <tfoot class="bg-gray-50">
                  <tr>
                    <td colspan="4" class="py-2 px-4 text-right font-medium">Total:</td>
                    <td class="py-2 px-4 text-right font-bold">{{ formatCurrency(calculateTotal()) }}</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
            <div v-else class="text-center py-8 bg-gray-50 rounded">
              <p class="text-gray-500">No items added yet</p>
            </div>
          </div>
  
          <!-- Action Buttons -->
          <div class="flex justify-end space-x-4">
            <button
              type="button"
              @click="goBack"
              class="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              :disabled="orderData.items.length === 0 || loading"
            >
              {{ isNewOrder ? 'Create Order' : 'Update Order' }}
            </button>
          </div>
        </form>
      </div>
  
      <!-- Product Selector Modal -->
      <div v-if="showProductSelector" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-bold">Select Products</h2>
            <button
              @click="showProductSelector = false"
              class="text-gray-500 hover:text-gray-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
  
          <!-- Search and Filter -->
          <div class="mb-4">
            <input
              v-model="productSearch"
              type="text"
              placeholder="Search products..."
              class="w-full px-3 py-2 border rounded"
            />
          </div>
  
          <!-- Stock Warning -->
          <div v-if="lowStockWarning" class="mb-4 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
            <p>Some products have low stock or expiration date issues. Please check carefully.</p>
          </div>
  
          <!-- Products List -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div
              v-for="product in filteredProducts"
              :key="product.id"
              class="border rounded p-4 hover:bg-gray-50"
            >
              <div class="flex justify-between items-start mb-2">
                <h3 class="font-semibold">{{ product.productName }}</h3>
                <span
                  v-if="product.quantity <= 10"
                  class="px-2 py-0.5 bg-red-100 text-red-800 text-xs rounded-full"
                >
                  Low Stock
                </span>
              </div>
              <div class="mb-2 text-sm text-gray-600">
                <p>Available: {{ product.quantity }} {{ product.variety?.unit || 'units' }}</p>
                <p v-if="product.expirationDates && product.expirationDates.length > 0">
                  Earliest expiration: {{ formatExpirationDate(getEarliestExpirationDate(product)) }}
                </p>
              </div>
              <div class="flex items-center justify-between">
                <div>
                  <p class="font-medium">
                    {{ formatCurrency(getProductPrice(product)) }}
                    <span v-if="isProductOnSale(product)" class="text-xs text-green-600 ml-1">(Sale)</span>
                  </p>
                </div>
                <div class="flex items-center">
                  <input
                    v-model.number="product.orderQuantity"
                    type="number"
                    min="1"
                    :max="product.quantity"
                    class="w-16 px-2 py-1 border rounded text-right mr-2"
                  />
                  <button
                    @click="addProductToOrder(product)"
                    class="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                    :disabled="!product.orderQuantity || product.orderQuantity < 1"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          </div>
  
          <div class="flex justify-end">
            <button
              @click="showProductSelector = false"
              class="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted } from "vue"
  import { useRoute, useRouter } from "vue-router"
  import { useOrderStore } from "@/stores/orderStore"
  import { useInventoryStore } from "@/stores/inventoryStore"
  import { useBranchStore } from "@/stores/branchStore"
  import { isVarietyOnSale, getVarietyPrice } from "@/utils/priceUtils"
  
  const route = useRoute()
  const router = useRouter()
  const orderStore = useOrderStore()
  const inventoryStore = useInventoryStore()
  const branchStore = useBranchStore()
  
  const isNewOrder = computed(() => !route.params.id)
  const orderData = ref({
    customerName: "",
    paymentType: "cash",
    notes: "",
    branchId: "",
    items: [],
  })
  const loading = ref(true)
  const error = ref(null)
  const showProductSelector = ref(false)
  const productSearch = ref("")
  const lowStockWarning = ref(false)
  
  onMounted(async () => {
    try {
      // Load branches
      await branchStore.setupRealtimeActiveBranches()
      
      // Set default branch if available
      if (branchStore.fetchedbranches.length > 0) {
        orderData.value.branchId = branchStore.fetchedbranches[0].id
        await loadBranchStock()
      }
  
      // If editing existing order, load it
      if (!isNewOrder.value) {
        const orderId = route.params.id
        const fetchedOrder = await orderStore.fetchOrderById(orderId)
        
        if (fetchedOrder) {
          orderData.value = {
            id: fetchedOrder.id,
            customerName: fetchedOrder.client,
            paymentType: fetchedOrder.paymentType || "cash",
            notes: fetchedOrder.notes || "",
            branchId: fetchedOrder.branchId,
            items: fetchedOrder.items.map(item => ({
              productId: item.productId,
              varietyId: item.varietyId,
              product: item.product,
              varietyName: item.varietyName,
              unitPrice: item.unitPrice,
              quantity: item.quantity,
              unit: item.unit,
              totalPrice: item.totalPrice,
              onSale: item.onSale || false,
              sale: item.sale || null,
            })),
          }
          
          // Load stock for the order's branch
          await loadBranchStock()
        } else {
          error.value = "Order not found"
        }
      }
    } catch (err) {
      error.value = err.message || "Failed to load data"
    } finally {
      loading.value = false
    }
  })
  
  const branches = computed(() => {
    return branchStore.fetchedbranches.filter(branch => branch.isActive)
  })
  
  const branchStock = computed(() => {
    return inventoryStore.branchStock || []
  })
  
  const filteredProducts = computed(() => {
    if (!branchStock.value) return []
    
    let filtered = branchStock.value.map(item => ({
      ...item,
      orderQuantity: 1,
    }))
    
    if (productSearch.value) {
      const search = productSearch.value.toLowerCase()
      filtered = filtered.filter(
        item => 
          item.productName?.toLowerCase().includes(search) ||
          item.varietyName?.toLowerCase().includes(search)
      )
    }
    
    // Check for low stock warning
    lowStockWarning.value = filtered.some(item => 
      item.quantity <= 10 || 
      hasNearExpirationDates(item)
    )
    
    return filtered
  })
  
  const loadBranchStock = async () => {
    if (!orderData.value.branchId) return
    
    loading.value = true
    try {
      await inventoryStore.setSelectedBranch(orderData.value.branchId)
    } catch (err) {
      error.value = err.message || "Failed to load branch stock"
    } finally {
      loading.value = false
    }
  }
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }
  
  const formatExpirationDate = (timestamp) => {
    if (!timestamp) return "N/A"
    
    // Convert Unix timestamp to Date if needed
    const date = typeof timestamp === 'number' 
      ? new Date(timestamp * 1000) 
      : new Date(timestamp)
    
    return date.toLocaleDateString()
  }
  
  const getEarliestExpirationDate = (product) => {
    if (!product.expirationDates || product.expirationDates.length === 0) {
      return null
    }
    
    // Sort by date and return the earliest
    const sorted = [...product.expirationDates].sort((a, b) => a.date - b.date)
    return sorted[0].date
  }
  
  const hasNearExpirationDates = (product) => {
    if (!product.expirationDates || product.expirationDates.length === 0) {
      return false
    }
    
    const now = Date.now() / 1000 // Current time in seconds
    const thirtyDaysInSeconds = 30 * 24 * 60 * 60
    
    // Check if any expiration date is within 30 days
    return product.expirationDates.some(exp => {
      return exp.date - now < thirtyDaysInSeconds && exp.date > now
    })
  }
  
  const isProductOnSale = (product) => {
    return product.variety?.onSale || false
  }
  
  const getProductPrice = (product) => {
    if (isProductOnSale(product)) {
      return product.variety.sale.salePrice
    }
    return product.variety?.price || 0
  }
  
  const addProductToOrder = (product) => {
    if (!product.orderQuantity || product.orderQuantity < 1) return
    
    // Check if quantity is available
    if (product.orderQuantity > product.quantity) {
      alert(`Only ${product.quantity} units available`)
      return
    }
    
    // Check if product already exists in order
    const existingIndex = orderData.value.items.findIndex(
      item => item.productId === product.productId && item.varietyId === product.varietyId
    )
    
    if (existingIndex !== -1) {
      // Update existing item
      orderData.value.items[existingIndex].quantity += product.orderQuantity
      orderData.value.items[existingIndex].totalPrice = 
        orderData.value.items[existingIndex].quantity * 
        orderData.value.items[existingIndex].unitPrice
    } else {
      // Add new item
      const price = getProductPrice(product)
      orderData.value.items.push({
        productId: product.productId,
        varietyId: product.varietyId,
        product: product.productName,
        varietyName: product.varietyName,
        unitPrice: price,
        quantity: product.orderQuantity,
        unit: product.variety?.unit || "unit",
        totalPrice: price * product.orderQuantity,
        onSale: isProductOnSale(product),
        sale: isProductOnSale(product) ? product.variety.sale : null,
      })
    }
    
    // Reset quantity and close modal
    product.orderQuantity = 1
    showProductSelector.value = false
  }
  
  const updateItemTotal = (item) => {
    item.totalPrice = item.quantity * item.unitPrice
  }
  
  const removeItem = (index) => {
    orderData.value.items.splice(index, 1)
  }
  
  const calculateTotal = () => {
    return orderData.value.items.reduce((total, item) => total + item.totalPrice, 0)
  }
  
  const validateOrder = async () => {
    // Validate stock availability
    const isStockValid = await orderStore.validateOrderStock(
      orderData.value.items, 
      orderData.value.branchId
    )
    
    // Validate sale prices
    const isSalePriceValid = await orderStore.validateOrderSalePrices(
      orderData.value.items
    )
    
    return isStockValid && isSalePriceValid
  }
  
  const saveOrder = async () => {
    if (orderData.value.items.length === 0) {
      alert("Please add at least one item to the order")
      return
    }
    
    loading.value = true
    try {
      // Validate order before saving
      const isValid = await validateOrder()
      if (!isValid) {
        // The validation errors are stored in orderStore.saleValidationErrors
        // and orderStore.stockValidationErrors
        return
      }
      
      // Prepare order data
      const payload = {
        ...orderData.value,
        totalPrice: calculateTotal(),
      }
      
      let result
      if (isNewOrder.value) {
        result = await orderStore.createOrder(payload)
      } else {
        result = await orderStore.updateOrder(payload)
      }
      
      // Navigate back to orders list
      router.push({ name: "OrderList" })
    } catch (err) {
      error.value = err.message || `Failed to ${isNewOrder.value ? 'create' : 'update'} order`
    } finally {
      loading.value = false
    }
  }
  
  const goBack = () => {
    router.back()
  }
  </script>
  