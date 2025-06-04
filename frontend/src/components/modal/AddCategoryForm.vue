<!-- frontend\src\components\modal\AddCategoryForm.vue -->
<template>
  <div class="p-4 sm:p-6 max-w-md mx-auto">
    <div class="text-center mb-6">
      <h3 class="text-xl font-semibold text-tBase-100">Add New Category</h3>
      <p class="text-sm text-gray-500 mt-1">Create a new product category</p>
    </div>

    <form @submit.prevent="submitForm">
      <div class="mb-4">
        <label for="categoryName" class="block text-sm font-medium text-tBase-100 mb-1">Category Name</label>
        <input type="text" id="categoryName" v-model="form.name"
          class="w-full p-2.5 text-sm text-tBase-100 bg-bgSecondary-0 rounded-lg border border-gray-300 focus:ring-primary-500 focus:border-primary-500"
          placeholder="Enter category name" required />
        <p v-if="errors.name" class="mt-1 text-sm text-danger-500">{{ errors.name }}</p>
      </div>

      <div class="mb-4">
        <label for="categoryDescription" class="block text-sm font-medium text-tBase-100 mb-1">Description
          (Optional)</label>
        <textarea id="categoryDescription" v-model="form.description" rows="3"
          class="w-full p-2.5 text-sm text-tBase-100 bg-bgSecondary-0 rounded-lg border border-gray-300 focus:ring-primary-500 focus:border-primary-500"
          placeholder="Enter category description"></textarea>
      </div>

      <div class="flex items-center mb-4">
        <input type="checkbox" id="isActive" v-model="form.isActive"
          class="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500" />
        <label for="isActive" class="ml-2 text-sm font-medium text-tBase-100">Active</label>
      </div>

      <div class="flex justify-end gap-2 mt-6">
        <button type="button" @click="$emit('onCancel')"
          class="px-4 py-2 text-sm font-medium text-tBase-100 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 focus:ring-4 focus:ring-gray-200">
          Cancel
        </button>
        <button type="submit"
          class="px-4 py-2 text-sm font-medium text-white bg-primary-500 rounded-lg hover:bg-primary-600 focus:ring-4 focus:ring-primary-300"
          :disabled="isSubmitting">
          <span v-if="isSubmitting">Saving...</span>
          <span v-else>Save Category</span>
        </button>
      </div>
    </form>
  </div>
</template>

  <script setup>
  import { ref } from 'vue';
  import { useCategoryStore } from '@/stores/categoryStore';
  const categoryStore = useCategoryStore();

  const emit = defineEmits(['onSuccess', 'onCancel']);

  const form = ref({
    name: '',
    description: '',
    isActive: true
  });

  const errors = ref({});
  const isSubmitting = ref(false);

  const validateForm = () => {
    errors.value = {};

    if (!form.value.name.trim()) {
      errors.value.name = 'Category name is required';
      return false;
    }

    return true;
  };

  const submitForm = async () => {
    if (!validateForm()) return;

    isSubmitting.value = true;
    try {
      await categoryStore.addCategory(form.value);
      emit('onSuccess');
      
    } catch (error) {
      const msg = error.error;
      errors.value.general = error.formError? msg : ""
    } finally {
      isSubmitting.value = false;
    }
  };
</script>
