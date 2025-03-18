<!-- frontend\src\components\modal\AddCategoryForm.vue -->
<template>
  <div v-if="isOpen" class="bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
    <div class="relative mx-auto p-5 w-96 bg-white">
      <div class="mt-3">
        <h3 class="text-lg font-medium text-gray-900 text-center mb-4">
          {{ isEditing ? 'Edit Category' : 'Add New Category' }}
        </h3>
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Category Name</label>
            <input v-model="categoryForm.name" type="text" required
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50">
          </div>
          <div class="flex justify-end space-x-2 pt-4">
            <button @click="closeModal" type="button"
              class="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">
              Cancel
            </button>
            <button type="submit" class="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
              {{ isEditing ? 'Update Category' : 'Add Category' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useCategoryStore } from '@/stores/categoryStore'

const props = defineProps({
  isOpen: Boolean,
  isEditing: Boolean,
  initialCategory: Object,
})

const emit = defineEmits(['submit', 'close'])
const categoryStore = useCategoryStore()

const categoryForm = ref({
  name: '',
})

watch(() => props.initialCategory, (newValue) => {
  if (newValue) {
    categoryForm.value = { ...newValue }
  }
}, { immediate: true })

const handleSubmit = async () => {
  try {
    const formData = {
      name: categoryForm.value.name
    }
    
    if (props.isEditing) {
      await categoryStore.updateCategory(props.initialCategory.id, formData)
    } else {
      await categoryStore.addCategory(formData)
    }
    
    emit('submit')
    emit('close')
  } catch (error) {
    console.error('Error submitting category:', error)
  }
}

const closeModal = () => {
  emit('close')
}
</script>