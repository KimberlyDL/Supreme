<!-- frontend\src\views\admin\products\ProductDetails.vue -->
<template>
  <div class="container mx-auto px-4 py-8">
    <div v-if="product" class="bg-white shadow-lg rounded-lg overflow-hidden">
      <div class="md:flex flex-col md:flex-row">
        <div class="md:w-1/2">
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
        <div class="md:w-1/2 p-8">
          <div class="uppercase tracking-wide text-sm text-indigo-500 font-semibold">{{ product.category }}</div>
          <h1 class="mt-1 text-4xl font-bold text-gray-900">{{ product.name }}</h1>
          <p class="mt-2 text-gray-600">{{ product.description }}</p>
          <div class="mt-4">
            <span class="text-gray-600">Base Price:</span>
            <span class="ml-2 text-2xl font-bold text-gray-900">${{ product.basePrice.toFixed(2) }}</span>
          </div>
          <div class="mt-4">
            <span class="text-gray-600">Stock Quantity:</span>
            <span class="ml-2 text-lg font-semibold text-gray-900">{{ product.stockQuantity }}</span>
          </div>

          <!-- Variety Prices and Sales -->
          <div v-if="product.varietyPrices && product.varietyPrices.length > 0" class="mt-6">
            <h2 class="text-xl font-semibold text-gray-900 mb-3">Variety Prices and Sales</h2>
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sales
                    </th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="(variety, index) in product.varietyPrices" :key="index">
                    <td class="px-6 py-4 whitespace-nowrap">{{ variety.unit }}</td>
                    <td class="px-6 py-4 whitespace-nowrap">{{ variety.quantity }}</td>
                    <td class="px-6 py-4 whitespace-nowrap">${{ variety.discountPrice.toFixed(2) }}</td>
                    <td class="px-6 py-4 whitespace-nowrap">{{ variety.sales || 0 }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- Buttons -->
      <div class="flex justify-between p-8">
        <button @click="goBack" class="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded">
          Back
        </button>
        <button @click="editProduct" class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
          Edit Product
        </button>
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

const route = useRoute()
const router = useRouter()
const productStore = useProductStore()
const product = ref(null)
const carouselInstance = ref(null)

const goBack = () => {
  router.go(-1)
}

const editProduct = () => {
  console.log('Edit product:', product.value.id)
}

const handleImageError = (event, imageId) => {
  console.error(`Failed to load image: ${imageId}`)
  event.target.src = '/placeholder.svg?height=400&width=400'
}

const initializeCarousel = () => {

  const images = ref([]);
  const indicators = ref([]);

  // let i = 1;
  // if (product.value.imageUrls && product.value.imageUrls.length >= 1) {
  //   do {
  //     images.value.push({
  //       position: i - 1,
  //       el: document.getElementById(`image-${i}`)
  //     });

  //     indicators.value.push({
  //       position: i - 1,
  //       el: document.getElementById(`carousel-indicator-${i}`)
  //     });
  //     i++
  //   } while (i < product.value.imageUrls.length);
  // }

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

  console.log('images', images.value);
  console.log('indicators', indicators.value);

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

    // callback functions
    onNext: () => {
      console.log('next slider item is shown');
    },
    onPrev: () => {
      console.log('previous slider item is shown');
    },
    onChange: () => {
      console.log('new slider item has been shown');
    },
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
  const productId = route.params.id
  product.value = await productStore.getProductById(productId)

  console.log('Product:', product.value);

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