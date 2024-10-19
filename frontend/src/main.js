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


import { createApp } from 'vue';
import './assets/tailwind.css';
import './style.css';
import App from './App.vue';
import router from './router';
import { createPinia } from 'pinia';
import piniaPersist from 'pinia-plugin-persist';

const pinia = createPinia();
pinia.use(piniaPersist);

const app = createApp(App);

app.use(router);
app.use(pinia);

app.mount('#app');
