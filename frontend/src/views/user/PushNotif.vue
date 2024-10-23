<!-- frontend\src\views\user\PushNotif.vue -->
<!-- <template>
    <div>
        <h1>Push Notifications</h1>
        <button @click="enableNotifications">Enable Notifications</button>
    </div>
</template>

<script setup>
import { useFcmTokenStore } from '../../store/fcmToken';
const fcmTokenStore = useFcmTokenStore();

function enableNotifications() {
    fcmTokenStore.requestNotificationPermission();
}
</script>

 -->
 <!-- frontend\src\views\user\PushNotif.vue -->
<template>
    <div>
      <h1>Push Notifications</h1>
      <button @click="requestNotificationPermission">Enable Notifications</button>
    </div>
  </template>
  
  <script setup>
  import { useFcmTokenStore } from '../../store/fcmToken';
  import { onMounted } from 'vue';
  import { onMessageListener } from '../../firebase';
  
  // Access Pinia store for managing FCM tokens
  const fcmTokenStore = useFcmTokenStore();
  
  // Handle push notifications when the component is mounted
  onMounted(() => {
    onMessageListener()
      .then((payload) => {
        console.log('Foreground notification received:', payload);
        alert(`New notification: ${payload.notification.title}`);
      })
      .catch((err) => {
        console.error('Error receiving foreground notification:', err);
      });
  });
  
  // Request notification permissions and FCM token
  const requestNotificationPermission = async () => {
    await fcmTokenStore.requestNotificationPermission();
  };
  </script>
  