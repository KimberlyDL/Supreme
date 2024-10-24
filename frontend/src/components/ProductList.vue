<template>
  <div class="min-h-screen bg-gray-100 p-8">
    <div class="max-w-6xl mx-auto">
      <h1 class="text-3xl font-bold mb-8">Product Management</h1>

      <!-- Product List -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl font-semibold">Products</h2>
          <button @click="toggleForm" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center">
            <PlusIcon class="w-5 h-5 mr-2" />
            Add Product
          </button>
        </div>

        <!-- Products Display Table -->
        <div v-if="products.length > 0">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="product in products" :key="product.id">
                <td class="px-6 py-4 whitespace-nowrap">
                  <img :src="product.imageUrl" alt="Product Image" class="w-16 h-16 object-cover rounded-md">
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">{{ product.name }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-500">{{ product.description }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-500">₱{{ product.price }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-500">{{ product.quantity }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right">
                  <div class="flex space-x-3">
                    <button @click="editProduct(product)" class="text-blue-500 hover:text-blue-600 flex items-center">
                      <EditIcon class="w-5 h-5 mr-1" /> Edit
                    </button>
                    <button @click="deleteProduct(product.id)" class="text-red-500 hover:text-red-600 flex items-center">
                      <TrashIcon class="w-5 h-5 mr-1" /> Delete
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p v-else class="text-gray-500">No products available.</p>
      </div>

      <!-- Product Form (Toggle) -->
      <div v-if="showForm" class="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-end">
        <div class="bg-white w-96 h-full p-6 shadow-xl">
          <h2 class="text-2xl font-bold mb-4">{{ selectedProduct ? 'Edit Product' : 'Add Product' }}</h2>
          <form @submit.prevent="submitProduct" class="space-y-4">
            <div class="mb-4">
              <label for="name" class="block text-sm font-medium text-gray-700">Product Name</label>
              <input v-model="currentProduct.name" type="text" id="name" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200">
            </div>
            <div class="mb-4">
              <label for="price" class="block text-sm font-medium text-gray-700">Price</label>
              <input v-model="currentProduct.price" type="number" step="0.01" id="price" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200">
            </div>
            <div class="mb-4">
              <label for="quantity" class="block text-sm font-medium text-gray-700">Quantity</label>
              <input v-model="currentProduct.quantity" type="number" id="quantity" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200">
            </div>
            <div class="mb-4">
              <label for="description" class="block text-sm font-medium text-gray-700">Description</label>
              <textarea v-model="currentProduct.description" id="description" rows="3" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"></textarea>
            </div>
            <div class="mb-4">
              <label for="image" class="block text-sm font-medium text-gray-700">Product Image</label>
              <input type="file" @change="handleFileUpload" class="mt-1 block w-full">
            </div>
            <div class="flex justify-between mt-6">
              <button type="button" @click="toggleForm" class="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md">Cancel</button>
              <button type="submit" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md">{{ selectedProduct ? 'Update Product' : 'Create Product' }}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { PlusIcon, EditIcon, TrashIcon } from 'lucide-vue-next'
import { getProducts, deleteProduct, createProduct, updateProduct } from '@/services/api'

const products = ref([])
const showForm = ref(false)
const selectedProduct = ref(null)
const currentProduct = reactive({
  name: '',
  price: 0,
  quantity: 0,
  description: '',
  image: null,
})

const fetchProducts = async () => {
  products.value = await getProducts()
}

const deleteProductHandler = async (id) => {
  await deleteProduct(id)
  fetchProducts()
}

const editProduct = (product) => {
  selectedProduct.value = product
  Object.assign(currentProduct, product)
  showForm.value = true
}

const toggleForm = () => {
  showForm.value = !showForm.value
  if (!showForm.value) resetForm()
}

const submitProduct = async () => {
  const formData = new FormData()
  formData.append('name', currentProduct.name)
  formData.append('price', currentProduct.price)
  formData.append('quantity', currentProduct.quantity)
  formData.append('description', currentProduct.description)
  if (currentProduct.image) {
    formData.append('image', currentProduct.image)
  }

  if (selectedProduct.value) {
    await updateProduct(selectedProduct.value.id, formData)
  } else {
    await createProduct(formData)
  }

  fetchProducts()
  toggleForm()
}

const handleFileUpload = (event) => {
  currentProduct.image = event.target.files[0]
}

const resetForm = () => {
  selectedProduct.value = null
  Object.assign(currentProduct, { name: '', price: 0, quantity: 0, description: '', image: null })
}

fetchProducts()
</script>
