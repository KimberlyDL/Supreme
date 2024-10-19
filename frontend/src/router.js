// src/router.js
import { createRouter, createWebHistory } from 'vue-router';
import Home from './views/Home.vue';
import About from './views/About.vue';
import Login from './views/Login.vue';
import Signup from './views/user/Register.vue';

const routes = [
  { path: '/', component: Home },
  { path: '/about', component: About },
  { path: '/login', component: Login },
  { path: '/signup', component: Signup } // Removed trailing comma
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
