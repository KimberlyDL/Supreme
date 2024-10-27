<!-- <script setup>
import HelloWorld from './components/HelloWorld.vue'
</script>

<template>
  <div>
    <a href="https://vitejs.dev" target="_blank">
      <img src="/vite.svg" class="logo" alt="Vite logo" />
    </a>
    <a href="https://vuejs.org/" target="_blank">
      <img src="./assets/vue.svg" class="logo vue" alt="Vue logo" />
    </a>
  </div>
  <HelloWorld msg="Vite + Vue" />
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style> -->

<!-- frontend\src\App.vue -->
<template>
  <div id="app">
    <!-- <nav class="p-4">
      <router-link to="/" class="mr-4">Home</router-link>
      <router-link to="/about">About</router-link>
      <router-link to="/login">Login</router-link>
      <router-link to="/signup">Sign up</router-link>
      <router-link to="/push-notif">Push notif</router-link>
    </nav> -->
    <router-view />

    <!-- <div v-if="notification" class="notification">
      <h4>{{ notification.title }}</h4>
      <p>{{ notification.body }}</p>
    </div> -->
  </div>
</template>

<script setup>

import { ref, onMounted } from 'vue';
import { onMessageListener } from '@services/firebase';

const notification = ref(null);

onMounted(() => {
  onMessageListener().then((payload) => {
    console.log('Foreground notification received:', payload);
    alert(`New notification: ${payload.notification.title}`);
  }).catch((err) => {
    console.log('Error receiving foreground notification:', err);
  });

});

onMounted(() => {
  // Listen for foreground notifications
  onMessageListener().then((payload) => {
    console.log('Foreground notification received:', payload);
    
    // Update notification reactive state
    notification.value = {
      title: payload.notification.title,
      body: payload.notification.body,
    };

    // You can also show a toast or alert if you prefer:
    alert(`New notification: ${payload.notification.title}`);
  }).catch((err) => {
    console.error('Error receiving foreground notification:', err);
  });
});
</script>
