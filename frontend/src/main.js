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
// import { createApp } from 'vue';
// import './assets/tailwind.css';
// import './style.css';
// import App from './App.vue';
// import router from '@router';
// import { createPinia } from 'pinia';
// import piniaPersist from 'pinia-plugin-persist';

// const pinia = createPinia();
// pinia.use(piniaPersist);

// const app = createApp(App);

// app.use(router);
// app.use(pinia);

// if ('serviceWorker' in navigator) {
//     navigator.serviceWorker.register('/firebase-messaging-sw.js')
//         .then((registration) => {
//             console.log('Service Worker registered with scope:', registration.scope);
//         }).catch((error) => {
//             console.error('Service Worker registration failed:', error);
//         });
// }
// app.mount('#app');


import { createApp } from 'vue';
import App from './App.vue';
import router from '@/router';
// import { PerfectScrollbarPlugin } from 'vue3-perfect-scrollbar';
// import VueApexCharts from 'vue3-apexcharts';
// import VueTablerIcons from 'vue-tabler-icons';
// import Maska from 'maska';
import './assets/tailwind.css';
// import './style.css';



// configuring pinia 
import { createPinia } from 'pinia';
import piniaPersistedState from 'pinia-plugin-persistedstate';

const pinia = createPinia();
pinia.use(piniaPersistedState);




// Create Vue application instance
const app = createApp(App);

// Registering all the plugins
app
  // .use(vuetify)
  .use(router)
  .use(pinia)
  // .use(PerfectScrollbarPlugin)
  // .use(VueTablerIcons)
  // .use(Maska)
  // .use(VueApexCharts);

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