// frontend\src\router.js
import { createRouter, createWebHistory } from 'vue-router';
import Home from './views/Home.vue';
import About from './views/About.vue';
import Login from './views/Login.vue';
import Signup from './views/user/Register.vue';
import PushNotif from './views/user/PushNotif.vue';

const routes = [
  { path: '/', component: Home },
  { path: '/about', component: About },
  { path: '/login', component: Login },
  { path: '/signup', component: Signup },
  { path: '/push-notif', component: PushNotif },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
