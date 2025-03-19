<!-- frontend\src\views\admin\products\ProductDetails.vue -->
<template>
  <div class="container mx-auto px-4 py-8">
    <div v-if="product">

      <div class="mb-6 flex justify-between items-center">
        <button @click="goBack" class="flex items-center text-gray-600 hover:text-gray-900">
          <ArrowLeftIcon class="w-5 h-5 mr-2" />
          Back to Products
        </button>
      </div>

      <!-- <div class="md:flex flex-col md:flex-row"> -->
      <div class="bg-white shadow-lg rounded-lg overflow-hidden">
        <!-- <div class="md:w-1/2"> -->
        <div>
          <!-- Carousel -->
          <div id="product-carousel" class="relative w-full">
            <!-- Carousel wrapper -->
            <div class="relative h-56 overflow-hidden rounded-lg md:h-96">
              <template v-if="product.imageUrls && product.imageUrls.length > 0">
                <div v-for="(imageUrl, index) in product.imageUrls" :key="index" class="hidden duration-700 ease-in-out"
                  :id="`image-${index + 1}`">
                  <img :src="imageUrl" :alt="`${product.name} - Image ${index + 1}`"
                    class="absolute block w-full -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2"
                    @error="handleImageError($event, `${product.id}-${index}`)" />
                </div>
              </template>
              <div v-else class="absolute inset-0 flex items-center justify-center bg-gray-100">
                <span class="text-gray-400">No image available</span>
              </div>
            </div>

            <!-- Only show controls and indicators if there are multiple images -->
            <template v-if="product.imageUrls && product.imageUrls.length > 1">
              <!-- Slider indicators -->
              <div class="absolute z-30 flex -translate-x-1/2 space-x-3 rtl:space-x-reverse bottom-5 left-1/2">
                <button v-for="(_, index) in product.imageUrls" :key="index" type="button"
                  class="w-3 h-3 rounded-full bg-white/50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800"
                  :id="`carousel-indicator-${index + 1}`" :aria-current="index === 0"
                  :aria-label="`Slide ${index + 1}`">
                </button>
              </div>

              <!-- Slider controls -->
              <button type="button" id="data-carousel-prev"
                class="absolute top-0 start-0 z-30 flex h-full cursor-pointer items-center justify-center px-4 focus:outline-none">
                <span
                  class="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/30 group-hover:bg-white/50 group-focus:ring-4 group-focus:ring-white dark:bg-gray-800/30 dark:group-hover:bg-gray-800/60 dark:group-focus:ring-gray-800/70">
                  <svg class="h-4 w-4 text-white dark:text-gray-800 rtl:rotate-180" aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M5 1 1 5l4 4" />
                  </svg>
                  <span class="hidden">Previous</span>
                </span>
              </button>
              <button type="button" id="data-carousel-next"
                class="absolute top-0 end-0 z-30 flex h-full cursor-pointer items-center justify-center px-4 focus:outline-none">
                <span
                  class="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/30 group-hover:bg-white/50 group-focus:ring-4 group-focus:ring-white dark:bg-gray-800/30 dark:group-hover:bg-gray-800/60 dark:group-focus:ring-gray-800/70">
                  <svg class="h-4 w-4 text-white dark:text-gray-800 rtl:rotate-180" aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="m1 9 4-4-4-4" />
                  </svg>
                  <span class="hidden">Next</span>
                </span>
              </button>
            </template>
          </div>
        </div>

        <!-- Product Details -->
        <!-- <div class="p-8"> -->
        <div class="p-8">
          <!-- <h1 class="mt-1 text-4xl font-bold text-gray-900">{{ product.name }}</h1> -->
          <div class="flex justify-between items-center mb-5">
            <h1 class="text-4xl font-bold text-gray-700 text-left">{{ product?.name }}</h1>
          </div>

          <!-- <div class="mt-4 flex items-center justify-between">
            <div class="flex items-center">
              <div v-if="product.sales && product.sales.length > 0" class="flex items-center">
                <span class="text-2xl font-bold text-green-600">${{ product.sales[0].salePrice.toFixed(2) }}</span>
                <span class="ml-2 text-lg line-through text-red-500">${{ product.basePrice.toFixed(2) }}</span>
              </div>
              <div v-else>
                <span class="text-2xl font-bold text-gray-900">${{ product.basePrice.toFixed(2) }}</span>
              </div>
            </div>
            <div class="flex items-center">
              <span class="text-gray-600">Stock:</span>
              <span class="ml-2 text-lg font-semibold text-gray-900">{{ product.stockQuantity }}</span>
            </div>
          </div> -->

          <!-- Base price and stock side by side -->
          <!-- <div class="mt-4 flex items-center justify-between">
            <div class="flex items-center">
              <div v-if="product.sale && product.sale.onSale && product.sale.endDate.seconds * 1000 > Date.now()"
                class="flex items-center">
                <span class="text-2xl font-bold text-red-600">${{ product.sale.salePrice.toFixed(2) }}</span>
                <span class="ml-5 text-xl font-bold line-through text-gray-500">${{ product.basePrice.toFixed(2)
                }}</span>
              </div>
              <div v-else>
                <span class="text-2xl font-bold text-gray-900">${{ product.basePrice.toFixed(2) }}</span>
              </div>
            </div>
            <div class="flex items-center">
              <span class="text-gray-600">Stock:</span>
              <div v-if="product.stockQuantity !== undefined && product.stockQuantity <= 10">
                <span class="ml-2 text-lg font-semibold text-red-600">{{ product.stockQuantity }}</span>
              </div>
              <div v-else>
                <span class="ml-2 text-lg font-semibold text-gray-900">{{ product.stockQuantity }}</span>
              </div>
            </div>
          </div> -->



          <div class="mt-4 flex items-center justify-between">
            <div class="flex flex-col">
              <!-- Price display -->
              <div class="flex items-center">
                <!-- Check if product has sale and it's currently active -->
                <div v-if="product.sale && product.sale.onSale && isSaleActive(product.sale)" class="flex items-center">
                  <span class="text-2xl font-bold text-red-600">${{ product.sale.salePrice.toFixed(2) }}</span>
                  <span class="ml-5 text-xl font-bold line-through text-gray-500">${{ product.basePrice.toFixed(2)
                  }}</span>
                </div>
                <!-- Otherwise just show base price -->
                <div v-else class="flex items-center gap-2">
                  <span class="text-2xl font-bold text-gray-900">${{ product.basePrice.toFixed(2) }}</span>
                  <!-- Show upcoming sale badge if sale starts within a week -->
                  <span v-if="product.sale && product.sale.onSale && isSaleUpcoming(product.sale)"
                    class=" inline-flex items-center self-start px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    Sale Soon
                  </span>
                </div>
              </div>

              <!-- Sale information under price -->
              <div v-if="product.sale && product.sale.onSale" class="mt-2 text-sm">
                <!-- For active sales -->
                <div v-if="isSaleActive(product.sale)" class="text-green-600">
                  Sale ends on {{ formatDate(product.sale.endDate.seconds * 1000) }}
                </div>
                <!-- For upcoming sales -->
                <div v-else-if="isSaleUpcoming(product.sale)" class="text-yellow-600">
                  Sale starts in {{ getDaysUntilSale(product.sale) }} days ({{ formatDate(product.sale.startDate.seconds
                    * 1000)
                  }})
                </div>
              </div>
            </div>

            <div class="flex items-center">
              <span class="text-gray-600">Stock:</span>
              <div v-if="product.stockQuantity !== undefined && product.stockQuantity <= 10">
                <span class="ml-2 text-lg font-semibold text-red-600">{{ product.stockQuantity }}</span>
              </div>
              <div v-else>
                <span class="ml-2 text-lg font-semibold text-gray-900">{{ product.stockQuantity }}</span>
              </div>
            </div>
          </div>

          <!-- Description -->
          <p class="mt-4 text-gray-600">{{ product.description }}</p>

          <!-- Category as colored banner -->
          <div class="mt-3 flex flex-wrap gap-2 justify-center">
            <template v-if="product.category && product.category.length > 0">
              <span v-for="(cat, index) in product.category" :key="index"
                class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                {{ cat }}
              </span>
            </template>
            <template v-else>
              <span
                class="inline-flex items-center items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                Uncategorized
              </span>
            </template>
            <!-- <span
                class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                Uncategorized
              </span> -->
          </div>

          <!-- Variety Prices in a separate table -->
          <div v-if="product.varietyPrices && product.varietyPrices.length > 0" class="mt-6">
            <h2 class="text-xl font-semibold text-gray-900 mb-3">Variety Prices</h2>
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price
                    </th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="(variety, index) in product.varietyPrices" :key="index">
                    <td class="px-6 py-4 whitespace-nowrap">{{ variety.unit }}</td>
                    <td class="px-6 py-4 whitespace-nowrap">{{ variety.quantity }}</td>
                    <td class="px-6 py-4 whitespace-nowrap">${{ variety.discountPrice.toFixed(2) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Sales information in a separate table -->
          <!-- <div v-if="product.sale" class="mt-6">
            <h2 class="text-xl font-semibold text-gray-900 mb-3">Sale Information</h2>
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sale
                      Price</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start
                      Date</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Date
                    </th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr>
                    <td class="px-6 py-4 whitespace-nowrap">${{ product.sale.salePrice.toFixed(2) }}</td>
                    <td class="px-6 py-4 whitespace-nowrap">{{ new Date(product.sale.startDate.seconds *
                      1000).toLocaleDateString() }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">{{ new Date(product.sale.endDate.seconds *
                      1000).toLocaleDateString() }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div> -->


          <div v-if="product.sale" class="mt-6">
            <h2 class="text-xl font-semibold text-gray-900 mb-3">Sale Information</h2>
            <div class="bg-red-50 border border-red-100 rounded-lg p-4">
              <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div class="flex items-center">
                  <span class="text-gray-700 font-medium">Sale Price:</span>
                  <span class="ml-2 text-red-600 font-bold text-xl">{{product.sale.salePrice.toFixed(2)}}</span>
                </div>

                <div class="flex flex-col md:flex-row gap-4 md:gap-8">
                  <div>
                    <span class="text-gray-700 font-medium">From:</span>
                    <span class="ml-2">{{ formatDate(product.sale.startDate.seconds * 1000) }}</span>
                  </div>

                  <div>
                    <span class="text-gray-700 font-medium">To:</span>
                    <span class="ml-2">{{ formatDate(product.sale.endDate.seconds * 1000) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Buttons -->
        <div class="flex justify-between p-8">
          <button @click="goBack" class="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded">
            Back
          </button>
          <button @click="editProduct"
            class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded flex items-center">
            <PencilIcon class="w-4 h-4 mr-2" />
            Edit Product
          </button>
        </div>
      </div>
    </div>

    <div v-else class="text-center py-8">
      <p class="text-xl text-gray-600">Loading product details...</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProductStore } from '@/stores/productStore'
import { Carousel } from 'flowbite'
import { PencilIcon, ArrowLeftIcon } from 'lucide-vue-next';

const route = useRoute()
const router = useRouter()
const productStore = useProductStore();
const productId = ref(null);
const product = ref(null)
const carouselInstance = ref(null)

const goBack = () => {
  // router.go(-1)
  router.push(`/administrator/products`);
}
const editProduct = () => {
  console.log("will edit the product:", productId);
  router.push(`/administrator/products/${productId.value}/edit`);
};

const handleImageError = (event, imageId) => {
  console.error(`Failed to load image: ${imageId}`)
  event.target.src = '/placeholder.svg?height=400&width=400'
}

const formatDate = (timestamp) => {
  const date = new Date(timestamp)
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  const month = months[date.getMonth()]
  const day = date.getDate()
  const year = date.getFullYear()

  return `${month} ${day}, ${year}`
}


// Check if a sale is currently active
const isSaleActive = (sale) => {
  if (!sale) return false

  const now = Date.now()
  const startDate = sale.startDate.seconds * 1000
  const endDate = sale.endDate.seconds * 1000

  return now >= startDate && now <= endDate
}

// Check if a sale is upcoming within a week
const isSaleUpcoming = (sale) => {
  if (!sale) return false

  const now = Date.now()
  const startDate = sale.startDate.seconds * 1000
  const endDate = sale.endDate.seconds * 1000

  // Sale hasn't started yet
  if (now < startDate) {
    // Calculate days until sale starts
    const daysUntil = Math.ceil((startDate - now) / (1000 * 60 * 60 * 24))
    // Return true if sale starts within 7 days
    return daysUntil <= 7
  }

  return false
}

// Get number of days until sale starts
const getDaysUntilSale = (sale) => {
  if (!sale) return 0

  const now = Date.now()
  const startDate = sale.startDate.seconds * 1000

  return Math.ceil((startDate - now) / (1000 * 60 * 60 * 24))
}


const initializeCarousel = () => {

  const images = ref([]);
  const indicators = ref([]);

  if (product.value.imageUrls && product.value.imageUrls.length >= 1) {
    // Create arrays for images and indicators
    for (let i = 0; i < product.value.imageUrls.length; i++) {
      images.value.push({
        position: i,
        el: document.getElementById(`image-${i + 1}`)
      });

      indicators.value.push({
        position: i,
        el: document.getElementById(`carousel-indicator-${i + 1}`)
      });
    }
  }

  // console.log('images', images.value);
  // console.log('indicators', indicators.value);

  const carouselElement = document.getElementById('product-carousel');


  if (!carouselElement) return

  const items = images.value


  // Configure carousel based on number of images
  const options = {
    defaultPosition: 0,
    indicators: product.value.imageUrls.length > 1,
    interval: product.value.imageUrls.length > 1 ? 3000 : 0,

    indicators: {
      activeClasses: 'bg-white dark:bg-gray-800',
      inactiveClasses:
        'bg-white/50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800',
      items: indicators.value,
    },

    // // callback functions
    // onNext: () => {
    //   console.log('next slider item is shown');
    // },
    // onPrev: () => {
    //   console.log('previous slider item is shown');
    // },
    // onChange: () => {
    //   console.log('new slider item has been shown');
    // },
  }

  // instance options object
  const instanceOptions = {
    id: 'product-carousel',
    override: true
  };


  try {
    carouselInstance.value = new Carousel(carouselElement, items, options, instanceOptions)

    // Only set up controls if there are multiple images
    if (product.value.imageUrls.length > 1) {
      // Set up prev/next buttons
      const prevButton = document.getElementById('data-carousel-prev')
      const nextButton = document.getElementById('data-carousel-next')

      prevButton?.addEventListener('click', () => carouselInstance.value.prev())
      nextButton?.addEventListener('click', () => carouselInstance.value.next())

      // Start auto-cycling
      // carouselInstance.value.cycle()
    }
  } catch (error) {
    console.error('Error initializing carousel:', error)
  }
}

onMounted(async () => {
  productId.value = route.params.id;

  product.value = await productStore.getProductById(productId.value)

  console.log('product:', product.value);
  console.log('product cat:', product.value.category);

  if (product.value && product.value.imageUrls?.length > 0) {
    // Wait for the DOM to be updated
    await nextTick()
    setTimeout(initializeCarousel, 0)
  }
})

onUnmounted(() => {
  // Clean up event listeners and carousel instance
  if (carouselInstance.value) {
    const prevButton = document.getElementById('data-carousel-prev')
    const nextButton = document.getElementById('data-carousel-next')

    prevButton?.removeEventListener('click', () => carouselInstance.value.prev())
    nextButton?.removeEventListener('click', () => carouselInstance.value.next())
  }
})
</script>
