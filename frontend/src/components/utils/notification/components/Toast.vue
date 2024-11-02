<!-- frontend\src\components\utils\toast.vue -->
<template>
  <div
    v-if="visible"
    :class="[
      'flex items-center w-full max-w-xs py-2 px-4 rounded-sm shadow-lg transition-opacity duration-500 border',
      bgColor, borderColor
    ]"
    role="alert"
  >
    <!-- Icon Slot -->

    <div
      :class="['inline-flex items-center justify-center flex-shrink-0 w-8 h-8']"
    >
      <slot name="icon">
        <!-- Default icon if none is provided -->
        <svg class="w-8 h-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <path
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15.147 15.085a7.159 7.159 0 0 1-6.189 3.307A6.713 6.713 0 0 1 3.1 15.444c-2.679-4.513.287-8.737.888-9.548A4.373 4.373 0 0 0 5 1.608c1.287.953 6.445 3.218 5.537 10.5 1.5-1.122 2.706-3.01 2.853-6.14 1.433 1.049 3.993 5.395 1.757 9.117Z"
          />
        </svg>
      </slot>
      <span class="sr-only">{{ iconLabel }}</span>
    </div>


    <!-- <div
      :class="['inline-flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-lg', iconBgColor]"
    >
      <slot name="icon">
        <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 20">
          <path
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15.147 15.085a7.159 7.159 0 0 1-6.189 3.307A6.713 6.713 0 0 1 3.1 15.444c-2.679-4.513.287-8.737.888-9.548A4.373 4.373 0 0 0 5 1.608c1.287.953 6.445 3.218 5.537 10.5 1.5-1.122 2.706-3.01 2.853-6.14 1.433 1.049 3.993 5.395 1.757 9.117Z"
          />
        </svg>
      </slot>
      <span class="sr-only">{{ iconLabel }}</span>
    </div> -->

    <div class="ms-3 me-3 text-sm font-normal">{{ message }}</div>

    <button
      type="button"
        class="ml-auto -mx-1.5 -my-1.5 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 inline-flex items-center justify-center h-6 w-6 dark:text-gray-500 dark:hover:text-white"
      :class="closeButtonColor"
      @click="closeToast"
      aria-label="Close"
    >
      <span class="sr-only">Close</span>
      <svg class="w-2 h-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
        <path
          stroke="currentColor"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
        />
      </svg>
    </button>

  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import {defineEmits } from "vue";

const props = defineProps({
  message: { type: String, default: "Set yourself free." },
  duration: { type: Number, default: 5000 }, // default fade-out time
  type: { type: String, default: "info" },
  bgColor: { type: String, default: "bg-white text-gray-500 dark:bg-gray-800 dark:text-gray-400" },
  iconBgColor: { type: String, default: "bg-blue-100 text-blue-500 dark:bg-blue-800 dark:text-blue-200" },
  closeButtonColor: { type: String, default: "text-gray-400 hover:text-gray-900 dark:hover:bg-gray-700" },
  iconLabel: { type: String, default: "Notification Icon" },
});

const emit = defineEmits(["close"]);
const visible = ref(true);

const borderColor = computed(() => {
  switch (props.type) {
    case "success":
      return "border-green-500";
    case "error":
      return "border-red-500";
    case "warning":
      return "border-yellow-500";
    case "info":
      return "border-blue-500";
    default:
      return "border-gray-300";
  }
});

const closeToast = () => {
  visible.value = false;
  emit("close");
};

onMounted(() => {
  setTimeout(() => {
    closeToast();
  }, props.duration);
});
</script>

<style scoped>
.notification {
  opacity: 1;
  transition: opacity 0.5s ease;
}
</style>
