<template>
  <div class="container mx-auto p-4">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">Edit Order</h1>
      <div class="flex space-x-3">
        <router-link to="/administrator/orders"
          class="border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50">
          Cancel
        </router-link>
        <button @click="confirmVoidOrder" :disabled="orderData.status === 'Voided'"
          class="bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed">
          Void Order
        </button>
      </div>
    </div>

    <div v-if="loading" class="flex justify-center items-center h-64">
      <div class="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
    </div>

    <div v-else-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
      <p>{{ error }}</p>
      <button @click="loadOrder" class="text-red-700 underline mt-2">Try Again</button>
    </div>

    <div v-else>
      <!-- Order Status Banner -->
      <div v-if="orderData.status" :class="{
        'mb-6 p-4 rounded-lg text-white': true,
        'bg-yellow-500': orderData.status === 'Pending',
        'bg-green-500': orderData.status === 'Completed',
        'bg-red-500': orderData.status === 'Voided'
      }">
        <div class="flex items-center">
          <AlertCircle v-if="orderData.status === 'Voided'" class="w-6 h-6 mr-2" />
          <CheckCircle v-else-if="orderData.status === 'Completed'" class="w-6 h-6 mr-2" />
          <Clock v-else class="w-6 h-6 mr-2" />
          <span class="font-semibold">Order Status: {{ orderData.status }}</span>
        </div>
        <p v-if="orderData.status === 'Voided'" class="mt-1 text-sm">
          This order has been voided and cannot be modified.
        </p>
      </div>

      <!-- Customer Information -->
      <div class="mb-6 bg-white p-4 rounded-lg shadow">
        <h2 class="text-lg font-semibold mb-4">Customer Information</h2>
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700">Customer Name</label>
          <input v-model="orderData.customerName" type="text" :disabled="orderData.status === 'Voided'"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary disabled:bg-gray-100" />
        </div>
      </div>

      <!-- Current Order Items -->
      <div class="mb-6 bg-white p-4 rounded-lg shadow">
        <h2 class="text-lg font-semibold mb-4">Order Items</h2>

        <div v-if="orderData.items.length === 0" class="text-center text-gray-500 py-6">
          No items in order
        </div>

        <div v-else class="space-y-4">
          <div v-for="(item, index) in orderData.items" :key="index"
            class="flex justify-between items-center p-3 bg-gray-50 rounded-md">
            <div>
              <div class="font-medium">{{ item.productName }}</div>
              <div class="text-sm text-gray-600">
                <span v-if="item.variety">
                  {{ item.variety.name }} ({{ item.variety.quantity }} {{ item.variety.unit }})
                </span>
              </div>
            </div>

            <!-- Quantity controls -->
            <div class="flex items-center space-x-3">
              <button @click="updateItemQuantity(index, item.quantity - 1)"
                :disabled="orderData.status === 'Voided' || item.quantity <= 1"
                class="p-1 rounded-full hover:bg-gray-100 disabled:opacity-50">
                <Minus class="w-4 h-4" />
              </button>

              <span class="w-8 text-center">{{ item.quantity }}</span>

              <button @click="updateItemQuantity(index, item.quantity + 1)"
                :disabled="orderData.status === 'Voided' || item.maxQuantity <= item.quantity"
                class="p-1 rounded-full hover:bg-gray-100 disabled:opacity-50">
                <Plus class="w-4 h-4" />
              </button>
            </div>

            <div class="text-right">
              <div class="font-bold">₱{{ item.totalPrice.toFixed(2) }}</div>
              <button @click="removeItem(index)" :disabled="orderData.status === 'Voided'"
                class="text-red-500 hover:text-red-600 p-1 disabled:opacity-50">
                <Trash2 class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div class="mt-6 border-t pt-4">
          <div class="flex justify-between items-center font-bold text-lg">
            <span>Total:</span>
            <span>₱{{ totalOrderPrice.toFixed(2) }}</span>
          </div>
        </div>
      </div>

      <!-- Add New Products -->
      <div v-if="orderData.status !== 'Voided'" class="mb-6 bg-white p-4 rounded-lg shadow">
        <h2 class="text-lg font-semibold mb-4">Add Products</h2>

        <!-- Product List -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div v-for="product in products" :key="product.id"
            class="border rounded-lg p-4 hover:shadow-lg transition-shadow">

            <!-- Product Basic Info -->
            <div class="flex items-start justify-between mb-3">
              <div>
                <h3 class="font-semibold">{{ product.name }}</h3>
                <div class="text-sm text-gray-600">
                  Stock: {{ getTotalStockForProduct(product) }}
                </div>
              </div>
            </div>

            <!-- Variety Selection -->
            <div class="mb-3">
              <label class="block text-sm font-medium text-gray-700 mb-1">Select Variety</label>
              <select v-model="selectedVarieties[product.id]"
                class="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary">
                <option value="">Select a variety</option>
                <option v-for="variety in product.varieties" :key="variety.id" :value="variety">
                  {{ variety.name }} ({{ variety.quantity }} {{ variety.unit }}) -
                  {{ isVarietyOnSale(variety) ? `₱${variety.sale.salePrice.toFixed(2)} (Sale)` :
                    `₱${variety.price.toFixed(2)}` }}
                </option>
              </select>
            </div>

            <!-- Quantity Input -->
            <div class="flex items-center space-x-3">
              <button @click="decrementQuantity(product.id)" class="p-1 rounded-full hover:bg-gray-100"
                :disabled="!getProductQuantity(product.id)">
                <Minus class="w-5 h-5" />
              </button>

              <input type="number" v-model="quantities[product.id]" min="0" :max="getMaxQuantityForProduct(product.id)"
                class="w-20 text-center rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary" />

              <button @click="incrementQuantity(product.id)" class="p-1 rounded-full hover:bg-gray-100"
                :disabled="getProductQuantity(product.id) >= getMaxQuantityForProduct(product.id)">
                <Plus class="w-5 h-5" />
              </button>
            </div>

            <button @click="addToOrder(product)"
              :disabled="!getProductQuantity(product.id) || !selectedVarieties[product.id]"
              class="mt-3 w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-dark disabled:bg-gray-300">
              Add to Order
            </button>
          </div>
        </div>
      </div>

      <!-- Update Order Button -->
      <div class="flex justify-end">
        <button @click="updateOrder" :disabled="orderData.status === 'Voided' || orderData.items.length === 0"
          class="bg-green-500 text-white py-3 px-6 rounded-md hover:bg-green-600 flex items-center justify-center disabled:bg-gray-300 disabled:cursor-not-allowed">
          <Save class="w-5 h-5 mr-2" />
          Update Order
        </button>
      </div>
    </div>

    <!-- Confirmation Modal -->
    <div v-if="showConfirmation" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <h3 class="text-lg font-semibold mb-4">{{ confirmationTitle }}</h3>
        <p>{{ confirmationMessage }}</p>
        <div class="mt-6 flex justify-end space-x-3">
          <button @click="cancelConfirmation" class="px-4 py-2 border border-gray-300 rounded-md">
            Cancel
          </button>
          <button @click="confirmAction" class="bg-red-500 text-white px-4 py-2 rounded-md">
            Confirm
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useProductStore } from '@/stores/productStore';
import { useOrderStore } from '@/stores/orderStore';
import { Plus, Minus, Trash2, Save, AlertCircle, CheckCircle, Clock } from 'lucide-vue-next';

