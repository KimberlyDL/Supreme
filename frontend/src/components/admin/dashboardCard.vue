<template>
    <div class="rounded-lg shadow-md p-4" :class="color || 'bg-white'">
      <div class="flex items-center">
        <div class="mr-4">
          <component :is="iconComponent" class="w-8 h-8" />
        </div>
        <div>
          <h3 class="text-sm font-medium text-gray-500">{{ title }}</h3>
          <p class="text-2xl font-bold">{{ value }}</p>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { computed } from 'vue';
  import * as LucideIcons from 'lucide-vue-next';
  
  const props = defineProps({
    title: {
      type: String,
      required: true
    },
    value: {
      type: String,
      required: true
    },
    icon: {
      type: String,
      default: 'BarChart'
    },
    color: {
      type: String,
      default: ''
    }
  });
  
  const iconComponent = computed(() => {
    return props.icon && LucideIcons[props.icon] 
      ? LucideIcons[props.icon] 
      : LucideIcons.BarChart;
  });
  </script>