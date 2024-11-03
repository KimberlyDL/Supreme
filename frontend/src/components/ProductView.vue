<template>
    <div class="min-h-screen bg-gray-100 p-8">
      <div class="max-w-6xl mx-auto">
        <h1 class="text-3xl font-bold mb-8">Product Management</h1>
  
        <!-- Add/Edit Product Form -->
        <div v-if="showForm" class="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-end">
          <div class="bg-white w-full max-w-md h-full p-6 shadow-xl overflow-y-auto">
            <h2 class="text-2xl font-bold mb-6">{{ isEditing ? 'Edit Product' : 'Add Product' }}</h2>
            <form @submit.prevent="submitProduct" class="space-y-6">
              <div class="grid grid-cols-3 gap-4 items-center">
                <label for="name" class="text-sm font-medium text-gray-700">Product Name</label>
                <input v-model="currentProduct.name" type="text" id="name" required class="col-span-2 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200">
              </div>
              <div class="grid grid-cols-3 gap-4 items-center">
                <label for="price" class="text-sm font-medium text-gray-700">Price</label>
                <input v-model="currentProduct.price" type="number" step="0.01" id="price" required class="col-span-2 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200">
              </div>
              <div class="grid grid-cols-3 gap-4 items-center">
                <label for="quantity" class="text-sm font-medium text-gray-700">Quantity</label>
                <input v-model="currentProduct.quantity" type="number" id="quantity" required class="col-span-2 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200">
              </div>
              <div class="grid grid-cols-3 gap-4 items-start">
                <label for="description" class="text-sm font-medium text-gray-700 pt-2">Description</label>
                <textarea v-model="currentProduct.description" id="description" rows="3" required class="col-span-2 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"></textarea>
              </div>
              <div class="grid grid-cols-3 gap-4 items-center">
                <label for="image" class="text-sm font-medium text-gray-700">Product Image</label>
                <input type="file" @change="handleFileUpload" class="col-span-2 mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100">
                <!-- Display the existing or newly uploaded image -->
                <img v-if="imagePreview" :src="imagePreview" alt="Product Image" class="w-16 h-16 object-cover rounded-md mt-2" />
                <p v-else-if="currentProduct.imageUrl" class="text-sm text-gray-500 mt-2">Current Image: <img :src="currentProduct.imageUrl" alt="Current Product Image" class="w-16 h-16 object-cover rounded-md" /></p>
              </div>
              <div class="flex justify-between mt-6">
                <button type="button" @click="toggleForm" class="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md">Cancel</button>
                <button type="submit" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md">{{ isEditing ? 'Update Product' : 'Create Product' }}</button>
              </div>
            </form>
          </div>
        </div>
  
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
                      <button @click="deleteProductHandler(product.id)" class="text-red-500 hover:text-red-600 flex items-center">
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
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, reactive } from 'vue';
  import { PlusIcon, EditIcon, TrashIcon } from 'lucide-vue-next';
  import { getProducts, deleteProduct, createProduct, updateProduct } from '@/services/api';
  
  const products = ref([]);
  const showForm = ref(false);
  const isEditing = ref(false);
  const selectedProduct = ref(null);
  const currentProduct = reactive({
    id: null,  // Store the product ID for updates
    name: '',
    price: 0,
    quantity: 0,
    description: '',
    imageUrl: null,
  });
  
  // Image preview for newly uploaded files
  const imagePreview = ref(null);
  
  const fetchProducts = async () => {
    products.value = await getProducts();
  };
  
  const deleteProductHandler = async (id) => {
    await deleteProduct(id);
    fetchProducts();
  };
  
  const editProduct = (product) => {
    selectedProduct.value = product;
    // Populate currentProduct with product details, preserving imageUrl
    currentProduct.id = product.id; // Ensure we have the ID for updating
    currentProduct.name = product.name;
    currentProduct.price = product.price;
    currentProduct.quantity = product.quantity;
    currentProduct.description = product.description;
    currentProduct.imageUrl = product.imageUrl; // Retain the existing image URL
    imagePreview.value = product.imageUrl; // Show the current product's image in the preview
    isEditing.value = true;
    showForm.value = true;
  };
  
  const toggleForm = () => {
    showForm.value = !showForm.value;
    if (!showForm.value) resetForm();
  };
  
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        imagePreview.value = e.target.result; // Show uploaded image
      };
      reader.readAsDataURL(file);
      currentProduct.imageUrl = file; // Store the file for upload
    }
  };
  
  const resetForm = () => {
    currentProduct.id = null;
    currentProduct.name = '';
    currentProduct.price = 0;
    currentProduct.quantity = 0;
    currentProduct.description = '';
    currentProduct.imageUrl = null; // Reset image URL
    imagePreview.value = null; // Clear image preview
    isEditing.value = false;
  };
  
  const submitProduct = async () => {
    const formData = new FormData();
    formData.append('name', currentProduct.name);
    formData.append('price', currentProduct.price);
    formData.append('quantity', currentProduct.quantity);
    formData.append('description', currentProduct.description);
    
    // Only append a new image if it has been uploaded; otherwise, retain the existing image URL
    if (currentProduct.imageUrl instanceof File) {
      formData.append('image', currentProduct.imageUrl);
    } else if (isEditing.value) {
      // If editing, retain the existing image URL
      formData.append('imageUrl', currentProduct.imageUrl);
    }
  
    if (isEditing.value) {
      await updateProduct(currentProduct.id, formData);
    } else {
      await createProduct(formData);
    }
  
    resetForm();
    fetchProducts();
    toggleForm();
  };
  
  // Fetch products on component mount
  fetchProducts();
  </script>
  
  <style scoped>
  /* Add your custom styles here */
  </style>
  