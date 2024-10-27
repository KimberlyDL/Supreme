// frontend\src\services\firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getMessaging, onMessage } from 'firebase/messaging';
import { useAuthStore } from '@stores/authFirebase'; // Import Pinia store
import router from '@router'; // Import your router

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const messaging = getMessaging(app);

const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });

const restoreAuthState = (authStore, router) => {
  return new Promise((resolve, reject) => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        // If a user is logged in, restore user data
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (storedUser) {
          authStore.setUser(storedUser); // Restore user data into Pinia store
        }
        resolve(user); // Auth state restored
        // Optional: Redirect the user if necessary
        if (router.currentRoute.value.name === 'login') {
          router.push({ name: 'dashboard' });
        }
      } else {
        reject("No user session found");
        // Optionally, redirect to login
        if (router.currentRoute.value.name !== 'login') {
          router.push({ name: 'login' });
        }
      }
    });
  });
};


const initializeAuth = () => {
  const authStore = useAuthStore();
  return restoreAuthState(authStore, router)
    .then((user) => {
      console.log("User session restored:", user);
    })
    .catch((error) => {
      console.error("Failed to restore session:", error);
    });
};

export { auth, db, storage, messaging, onMessageListener, restoreAuthState, initializeAuth};