const route = useRoute();
const router = useRouter();
const productStore = useProductStore();
const orderStore = useOrderStore();

// State
const loading = ref(true);
const error = ref(null);
const orderData = ref({
  id: '',
  customerName: '',
  items: [],
  status: '',
  createdAt: null,
  updatedAt: null
});

const quantities = ref({});
const selectedVarieties = ref({});
const showConfirmation = ref(false);
const confirmationTitle = ref('');
const confirmationMessage = ref('');
const confirmationAction = ref(null);

// Computed
const products = computed(() => productStore.products);

const totalOrderPrice = computed(() => {
  return orderData.value.items.reduce((total, item) => total + item.totalPrice, 0);
});

// Methods
const loadOrder = async () => {
  try {
    loading.value = true;
    error.value = null;

    const orderId = route.params.id;
    const order = await orderStore.fetchOrderById(orderId);

    if (!order) {
      error.value = 'Order not found';
      return;
    }

    // Transform order data to match our component's structure
    orderData.value = {
      id: order.id,
      customerName: order.client,
      status: order.status,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      items: order.items.map(item => {
        // Find the product to get the max quantity
        const product = productStore.products.find(p => p.id === item.productId);
        let maxQuantity = 999; // Default high value

        if (product) {
          // Find the matching variety
          const variety = product.varieties.find(v =>
            v.name === (item.variety?.varietyName || '')
          );
          if (variety) {
            maxQuantity = variety.stockQuantity;
          }
        }

        return {
          productId: item.productId,
          productName: item.product,
          quantity: item.quantity,
          pricePerUnit: item.variety ? item.variety.varietyPrice : item.unitPrice,
          totalPrice: item.totalPrice,
          maxQuantity: maxQuantity,
          variety: item.variety ? {
            name: item.variety.varietyName,
            unit: item.variety.varietyName, // For backward compatibility
            quantity: item.variety.varietyQuantity,
            discountPrice: item.variety.varietyPrice
          } : null
        };
      })
    };
  } catch (err) {
    console.error('Error loading order:', err);
    error.value = 'Failed to load order. Please try again.';
  } finally {
    loading.value = false;
  }
};

