// src/main.js
import { createApp } from 'vue';
import App from './App.vue';
import router from '@/router';
import { initializeAuthPersistence } from '@/services/authService';
import { restoreAuthState, setupAuthStateListener } from '@/services/authListenerService';
import '@/assets/tailwind.css';
import '@/assets/styles.css';

// Configuring pinia 
import { createPinia } from 'pinia';
import piniaPersistedState from 'pinia-plugin-persistedstate';
import { useAuthStore } from '@/stores/authStore';

// Define allowed admin roles
const allowedRoles = ['owner', 'manager', 'stock_manager', 'admin'];

// Create and configure Pinia
const pinia = createPinia();
pinia.use(piniaPersistedState);

// Create the app instance but don't mount it yet
const app = createApp(App);
app.use(pinia);
app.use(router);

// Initialize authStore - moved outside the promise chain to avoid conditional hook call
const authStore = useAuthStore();
// Set up a loading state in the App component
authStore.isInitializing = true;

// Initialize Firebase auth and mount the app when ready
initializeAuthPersistence()
    .then(async () => {
        try {
            // Wait for auth state to be fully restored
            const userProfile = await restoreAuthState();
            console.log("Auth state restored");

            // Set up continuous auth state monitoring
            const unsubscribe = setupAuthStateListener();

            // Handle routing based on the restored auth state
            if (authStore.isLoggedIn) {
                const intendedRoute = localStorage.getItem("intendedRoute");
                const lastVisitedRoute = localStorage.getItem("lastVisitedRoute");

                if (intendedRoute) {
                    // Navigate to the intended route that was interrupted
                    router.replace(intendedRoute);
                    localStorage.removeItem("intendedRoute");
                } else if (
                    lastVisitedRoute &&
                    lastVisitedRoute.startsWith("/administrator") &&
                    allowedRoles.includes(authStore.user.role)
                ) {
                    console.log("Redirecting to last visited administrator route:", lastVisitedRoute);
                    router.replace(lastVisitedRoute);
                } else if (allowedRoles.includes(authStore.user.role)) {
                    router.replace("/administrator");
                }
            }
        } catch (error) {
            console.error("Error restoring auth state:", error);
            // If auth restoration fails, we can still proceed with the app
        } finally {
            // Mark initialization as complete
            authStore.isInitializing = false;

            // Mount the app
            app.mount("#app");
        }
    })
    .catch((error) => {
        console.error("Error setting persistence:", error);
        // Even if persistence fails, we should still mount the app
        authStore.isInitializing = false;
        app.mount("#app");
    });

// Service Worker registration
if ("serviceWorker" in navigator) {
    navigator.serviceWorker
        .register("/firebase-messaging-sw.js")
        .then((registration) => {
            console.log("Service Worker registered with scope:", registration.scope);
        })
        .catch((error) => {
            console.error("Service Worker registration failed:", error);
        });
}