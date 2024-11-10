<!-- frontend\src\components\shared\FormModal.vue -->
<template>
    <div v-if="isOpen" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full" id="my-modal">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3 text-center">
          <h3 class="text-lg leading-6 font-medium text-gray-900">{{ isEditing ? editHeaderName : addHeaderName }}</h3>
          <form @submit.prevent="handleSubmit" class="mt-2 text-left">
            <div class="flex justify-end space-x-2">
              <button @click="closeModal" type="button" class="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">
                Cancel
              </button>
              <button type="submit" class="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
                {{ isEditing ? editHeaderName : addHeaderName }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  const props = defineProps({
    isOpen: Boolean,
    isEditing: Boolean,
    editHeaderName: String,
    addHeaderName: String,
  });
  
  const emit = defineEmits(['close', 'submit']);
    
  const handleSubmit = () => {
    emit('submit');
  };
  
  const closeModal = () => {
    emit('close');
  };
  </script>