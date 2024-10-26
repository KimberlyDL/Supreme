<!-- frontend\src\layouts\full\logo\LogoIcon.vue -->
<script setup>
import { RouterLink } from 'vue-router';
import Logoimg from '@/assets/images/logos/logo-icon.svg';
</script>
<template>
    <div class="logo">
        <RouterLink :to="{ name: 'Home' }">
          <Logoimg />
        </RouterLink>
    </div>
</template>
