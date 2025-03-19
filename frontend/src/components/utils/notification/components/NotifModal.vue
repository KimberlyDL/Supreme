<template>
  <!-- Modal Content Only, without Overlay -->
  <div :class="['p-4 mb-4 rounded-sm max-w-md w-full mx-4 relative', themeClasses]" role="alert">
    <!-- Close Button -->
    <button @click="closeModal" :class="['absolute top-2 right-2 bg-transparent border-none', closeButtonClasses]">
      <svg class="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor"
        viewBox="0 0 20 20">
        <path
          d="M14.348 5.652a1 1 0 0 0-1.415 0L10 8.586 7.067 5.652a1 1 0 0 0-1.415 1.415L8.586 10l-2.934 2.933a1 1 0 1 0 1.415 1.415L10 11.414l2.933 2.934a1 1 0 0 0 1.415-1.415L11.414 10l2.934-2.933a1 1 0 0 0 0-1.415z" />
      </svg>
    </button>

    <!-- Modal Header with Icon and Title -->
    <div class="flex items-center">
      <svg :class="['flex-shrink-0 w-4 h-4 me-2', iconClasses]" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
        fill="currentColor" viewBox="0 0 20 20">
        <path
          d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
      </svg>
      <span class="sr-only">Info</span>
      <h3 class="text-lg font-medium">{{ title }}</h3>
    </div>

    <!-- Modal Body with Message -->
    <div class="mt-2 text-sm">
      {{ message }}
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

// Define props for title, message, and theme
const props = defineProps({
  title: { type: String, default: "Notification" },
  message: { type: String, required: true },
  visible: { type: Boolean, default: false },
  theme: { type: String, default: "default" }, // Added theme prop
});

const emit = defineEmits(["close"]);

const closeModal = () => {
  emit("close");
};

// Dynamic classes based on the theme
const themeClasses = computed(() => {
  switch (props.theme) {
    case "success":
      return "text-green-800 border-green-300 bg-green-50 dark:bg-green-900 dark:text-green-300 dark:border-green-800";
    case "warning":
      return "text-yellow-800 border-yellow-300 bg-yellow-50 dark:bg-yellow-900 dark:text-yellow-300 dark:border-yellow-800";
    case "danger":
      return "text-red-800 border-red-300 bg-red-50 dark:bg-red-900 dark:text-red-300 dark:border-red-800";
    case "normal":
      return "text-primary border-primary bg-gray-50 dark:bg-gray-800 dark:text-primary dark:border-primary";
    default:
      return "text-blue-800 border-blue-300 bg-blue-50 dark:bg-gray-800 dark:text-blue-400 dark:border-blue-800";
  }
});

// Close button color based on the theme
const closeButtonClasses = computed(() => {
  switch (props.theme) {
    case "success":
      return "text-green-800 hover:text-green-900 dark:text-green-300 dark:hover:text-green-400";
    case "warning":
      return "text-yellow-800 hover:text-yellow-900 dark:text-yellow-300 dark:hover:text-yellow-400";
    case "danger":
      return "text-red-800 hover:text-red-900 dark:text-red-300 dark:hover:text-red-400";
    case "normal":
      return "text-primary hover:text-primary-dark dark:text-primary dark:hover:text-primary-light";
    default:
      return "text-blue-800 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300";
  }
});

// Icon color based on the theme
const iconClasses = computed(() => {
  switch (props.theme) {
    case "success":
      return "text-green-800 dark:text-green-300";
    case "warning":
      return "text-yellow-800 dark:text-yellow-300";
    case "danger":
      return "text-red-800 dark:text-red-300";
    case "normal":
      return "text-primary dark:text-primary";
    default:
      return "text-blue-800 dark:text-blue-400";
  }
});
</script>

<style scoped>
/* Optional custom styles */
</style>