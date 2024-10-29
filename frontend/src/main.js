// frontend\src\main.js
import { createApp, nextTick } from 'vue';
import App from './App.vue';
import router from '@/router';

import { setPersistence, browserLocalPersistence, onAuthStateChanged } from 'firebase/auth';
import { restoreAuthState } from '@services/restoreAuthState'; // Import your restoreAuthState logic
import { auth } from '@services/firebase'; // Import Firebase services


import './assets/tailwind.css';
// import './style.css';

// configuring pinia 
import { createPinia } from 'pinia';
import piniaPersistedState from 'pinia-plugin-persistedstate';

//stores
import { useAuthStore } from '@/stores/authFirebase';

const pinia = createPinia();
pinia.use(piniaPersistedState);

setPersistence(auth, browserLocalPersistence)
  .then(() => restoreAuthState(router))
  .then(() => {
    console.log("Auth state restored");

    // Authentication state listener
    onAuthStateChanged(auth, (user) => {
      nextTick(() => {
        const lastVisitedRoute = localStorage.getItem('lastVisitedRoute') || '/';
        if (user) {
          console.log('User is authenticated. Redirecting to:', lastVisitedRoute);
          router.replace(lastVisitedRoute);
        } else {
          console.log('User is not authenticated. Redirecting to login');
          router.replace('/');
        }
      });
    });
  })
  .catch((error) => {
    console.error("Error setting persistence:", error);
  });


// Create Vue application instance
const app = createApp(App);

// Registering all the plugins
app.use(router).use(pinia);

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore(); // Now Pinia is active
  await authStore.$patch();

  if (to.meta.requiresAuth && !authStore.isLoggedIn) {
    return next({ name: 'Login' });
  }

  if (to.meta.requiresAdmin && authStore.user.role !== 'admin') {
    return next({ name: 'Unauthorized' });
  }

  if (to.meta.requiresGuest && authStore.isLoggedIn) {
    return next(false); // Prevent logged-in users from accessing guest-only routes
  }

  next();
});


// Service Worker registration
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/firebase-messaging-sw.js')
    .then((registration) => {
      console.log('Service Worker registered with scope:', registration.scope);
    }).catch((error) => {
      console.error('Service Worker registration failed:', error);
    });
}

// Mount the app to the DOM
app.mount('#app');