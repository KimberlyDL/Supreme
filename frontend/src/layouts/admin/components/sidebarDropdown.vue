<!-- frontend\src\layouts\admin\components\sidebarDropdown.vue -->
<template>
  <div class="relative">
    <button
      @click="$emit('toggle', name)"
      class="flex items-center w-full p-2 text-sm font-inter font-regular text-tBase-100 transition duration-75 rounded-lg group hover:bg-bgPrimary-100"
      :aria-expanded="activeDropdown === name"
    >
      <component :is="icon" :stroke-width="1" class="text-primary-500" />
      <span class="flex-1 ml-3 text-left whitespace-nowrap">{{ label }}</span>
    </button>
    <ul v-show="activeDropdown === name" class="py-2 space-y-2">
      <slot />
    </ul>
  </div>
</template>

<script setup>
defineProps({
  label: String,
  name: String,
  icon: Object,
  activeDropdown: String,
});
defineEmits(['toggle']);
</script>
