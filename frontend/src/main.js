// import { createApp } from 'vue';
// import './assets/tailwind.css';
// import './style.css'
// import App from './App.vue';
// import router from './router';
// import { createPinia } from 'pinia';
// import piniaPersist from 'pinia-plugin-persist';

// const app = createApp(App);

// app.use(router);
// app.use(createPinia());

// app.mount('#app');

// frontend\src\main.js
import { createApp } from 'vue';
import './assets/tailwind.css';
import './style.css';
import App from './App.vue';
import router from '@router';
import { createPinia } from 'pinia';
import piniaPersist from 'pinia-plugin-persist';

const pinia = createPinia();
pinia.use(piniaPersist);

const app = createApp(App);

app.use(router);
app.use(pinia);

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/firebase-messaging-sw.js')
        .then((registration) => {
            console.log('Service Worker registered with scope:', registration.scope);
        }).catch((error) => {
            console.error('Service Worker registration failed:', error);
        });
}
app.mount('#app');
