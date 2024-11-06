<template>
    <div>
      <Navigation />
      <div class="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
    <div class="max-w-7xl mx-auto">
      <h1 class="text-3xl font-extrabold text-gray-900 mb-6">Product Catalog</h1>
      
      <!-- Product Grid -->
      <div v-if="products.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <div v-for="product in products" :key="product.id" 
             class="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transition-transform duration-300 hover:scale-105"
             @click="openProductModal(product)">
          <img :src="product.imageUrl" :alt="product.name" class="w-full h-48 object-cover" />
          <div class="p-4">
            <h2 class="text-lg font-semibold text-gray-800">{{ product.name }}</h2>
            <p class="text-gray-600 mt-2">{{ product.description }}</p>
            <div class="mt-4 flex items-center justify-between">
              <span class="text-indigo-600 font-bold">₱{{ product.price }}</span>
              <span class="text-sm text-gray-500">{{ product.quantity }} in stock</span>
            </div>
          </div>
        </div>
      </div>
      <p v-else class="text-gray-500">No products available.</p>

      <!-- Product Modal -->
      <div v-if="selectedProduct" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full overflow-hidden">
          <div class="relative">
            <img :src="selectedProduct.imageUrl" :alt="selectedProduct.name" class="w-full h-64 object-cover" />
            <button @click="closeProductModal" class="absolute top-2 right-2 bg-white rounded-full p-2 hover:bg-gray-100">
              <XIcon class="h-6 w-6 text-gray-600" />
            </button>
          </div>
          <div class="p-6">
            <h2 class="text-2xl font-bold text-gray-800 mb-2">{{ selectedProduct.name }}</h2>
            <p class="text-gray-600 mb-4">{{ selectedProduct.description }}</p>
            <div class="flex items-center justify-between">
              <span class="text-2xl font-bold text-indigo-600">₱{{ selectedProduct.price }}</span>
              <span class="text-sm font-medium text-gray-500">{{ selectedProduct.quantity }} in stock</span>
            </div>
            <button class="mt-6 w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition duration-300">
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
      <Footer />
    </div>
  </template>
  
  <script setup>
import { ref, onMounted } from 'vue'
import { XIcon } from 'lucide-vue-next'
import { getProducts } from '@/services/api'  // Import your API call
import Navigation from '@/components/Navigation.vue';
import Footer from '@/components/Footer.vue'


// Fetch products from the database
const products = ref([])
const selectedProduct = ref(null)

const fetchProducts = async () => {
  try {
    products.value = await getProducts()  // Replace with API call
  } catch (error) {
    console.error("Failed to load products:", error)
  }
}

const openProductModal = (product) => {
  selectedProduct.value = product
}

const closeProductModal = () => {
  selectedProduct.value = null
}

onMounted(() => {
  fetchProducts()
})
  </script>