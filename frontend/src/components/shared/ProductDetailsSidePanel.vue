<!-- frontend\src\components\shared\ProductDetailsSidePanel.vue -->
<template>
    <div class="h-full bg-white p-4 shadow-lg overflow-y-auto">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-semibold">Product Details</h3>
        <button @click="$emit('close')" class="text-gray-500 hover:text-gray-700 md:hidden">
          <X class="w-5 h-5" />
        </button>
      </div>
      
      <div v-if="product">
        <!-- Product Carousel -->
        <div id="product-carousel" class="relative w-full mb-4" data-carousel="static">
          <!-- Carousel wrapper -->
          <div class="relative h-56 overflow-hidden rounded-lg md:h-72">
            <div v-for="(imageUrl, index) in product.imageUrls" :key="index"
              class="hidden duration-700 ease-in-out" :data-carousel-item="index === 0 ? 'active' : ''">
              <img :src="imageUrl" :alt="`${product.name} - Image ${index + 1}`"
                class="absolute block w-full -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 object-cover"
                @error="handleImageError($event, `${product.id}-${index}`)" />
            </div>
            <!-- Fallback for no images -->
            <div v-if="!product.imageUrls?.length" class="hidden duration-700 ease-in-out"
              data-carousel-item="active">
              <div class="absolute block w-full h-full flex items-center justify-center bg-gray-200">
                <Image class="w-12 h-12 text-gray-400" />
              </div>
            </div>
          </div>
          
          <!-- Carousel controls -->
          <div v-if="product.imageUrls?.length > 1"
            class="absolute z-30 flex -translate-x-1/2 space-x-3 rtl:space-x-reverse bottom-5 left-1/2">
            <button v-for="(_, index) in product.imageUrls" :key="index" type="button"
              class="w-3 h-3 rounded-full" :aria-current="index === 0" :aria-label="`Slide ${index + 1}`"
              :data-carousel-slide-to="index"></button>
          </div>
          
          <!-- Slider controls -->
          <button v-if="product.imageUrls?.length > 1" type="button"
            class="absolute top-0 start-0 z-30 flex items-center justify-center h-full px-4 cursor-pointer group focus:outline-none"
            data-carousel-prev>
            <span
              class="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/30 dark:bg-gray-800/30 group-hover:bg-white/50 dark:group-hover:bg-gray-800/60 group-focus:ring-4 group-focus:ring-white dark:group-focus:ring-gray-800/70 group-focus:outline-none">
              <svg class="w-4 h-4 text-white dark:text-gray-800 rtl:rotate-180" aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M5 1 1 5l4 4" />
              </svg>
              <span class="sr-only">Previous</span>
            </span>
          </button>
          <button v-if="product.imageUrls?.length > 1" type="button"
            class="absolute top-0 end-0 z-30 flex items-center justify-center h-full px-4 cursor-pointer group focus:outline-none"
            data-carousel-next>
            <span
              class="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/30 dark:bg-gray-800/30 group-hover:bg-white/50 dark:group-hover:bg-gray-800/60 group-focus:ring-4 group-focus:ring-white dark:group-focus:ring-gray-800/70 group-focus:outline-none">
              <svg class="w-4 h-4 text-white dark:text-gray-800 rtl:rotate-180" aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="m1 9 4-4-4-4" />
              </svg>
              <span class="sr-only">Next</span>
            </span>
          </button>
        </div>
    
        <!-- Product Info -->
        <div class="space-y-4">
          <h2 class="text-xl font-semibold">{{ product.name }}</h2>
          
          <!-- Price Display -->
          <div class="flex items-center">
            <template v-if="isDefaultVarietyOnSale">
              <span class="text-xl font-bold text-red-600">₱{{ salePrice.toFixed(2) }}</span>
              <span class="ml-2 text-sm line-through text-gray-500">₱{{ regularPrice.toFixed(2) }}</span>
            </template>
            <template v-else>
              <span class="text-xl font-bold text-gray-900">₱{{ regularPrice.toFixed(2) }}</span>
            </template>
          </div>
          
          <!-- Description -->
          <div>
            <p v-if="!showFullDescription" class="text-sm text-gray-600">
              {{ truncatedDescription }}
              <button v-if="isDescriptionTruncated" @click="showFullDescription = true" class="text-primary hover:underline ml-1">
                See more
              </button>
            </p>
            <p v-else class="text-sm text-gray-600">
              {{ product.description }}
              <button @click="showFullDescription = false" class="text-primary hover:underline ml-1">
                See less
              </button>
            </p>
          </div>
          
          <!-- Stock Status -->
          <div class="flex items-center">
            <span class="text-sm font-medium text-gray-700">Stock:</span>
            <span :class="[
              'ml-2 text-sm font-medium',
              isLowStock ? 'text-red-600' : 'text-gray-900'
            ]">
              {{ stockDisplay }}
            </span>
          </div>
          
          <!-- Categories -->
          <div v-if="product.category && product.category.length > 0" class="flex flex-wrap gap-1">
            <span 
              v-for="(cat, index) in product.category" 
              :key="index"
              class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
            >
              {{ cat }}
            </span>
          </div>
          
          <!-- Varieties -->
          <div v-if="product.varieties && product.varieties.length > 0" class="mt-4">
            <h3 class="text-sm font-medium text-gray-700 mb-2">Varieties:</h3>
            <div class="space-y-2">
              <div v-for="(variety, index) in product.varieties" :key="index"
                class="flex justify-between items-center p-2 bg-gray-50 rounded-md">
                <div>
                  <span class="font-medium">{{ variety.name }}</span>
                  <span class="text-sm text-gray-500 ml-1">({{ variety.unit }})</span>
                </div>
                <div class="text-right">
                  <div v-if="isVarietyOnSale(variety)" class="flex flex-col items-end">
                    <span class="font-medium text-red-600">₱{{ variety.sale.salePrice.toFixed(2) }}</span>
                    <span class="text-xs line-through text-gray-500">₱{{ variety.price.toFixed(2) }}</span>
                  </div>
                  <div v-else class="font-medium">₱{{ variety.price.toFixed(2) }}</div>
                  <div :class="[
                    'text-xs',
                    variety.stockQuantity <= 10 ? 'text-red-600' : 'text-gray-600'
                  ]">
                    Stock: {{ variety.stockQuantity }}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Action Buttons -->
          <div class="flex space-x-3 pt-4">
            <button @click="$emit('view', product)" 
              class="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark">
              View Details
            </button>
            <button @click="$emit('edit', product)"
              class="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">
              Edit
            </button>
          </div>
        </div>
      </div>
      <p v-else class="text-gray-500">Select a product to see the details</p>
    </div>
    </template>
    
    <script setup>
    import { ref, computed } from 'vue';
    import { useProductStore } from '@/stores/productStore';
    import { X, Image } from 'lucide-vue-next';
    
    const props = defineProps({
      product: {
        type: Object,
        default: null
      }
    });
    
    const emit = defineEmits(['view', 'edit', 'close']);
    const productStore = useProductStore();
    const showFullDescription = ref(false);
    
    // Handle image loading errors
    const handleImageError = (event, imageId) => {
      event.target.src = '/placeholder.svg?height=200&width=200';
    };
    
    // Get default variety
    const defaultVariety = computed(() => {
      return props.product?.varieties?.find(v => v.isDefault) || props.product?.varieties?.[0];
    });
    
    // Check if default variety is on sale
    const isDefaultVarietyOnSale = computed(() => {
      if (!defaultVariety.value) return false;
      return isVarietyOnSale(defaultVariety.value);
    });
    
    // Get regular price
    const regularPrice = computed(() => {
      return defaultVariety.value?.price || 0;
    });
    
    // Get sale price
    const salePrice = computed(() => {
      if (!defaultVariety.value || !isDefaultVarietyOnSale.value) return regularPrice.value;
      return defaultVariety.value.sale.salePrice;
    });
    
    // Truncate description
    const truncatedDescription = computed(() => {
      if (!props.product?.description) return '';
      return props.product.description.length > 100 
        ? props.product.description.substring(0, 100) + '...' 
        : props.product.description;
    });
    
    const isDescriptionTruncated = computed(() => {
      return props.product?.description && props.product.description.length > 100;
    });
    
    // Check if a variety is on sale
    const isVarietyOnSale = (variety) => {
      if (!variety?.onSale || !variety?.sale) return false;
    
      const now = Date.now();
      const startDate = variety.sale.startDate?.seconds * 1000;
      const endDate = variety.sale.endDate?.seconds * 1000;
    
      return now >= startDate && now <= endDate;
    };
    
    // Check if product has low stock
    const isLowStock = computed(() => {
      if (!props.product) return false;
      
      // Check if any variety has low stock
      if (props.product.varieties && props.product.varieties.length > 0) {
        return props.product.varieties.some(v => v.stockQuantity <= 10);
      }
      
      return false;
    });
    
    // Get appropriate stock display text
    const stockDisplay = computed(() => {
      if (!props.product) return '';
      
      if (props.product.varieties && props.product.varieties.length > 0) {
        const totalStock = props.product.varieties.reduce((sum, v) => sum + v.stockQuantity, 0);
        const lowStockVarieties = props.product.varieties.filter(v => v.stockQuantity <= 10);
        
        if (lowStockVarieties.length > 0) {
          return `${totalStock} units (${lowStockVarieties.length} varieties low)`;
        }
        return `${totalStock} units`;
      }
      
      return '0 units';
    });
    </script>
    
    