// Composables
import { createRouter, createWebHistory } from 'vue-router/auto'
import { setupLayouts } from 'virtual:generated-layouts'

//stores
import { useAuthStore } from '@/stores/authFirebase';

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

//global guard
//meta: { requiresAuth: true }, lagay to after ng before use or component
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();

  await authStore.$patch();

  if (to.meta.requiresAuth && !authStore.isLoggedIn) {
    return next({ name: 'Login' });
  }

  if (to.meta.requiresAdmin && authStore.user.role !== 'admin') {
    return next({ name: 'Unauthorized' });
  }

  if (to.name === 'Login' && authStore.isLoggedIn) {
    return next(false);
  }

  if (to.meta.role && authStore.user.role !== to.meta.role) {
    return next({ name: 'Login' });
  }

  next();
});

export default router
