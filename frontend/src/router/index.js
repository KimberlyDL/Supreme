// frontend\src\router\index.js
// Composables
import { createRouter, createWebHistory } from 'vue-router/auto'
import { setupLayouts } from 'virtual:generated-layouts'

import MainRoutes from './MainRoutes';
import AuthRoutes from './AuthRoutes';
import AdministratorRoutes from './AdministratorRoutes';

const Routes = [
  // ...adminRoutes,
  AdministratorRoutes,
  MainRoutes,
  AuthRoutes,
  {
    path: '/:pathMatch(.*)*',
    component: () => import('@/views/auth/Error.vue')
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: setupLayouts(Routes),
})

router.beforeEach((to, from, next) => {
  if (to.path !== '/login') { // Avoid saving login route
      localStorage.setItem('lastVisitedRoute', to.path);
  }
  next();
});

export default router
