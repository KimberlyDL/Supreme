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

// Create the app instance but don't mount it yet
const app = createApp(App)
app.use(pinia)
app.use(router)

// Initialize authStore outside of the conditional block
const authStore = useAuthStore()
// Set up a loading state in the App component
authStore.isInitializing = true

// Set up route guards before initializing auth
router.beforeEach(async (to, from, next) => {
  // If auth is still initializing and not going to a public route, wait
  if (authStore.isInitializing && to.meta.requiresAuth) {
    // Store the intended destination
    localStorage.setItem("intendedRoute", to.fullPath)
    return next(false)
  }

  if (to.meta.requiresAuth && !authStore.isLoggedIn) {
    return next({ name: "Login" })
  }

  if (to.meta.requiresAdmin && !allowedRoles.includes(authStore.user.role)) {
    return next({ name: "Unauthorized" })
  }

  // Save the route for future reference if it's an admin route
  if (to.path.startsWith("/administrator") && allowedRoles.includes(authStore.user.role)) {
    localStorage.setItem("lastVisitedRoute", to.fullPath)
  }

  next()
})



// Initialize Firebase auth and mount the app when ready
setPersistence(auth, browserLocalPersistence)
  .then(async () => {
    try {
      // Wait for auth state to be fully restored
      await restoreAuthState()
      console.log("Auth state restored")

      // Now handle routing based on the restored auth state
      const intendedRoute = localStorage.getItem("intendedRoute")
      const lastVisitedRoute = localStorage.getItem("lastVisitedRoute")

      if (authStore.isLoggedIn) {
        if (intendedRoute) {
          // Navigate to the intended route that was interrupted
          router.replace(intendedRoute)
          localStorage.removeItem("intendedRoute")
        } else if (
          lastVisitedRoute &&
          lastVisitedRoute.startsWith("/administrator") &&
          allowedRoles.includes(authStore.user.role)
        ) {
          console.log("Redirecting to last visited administrator route:", lastVisitedRoute)
          router.replace(lastVisitedRoute)
        } else if (allowedRoles.includes(authStore.user.role)) {
          router.replace("/administrator")
        }
      }
    } catch (error) {
      console.error("Error restoring auth state:", error)
      // If auth restoration fails, we can still proceed with the app
      // The user will just need to log in again
    } finally {
      // Mark initialization as complete
      authStore.isInitializing = false

      // Mount the app
      app.mount("#app")
    }
  })
  .catch((error) => {
    console.error("Error setting persistence:", error)
    // Even if persistence fails, we should still mount the app
    authStore.isInitializing = false
    app.mount("#app")
  })


// Service Worker registration
if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("/firebase-messaging-sw.js")
    .then((registration) => {
      console.log("Service Worker registered with scope:", registration.scope)
    })
    .catch((error) => {
      console.error("Service Worker registration failed:", error)
    })
}





// #region Old Codes

// // frontend\src\main.js
// import { createApp, nextTick } from 'vue';
// import App from './App.vue';
// import router from '@/router';

// import { auth } from '@services/firebase';
// import { setPersistence, browserLocalPersistence, onAuthStateChanged } from 'firebase/auth';

// //get user when refresh
// import { restoreAuthState } from '@services/restoreAuthState';

// import '@assets/tailwind.css';
// import '@assets/styles.css';

// // configuring pinia 
// import { createPinia } from 'pinia';
// import piniaPersistedState from 'pinia-plugin-persistedstate';

// //stores
// import { useAuthStore } from '@/stores/authStore';

// const allowedRoles = ['owner', 'manager', 'stock_manager', 'admin'];

// const pinia = createPinia();
// pinia.use(piniaPersistedState);


// setPersistence(auth, browserLocalPersistence)
//   .then(() => restoreAuthState(router))
//   // .then( async () => {

//   //   const user = auth.currentUser;
//   //   const idTokenResult = await user.getIdTokenResult(true);

//   //   const token = idTokenResult.token;
//   //   const claims = idTokenResult.claims;

//   //   console.log('ID Token:', token);
//   //   console.log('Custom Claims:', claims);

//   // })
//   .then(() => {

//     //make console log
//     console.log("Auth state restored");
//     const authStore = useAuthStore();

//     // Authentication state listener
//     onAuthStateChanged(auth, (user) => {
//       nextTick(() => {

//         const lastVisitedRoute = localStorage.getItem('lastVisitedRoute');

//         if (lastVisitedRoute && lastVisitedRoute.startsWith('/administrator') && allowedRoles.includes(authStore.user.role)) {
//           console.log('Redirecting to last visited administrator route:', lastVisitedRoute);
//           router.replace(lastVisitedRoute);
//         }
//         else if (allowedRoles.includes(authStore.user.role)) {
//           router.replace('/administrator');
//         }
//         else if (authStore.user) {
//           console.log('User is authenticated. Redirecting to:', lastVisitedRoute);
//           router.replace(lastVisitedRoute);
//         } else {
//           console.log('User is not authenticated. Redirecting to home');
//           router.replace('/');
//         }
//       });
//     });
//   })
//   .catch((error) => {
//     console.error("Error setting persistence:", error);
//   });


// const app = createApp(App);

// app.use(router).use(pinia);

// router.beforeEach(async (to, from, next) => {
//   const authStore = useAuthStore();
//   await authStore.$patch();

//   if (to.meta.requiresAuth && !authStore.isLoggedIn) {
//     return next({ name: 'Login' });
//   }

//   if (to.meta.requiresAdmin && (!allowedRoles.includes(authStore.user.role))) {
//     return next({ name: 'Unauthorized' });
//   }
//   next();
// });

// // Service Worker registration
// if ('serviceWorker' in navigator) {
//   navigator.serviceWorker.register('/firebase-messaging-sw.js')
//     .then((registration) => {
//       console.log('Service Worker registered with scope:', registration.scope);
//     }).catch((error) => {
//       console.error('Service Worker registration failed:', error);
//     });
// }

// // Mount the app to the DOM
// app.mount('#app');

//  #endregion