// Check if a variety is on sale
const isVarietyOnSale = (variety) => {
  if (!variety?.onSale || !variety?.sale) return false;

  const now = Date.now();
  const startDate = variety.sale.startDate?.seconds * 1000;
  const endDate = variety.sale.endDate?.seconds * 1000;

  return now >= startDate && now <= endDate;
};

// Get total stock for a product (sum of all varieties)
const getTotalStockForProduct = (product) => {
  if (!product.varieties || product.varieties.length === 0) return 0;
  return product.varieties.reduce((sum, variety) => sum + variety.stockQuantity, 0);
};

// Get quantity for a product
const getProductQuantity = (productId) => {
  return quantities.value[productId] || 0;
};

// Get max quantity for a product based on selected variety
const getMaxQuantityForProduct = (productId) => {
  const variety = selectedVarieties.value[productId];
  if (!variety) return 0;
  return variety.stockQuantity;
};

// Increment quantity
const incrementQuantity = (productId) => {
  const currentQty = getProductQuantity(productId);
  const maxQty = getMaxQuantityForProduct(productId);
  if (currentQty < maxQty) {
    quantities.value[productId] = currentQty + 1;
  }
};

// Decrement quantity
const decrementQuantity = (productId) => {
  const currentQty = getProductQuantity(productId);
  if (currentQty > 0) {
    quantities.value[productId] = currentQty - 1;
  }
};

// Check if two varieties are the same
const isSameVariety = (variety1, variety2) => {
  if (!variety1 && !variety2) return true;
  if (!variety1 || !variety2) return false;

  // Compare by name (primary identifier)
  if (variety1.name && variety2.name) {
    return variety1.name === variety2.name;
  }

  // For backward compatibility
  if (variety1.varietyName && variety2.name) {
    return variety1.varietyName === variety2.name;
  }

  if (variety1.name && variety2.varietyName) {
    return variety1.name === variety2.varietyName;
  }

  return false;
};

// Calculate price for an item
const calculateItemPrice = (variety) => {
  if (!variety) return 0;

  if (isVarietyOnSale(variety)) {
    return variety.sale.salePrice;
  }

  return variety.price;
};

