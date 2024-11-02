<template>
    <!-- Transition applied to both overlay and modal container -->
    <transition name="overlay-fade">
      <div v-if="isVisible" class="overlay fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <transition name="zoom-fade">
          <!-- Modal content with transition applied only to the modal box -->
          <div class="relative bg-white rounded-lg shadow dark:bg-gray-700 max-w-md w-full p-4 zoom-fade-content">
            <!-- Modal header -->
            <div class="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
              <h3 class="text-xl font-semibold text-gray-900 dark:text-white">{{ title }}</h3>
              <button
                @click="closeModal"
                class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
              >
                <svg class="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                  <path
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                  />
                </svg>
                <span class="sr-only">Close modal</span>
              </button>
            </div>
            <!-- Modal body -->
            <div class="p-4 md:p-5">
              <slot name="content"></slot>
            </div>
            <!-- Modal actions -->
            <div class="p-4 md:p-5 border-t dark:border-gray-600 flex justify-end space-x-2">
              <slot name="actions">
                <button @click="closeModal" class="px-4 py-2 bg-gray-500 text-white rounded-md">Close</button>
              </slot>
            </div>
          </div>
        </transition>
      </div>
    </transition>
  </template>
  
  <script setup>
  import { ref, defineProps, defineExpose } from 'vue';
  
  const props = defineProps({
    title: {
      type: String,
      default: 'Modal Title'
    }
  });
  
  const isVisible = ref(false);
  
  const openModal = () => {
    isVisible.value = true;
  };
  
  const closeModal = () => {
    isVisible.value = false;
  };
  
  defineExpose({ openModal, closeModal });
  </script>
  
  <style scoped>
  /* Overlay fade-in and fade-out */
  .overlay-fade-enter-active, .overlay-fade-leave-active {
    transition: opacity 0.3s ease;
  }
  .overlay-fade-enter-from, .overlay-fade-leave-to {
    opacity: 0;
  }
  
  /* Zoom-fade transition for modal content */
  .zoom-fade-enter-active, .zoom-fade-leave-active {
    transition: opacity 0.3s ease, transform 0.3s ease;
  }
  .zoom-fade-enter-from .zoom-fade-content, .zoom-fade-leave-to .zoom-fade-content {
    opacity: 0;
    transform: scale(0.9);
  }
  .zoom-fade-content {
    transition: opacity 0.3s ease, transform 0.3s ease;
  }
  
  /* Overlay background */
  .overlay {
    background-color: rgba(0, 0, 0, 0.5);
  }
  </style>
  