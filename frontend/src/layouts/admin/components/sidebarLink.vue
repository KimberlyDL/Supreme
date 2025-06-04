<!-- frontend\src\layouts\admin\components\sidebarLink.vue -->
<!-- <template>
    <router-link :to="{ name: to }"
        class="flex items-center p-2 text-base font-inter font-regular rounded-lg transition hover:bg-bgPrimary-100"
        :class="[
            isActive ? 'bg-bgPrimary-100 text-primary-500' : 'text-tBase-100',
            nested ? 'pl-11' : ''
        ]" v-slot="{ isActive }">
        <component :is="icon" :stroke-width="1" class="text-primary-500" />
        <span class="ml-3">{{ label }}</span>
    </router-link>
</template>

<script setup>
defineProps({
    to: String,
    icon: [String, Object],
    label: String,
    nested: {
        type: Boolean,
        default: false,
    }
});
</script>
 -->

<template>
    <router-link :to="{ name: to }"
        class="flex items-center p-2 text-sm font-inter font-small rounded-lg transition hover:bg-bgPrimary-100"
        :class="[
            isActive ? 'bg-bgPrimary-100 text-primary-500' : 'text-tBase-100',
            nested ? 'pl-11' : ''
        ]">
        <component :is="icon" :stroke-width="1" class="text-primary-500" />
        <span class="ml-3">{{ label }}</span>
    </router-link>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const props = defineProps({
  to: String,
  icon: [Object, Function],
  label: String,
  nested: {
    type: Boolean,
    default: false,
  }
});

const route = useRoute();

// Determine if the current route is active
const isActive = computed(() => route.name === props.to);
</script>