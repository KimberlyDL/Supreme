frontend\src\components\shared\ProductCard.vue
<template>
  <div
    class="relative bg-white rounded-lg shadow-md overflow-hidden transition duration-200 transform hover:scale-105 hover:shadow-xl">
    <!-- Sale Badge -->
    <div v-if="isOnSale" class="absolute top-2 right-2 z-10">
      <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
        Sale
      </span>
    </div>

    <!-- Low Stock Badge -->
    <div v-if="isLowStock" class="absolute top-2 left-2 z-10">
      <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
        Low Stock
      </span>
    </div>

    <!-- Product Image -->
    <div class="relative aspect-square overflow-hidden bg-gray-100">
      <img :src="product.imageUrl || '/placeholder.svg?height=200&width=200'" :alt="product.name"
        class="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
        @error="handleImageError" />
    </div>

    <!-- Product Info -->
    <div class="p-4">
      <h3 class="text-lg font-semibold text-gray-900 line-clamp-1">{{ product.name }}</h3>

      <!-- Price Display -->
      <div class="mt-2 flex items-center">
        <template v-if="isOnSale">
          <span class="text-lg font-bold text-red-600">₱{{ salePrice.toFixed(2) }}</span>
          <span class="ml-2 text-sm line-through text-gray-500">₱{{ product.price.toFixed(2) }}</span>
        </template>
        <template v-else>
          <span class="text-lg font-bold text-gray-900">₱{{ product.price.toFixed(2) }}</span>
        </template>
      </div>

      <!-- Categories -->
      <div v-if="product.category && product.category.length > 0" class="mt-2 flex flex-wrap gap-1">
        <span v-for="(cat, index) in product.category.slice(0, 2)" :key="index"
          class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
          {{ cat }}
        </span>
        <span v-if="product.category.length > 2"
          class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          +{{ product.category.length - 2 }}
        </span>
      </div>

      <!-- Action Buttons -->
      <div class="mt-4 flex justify-between items-center">
        <button @click="$emit('view', product)" class="text-primary hover:text-primary-dark font-medium text-sm">
          View Details
        </button>

        <div class="relative">
          <button :id="`dropdownButton-${product.id}`" @click.stop="$emit('toggle-menu', product.id)"
            class="text-gray-500 hover:text-gray-700">
            <MoreVertical class="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { MoreVertical } from 'lucide-vue-next';

const props = defineProps({
  product: {
    type: Object,
    required: true
  },
  lowStockThreshold: {
    type: Number,
    default: 10
  }
});

const emit = defineEmits(['view', 'edit', 'delete', 'toggle-menu']);

// Check if product is on sale
const isOnSale = computed(() => {
  if (!props.product.sale || !props.product.sale.onSale) return false;

  const now = Date.now();
  const startDate = props.product.sale.startDate.seconds * 1000;
  const endDate = props.product.sale.endDate.seconds * 1000;

  return now >= startDate && now <= endDate;
});

// Get the sale price
const salePrice = computed(() => {
  return isOnSale.value ? props.product.sale.salePrice : props.product.price;
});

// Check if product has low stock
const isLowStock = computed(() => {
  // Check if any variety has low stock
  if (props.product.varieties && props.product.varieties.length > 0) {
    return props.product.varieties.some(v => v.stockQuantity <= props.lowStockThreshold);
  }

  // Fall back to main product stock
  return props.product.stockQuantity <= props.lowStockThreshold;
});

// Handle image loading errors
const handleImageError = (event) => {
  event.target.src = '/placeholder.svg?height=200&width=200';
};
</script>
