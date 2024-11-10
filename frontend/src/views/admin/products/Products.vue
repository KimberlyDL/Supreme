<template>
  <div class="container mx-auto">
    <h1 class="text-2xl font-bold mb-4">Product Management</h1>

    <!-- Add Product Button -->
    <button @click="openAddModal" class="mb-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
      Add New Product
    </button>

    <!-- Loading and Error States -->
    <div v-if="productStore.loading" class="text-center py-4">
      Loading products...
    </div>
    <div v-if="productStore.error" class="text-center py-4 text-destructive">
      {{ productStore.error }}
    </div>

    <!-- Product List -->
    <div v-if="!productStore.loading && !productStore.error" class="bg-white shadow overflow-hidden sm:rounded-md">
      <ul class="divide-y divide-gray-200">
        <li v-for="product in productStore.products" :key="product.id" class="px-4 py-4 sm:px-6">
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <img v-if="product.imageUrl" :src="product.imageUrl" alt="Product image"
                class="w-16 h-16 object-cover rounded-md mr-4">
              <div>
                <p class="text-sm font-medium text-primary truncate">{{ product.name }}</p>
                <p class="mt-1 text-sm text-gray-500">{{ product.description }}</p>
                <p class="mt-1 text-sm font-semibold">Base Price: ${{ product.basePrice.toFixed(2) }}</p>
                <div v-if="product.varietyPrices && product.varietyPrices.length > 0" class="mt-1">
                  <p class="text-xs text-gray-500">Variety Prices:</p>
                  <ul class="list-disc list-inside">
                    <li v-for="(price, index) in product.varietyPrices" :key="index" class="text-xs text-gray-500">
                      {{ price.unit }} - {{ price.quantity }} - ${{ price.discountPrice.toFixed(2) }}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div class="flex items-center space-x-2">
              <button @click="openEditModal(product)" class="p-2 text-primary hover:text-primary/90">
                <PencilIcon class="h-5 w-5" />
              </button>
              <button @click="deleteProduct(product.id)" class="p-2 text-destructive hover:text-destructive/90">
                <TrashIcon class="h-5 w-5" />
              </button>
            </div>
          </div>
        </li>
      </ul>
    </div>

    <!-- Add/Edit Product Modal -->
    <AddProductModal
      :isOpen="isModalOpen"
      :isEditing="isEditing"
      :initialProduct="editingProduct"
      @close="closeModal"
      @submit="handleSubmit"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useProductStore } from '@/stores/productStore';
import { PencilIcon, TrashIcon } from '@heroicons/vue/24/solid';
import AddProductModal from './AddProductModal.vue';

const productStore = useProductStore();

const isModalOpen = ref(false);
const isEditing = ref(false);
const editingProduct = ref(null);

const openAddModal = () => {
  isEditing.value = false;
  editingProduct.value = null;
  isModalOpen.value = true;
};

const openEditModal = (product) => {
  isEditing.value = true;
  editingProduct.value = { ...product };
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
  isEditing.value = false;
  editingProduct.value = null;
};

const handleSubmit = async (formData) => {
  try {
    if (isEditing.value) {
      await productStore.updateProduct(editingProduct.value.id, formData, formData.image);
    } else {
      await productStore.addProduct(formData, formData.image);
    }
    closeModal();
  } catch (error) {
    console.error('Error submitting product:', error);
    // Handle error (e.g., show error message to user)
  }
};

const deleteProduct = async (productId) => {
  if (confirm('Are you sure you want to delete this product?')) {
    try {
      await productStore.deleteProduct(productId);
    } catch (error) {
      console.error('Error deleting product:', error);
      // Handle error (e.g., show error message to user)
    }
  }
};

onMounted(() => {
  productStore.setupRealtimeProducts();
});

onUnmounted(() => {
  productStore.clearRealtimeProducts();
});
</script>