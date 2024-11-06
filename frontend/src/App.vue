<!-- frontend\src\App.vue -->
<template>
  <div id="app">
    <router-view />

    <ToastManager ref="toastManager" /> <!-- Reference ToastManager using ref -->
    <button @click="showToast">Show Toast</button> 
    <button @click="showErrorToast">Show Error Toast</button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

import ToastManager from '@components/utils/notification/ToastManager.vue';

import { onMessageListener } from '@services/firebase';

const notification = ref(null);
const toastManager = ref(null); // Create a reference for `ToastManager`

const showToast = () => {
  if (toastManager.value) {
    toastManager.value.addToast({
      message: 'This is a test notification!',
      type: 'success', // You can use "success" or "error"
      duration: 5000,
    });
  }
};

const showErrorToast = () => {
  if (toastManager.value) {
    toastManager.value.addToast({
      message: 'This is a test notification!',
      type: 'error', // You can use "success" or "error"
      duration: 5000,
    });
  }
};
// onMounted(() => {
//   onMessageListener().then((payload) => {
//     console.log('Foreground notification received:', payload);
//     alert(`New notification: ${payload.notification.title}`);
//   }).catch((err) => {
//     console.log('Error receiving foreground notification:', err);
//   });

// });

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
