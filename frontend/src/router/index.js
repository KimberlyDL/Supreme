import { createRouter, createWebHistory } from 'vue-router';
import ProductView from '../views/ProductView.vue';  // Admin view
import UserView from '../views/UserView.vue';  // User view (formerly About.vue)

const routes = [
  { path: '/', name: 'Admin', component: ProductView }, // Admin dashboard
  { path: '/user', name: 'User', component: UserView }, // User section
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
