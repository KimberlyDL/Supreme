<template>
  <v-app-bar app color="surface" elevation="1">
    <v-container class="d-flex align-center">
      <Logo />
      <v-spacer></v-spacer>
      <v-btn v-for="item in menuItems" :key="item.title" text class="hidden-sm-and-down">
        {{ item.title }}
      </v-btn>
      <v-menu open-on-hover>
        <template v-slot:activator="{ props }">
          <v-btn text v-bind="props" class="hidden-md-and-up">
            Menu
            <v-icon right>mdi-menu</v-icon>
          </v-btn>
        </template>
        <v-list>
          <v-list-item v-for="item in menuItems" :key="item.title" :to="item.to">
            <v-list-item-title>{{ item.title }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
      <template v-if="!isAuthenticated">
        <v-btn color="primary" class="ml-4" :to="{ name: 'Login' }">
          Login
        </v-btn>
        <v-btn color="secondary" class="ml-2" :to="{ name: 'Register' }">
          Register
        </v-btn>
      </template>
      <template v-else>
        <ProfileDD />
      </template>
    </v-container>
  </v-app-bar>
</template>

<script setup>
import { ref } from 'vue';
import Logo from '@/layouts/full/logo/Logo.vue';
import ProfileDD from '@/layouts/full/vertical-header/ProfileDD.vue';

const isAuthenticated = ref(false); // Replace with your authentication logic

const menuItems = [
  { title: 'About Us', to: '/about' },
  { title: 'Contact', to: '/contact' },
  { title: 'Catalog', to: '/catalog' },
  { title: 'Blog', to: '/blog' },
  { title: 'Announcements', to: '/announcements' },
];
</script>
