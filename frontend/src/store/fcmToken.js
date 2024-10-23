// frontend\src\store\fcmToken.js
import axios from 'axios';
import { defineStore } from 'pinia';
import { getToken } from 'firebase/messaging';
import { messaging, db } from '../firebase';

export const useFcmTokenStore = defineStore('fcmToken', {
  state: () => ({
    apiUrl: import.meta.env.VITE_API_BASE_URL,
    fcmToken: null,
  }),
  actions: {
    async requestNotificationPermission() {
      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          console.log('Notification permission granted.');
          await this.getFCMToken();
        } else {
          console.log('Notification permission denied.');
        }
      } catch (error) {
        console.log('Error requesting permission: ', error);
      }
    },
    async getFCMToken() {
      try {
        const currentToken = await getToken(messaging, { vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY});
        if (currentToken) {
          console.log('FCM Token:', currentToken);
          this.fcmToken = currentToken;
          await this.sendTokenToBackend(currentToken);
        } else {
          console.log('No registration token available.');
          this.requestNotificationPermission();
        }
      } catch (error) {
        console.log('An error occurred while retrieving the token.', error);
      }
    },
    async sendTokenToBackend(token) {
      try {
        await axios.post(`${this.apiUrl}/save-token`, { token });
        console.log('FCM token sent to backend.');
      } catch (error) {
        console.log('Error sending FCM token to backend: ', error);
      }
    },
    // async saveTokenToFirestore(token) {
    //   try {
    //     const userId = 'QBvRDgtQGBseAxkohUIx';
    //     await db.collection('fcmTokens').doc(userId).set({ fcmToken: token }, { merge: true });
    //     console.log('FCM token saved to Firestore.');
    //   } catch (error) {
    //     console.error('Error saving FCM token to Firestore:', error);
    //   }
    // },
  },
  persist: true,
});
