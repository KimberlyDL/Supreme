<template>
    <div v-if="isOpen" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full" id="my-modal">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3 text-center">
          <h3 class="text-lg leading-6 font-medium text-gray-900">{{ isEditing ? 'Edit Product' : 'Add New Product' }}</h3>
          <form @submit.prevent="handleSubmit" class="mt-2 text-left">
            <div class="mb-4 text-center">
              <label class="block text-sm font-medium text-gray-700">Product Image</label>
              <div class="mt-2 inline-block w-64 h-64 border-2 border-gray-300 rounded-md">
                <img :src="imagePreview || '/placeholder.svg?height=256&width=256'" alt="Product image preview"
                  class="w-full h-full object-cover rounded-md">
              </div>
              <input type="file" @change="handleImageChange" accept="image/*" class="mt-1 block w-full">
            </div>
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700">Name</label>
              <input v-model="productForm.name" type="text" required
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50">
            </div>
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700">Description</label>
              <textarea v-model="productForm.description"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"></textarea>
            </div>
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700">Base Price</label>
              <input v-model.number="productForm.basePrice" type="number" step="0.01" required
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50">
            </div>
            <div class="mb-4">
              <h3 class="text-lg font-medium mb-2">Variety Prices</h3>
              <div class="flex justify-end">
                <button @click.prevent="addVarietyPrice" type="button"
                  class="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
                  Add Variety Price
                </button>
              </div>
              <div v-for="(price, index) in productForm.varietyPrices" :key="index" class="flex items-center gap-2 mt-2">
                <input v-model="price.unit" placeholder="Unit"
                  class="flex-1 rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50">
                <input v-model.number="price.quantity" type="number" placeholder="Quantity"
                  class="flex-1 rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50">
                <input v-model.number="price.discountPrice" type="number" step="0.01" placeholder="Discount Price"
                  class="flex-1 rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50">
                <button @click.prevent="removeVarietyPrice(index)" type="button"
                  class="p-2 text-destructive hover:text-destructive/90">
                  <TrashIcon class="h-5 w-5" />
                </button>
              </div>
            </div>
            <div class="flex justify-end space-x-2">
              <button @click="closeModal" type="button" class="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">
                Cancel
              </button>
              <button type="submit" class="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
                {{ isEditing ? 'Update Product' : 'Add Product' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, watch } from 'vue';
  import { TrashIcon } from '@heroicons/vue/24/solid';
  
  const props = defineProps({
    isOpen: Boolean,
    isEditing: Boolean,
    initialProduct: Object,
  });
  
  const emit = defineEmits(['close', 'submit']);
  
  const productForm = ref({
    name: '',
    description: '',
    basePrice: 0,
    varietyPrices: [],
  });
  
  const productImage = ref(null);
  const imagePreview = ref(null);
  
  watch(() => props.initialProduct, (newValue) => {
    if (newValue) {
      productForm.value = { ...newValue };
      imagePreview.value = newValue.imageUrl;
    }
  }, { immediate: true });
  
  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      productImage.value = file;
      const reader = new FileReader();
      reader.onload = (e) => {
        imagePreview.value = e.target.result;
      };
      reader.readAsDataURL(file);
    } else {
      productImage.value = null;
      imagePreview.value = null;
    }
  };
  
  const addVarietyPrice = () => {
    productForm.value.varietyPrices.push({ unit: '', quantity: 0, discountPrice: 0 });
  };
  
  const removeVarietyPrice = (index) => {
    productForm.value.varietyPrices.splice(index, 1);
  };
  
  const handleSubmit = () => {
    emit('submit', { ...productForm.value, image: productImage.value });
  };
  
  const closeModal = () => {
    emit('close');
  };
  </script>