<!-- src/layouts/empty/BlankLayout.vue -->
<template>
  <div>
    <!-- Any global wrapper elements you want -->
    <RouterView />
  </div>
</template>

<script setup>
import { RouterView } from "vue-router";
</script>

<style scoped>
.blank-layout {
  min-height: 100vh;
}
/* Add layout-specific styles here */
</style>