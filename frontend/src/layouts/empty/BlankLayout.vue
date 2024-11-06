<!-- src/layouts/empty/BlankLayout.vue -->
<template>
  <div>
    <!-- Any global wrapper elements you want -->
    <RouterView /> <!-- This is where the child components (Login, Register) will be injected -->
  </div>
</template>

<script setup>
import { RouterView } from "vue-router";
</script>

<style scoped>
/* Add layout-specific styles here */
</style>