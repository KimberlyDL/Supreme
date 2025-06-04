<!-- frontend\src\components\settings\NotificationSetting.vue -->
 <template>
  <div class="flex items-start justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
    <div class="flex-1">
      <h4 class="text-sm font-medium text-gray-900 dark:text-white">{{ title }}</h4>
      <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">{{ description }}</p>
    </div>
    
    <button
      @click="$emit('toggle', !enabled)"
      :class="[
        'ml-4 relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
        enabled ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-600'
      ]"
    >
      <span
        :class="[
          'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
          enabled ? 'translate-x-6' : 'translate-x-1'
        ]"
      />
    </button>
  </div>
</template>

<script setup>
defineProps({
  title: String,
  description: String,
  enabled: Boolean
})

defineEmits(['toggle'])
</script>
