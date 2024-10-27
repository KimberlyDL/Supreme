<!-- src/views/LandingPage.vue -->
<template>
  <div class="landing-page">
    <h1>Welcome to Our Website</h1>
    <p>This is the landing page for all users.</p>
    <!-- Navigation links to other pages -->
    <router-link to="/login">Go to Login</router-link>
    <router-link to="/dashboard">Go to Dashboard</router-link>
  </div>
</template>

<script setup>
</script>

<style scoped>
.landing-page {
  text-align: center;
  margin-top: 50px;
}
</style>