const updateItemQuantity = (index, newQuantity) => {
  const item = orderData.value.items[index];

  if (newQuantity <= 0) {
    removeItem(index);
    return;
  }

  if (newQuantity > item.maxQuantity) {
    newQuantity = item.maxQuantity;
    console.log('Maximum Stock Reached');
  }

  const pricePerUnit = item.pricePerUnit;

  orderData.value.items[index] = {
    ...item,
    quantity: newQuantity,
    totalPrice: pricePerUnit * newQuantity
  };
};

// Add item to order
const addToOrder = (product) => {
  const quantity = getProductQuantity(product.id);
  if (quantity <= 0) return;

  const variety = selectedVarieties.value[product.id];
  if (!variety) return;

  const pricePerUnit = calculateItemPrice(variety);

  // Find if this exact product+variety combination already exists
  const existingItemIndex = orderData.value.items.findIndex(item =>
    item.productId === product.id && isSameVariety(item.variety, variety)
  );

  if (existingItemIndex !== -1) {
    // Update existing item with same variety
    const existingItem = orderData.value.items[existingItemIndex];
    const newQuantity = existingItem.quantity + quantity;

    // Check if new quantity exceeds stock
    if (newQuantity > variety.stockQuantity) {
      console.log('Maximum Stock Reached');
      orderData.value.items[existingItemIndex] = {
        ...existingItem,
        quantity: variety.stockQuantity,
        totalPrice: pricePerUnit * variety.stockQuantity
      };
    } else {
      orderData.value.items[existingItemIndex] = {
        ...existingItem,
        quantity: newQuantity,
        totalPrice: pricePerUnit * newQuantity
      };
    }
  } else {
    // Add as a new item for different varieties
    orderData.value.items.push({
      productId: product.id,
      productName: product.name,
      quantity,
      pricePerUnit,
      maxQuantity: variety.stockQuantity,
      variety: {
        name: variety.name,
        unit: variety.unit,
        quantity: variety.quantity,
        discountPrice: pricePerUnit
      },
      totalPrice: pricePerUnit * quantity
    });
  }

  // Reset inputs
  quantities.value[product.id] = 0;
  selectedVarieties.value[product.id] = null;

  console.log('Added to order');
};

const removeItem = (index) => {
  orderData.value.items.splice(index, 1);
  console.log('Removed from Order');
};

const updateOrder = async () => {
  try {
    if (orderData.value.items.length === 0) {
      alert('Cannot update an order with no items');
      return;
    }

    await orderStore.updateOrder({
      id: orderData.value.id,
      customerName: orderData.value.customerName,
      items: orderData.value.items,
      totalPrice: totalOrderPrice.value
    });

    alert('Order updated successfully');
    router.push('/administrator/orders');
  } catch (error) {
    console.error('Error updating order:', error);
    alert('Failed to update order: ' + error.message);
  }
};

const confirmVoidOrder = () => {
  confirmationTitle.value = 'Void Order';
  confirmationMessage.value = 'Are you sure you want to void this order? This action cannot be undone.';
  confirmationAction.value = voidOrder;
  showConfirmation.value = true;
};

const voidOrder = async () => {
  try {
    await orderStore.voidOrder(orderData.value.id);
    orderData.value.status = 'Voided';
    alert('Order voided successfully');
    showConfirmation.value = false;
  } catch (error) {
    console.error('Error voiding order:', error);
    alert('Failed to void order: ' + error.message);
  }
};

const cancelConfirmation = () => {
  showConfirmation.value = false;
  confirmationAction.value = null;
};

const confirmAction = () => {
  if (confirmationAction.value) {
    confirmationAction.value();
  }
  showConfirmation.value = false;
};

onMounted(async () => {
  await Promise.all([
    productStore.fetchProducts(),
    loadOrder()
  ]);
});
</script>
