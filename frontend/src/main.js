// frontend\src\main.js
import { createApp, nextTick } from 'vue';
import App from './App.vue';
import router from '@/router';

import { auth } from '@services/firebase';
import { setPersistence, browserLocalPersistence, onAuthStateChanged } from 'firebase/auth';

//get user when refresh
import { restoreAuthState } from '@services/restoreAuthState';

import '@assets/tailwind.css';
import '@assets/styles.css';

// configuring pinia 
import { createPinia } from 'pinia';
import piniaPersistedState from 'pinia-plugin-persistedstate';

//stores
import { useAuthStore } from '@/stores/authStore';

const allowedRoles = ['owner', 'manager', 'stock_manager', 'admin'];

const pinia = createPinia();
pinia.use(piniaPersistedState);

setPersistence(auth, browserLocalPersistence)
  .then(() => restoreAuthState(router))
  // .then( async () => {

  //   const user = auth.currentUser;
  //   const idTokenResult = await user.getIdTokenResult(true);

  //   const token = idTokenResult.token;
  //   const claims = idTokenResult.claims;

  //   console.log('ID Token:', token);
  //   console.log('Custom Claims:', claims);

  // })
  .then(() => {

    //make console log
    console.log("Auth state restored");
    const authStore = useAuthStore();

    // Authentication state listener
    onAuthStateChanged(auth, (user) => {
      nextTick(() => {

        const lastVisitedRoute = localStorage.getItem('lastVisitedRoute');

        if (lastVisitedRoute && lastVisitedRoute.startsWith('/administrator') && allowedRoles.includes(authStore.user.role)) {
          console.log('Redirecting to last visited administrator route:', lastVisitedRoute);
          router.replace(lastVisitedRoute);
        }
        else if (allowedRoles.includes(authStore.user.role)) {
          router.replace('/administrator');
        }
        else if (authStore.user) {
          console.log('User is authenticated. Redirecting to:', lastVisitedRoute);
          router.replace(lastVisitedRoute);
        } else {
          console.log('User is not authenticated. Redirecting to home');
          router.replace('/');
        }
      });
    });
  })
  .catch((error) => {
    console.error("Error setting persistence:", error);
  });


const app = createApp(App);

app.use(router).use(pinia);

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  await authStore.$patch();

  if (to.meta.requiresAuth && !authStore.isLoggedIn) {
    return next({ name: 'Login' });
  }

  if (to.meta.requiresAdmin && (!allowedRoles.includes(authStore.user.role))) {
    return next({ name: 'Unauthorized' });
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