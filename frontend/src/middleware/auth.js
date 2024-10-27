// frontend\src\middleware\auth.js
import { useAuthStore } from '@/stores/authFirebase';

const requireAuth = (to, from, next) => {
  const authStore = useAuthStore();

  if (!authStore.user || !authStore.user.role || !authStore.user.emailVerified) {
    return next({ name: 'Login' });
  }

  next();
};

const checkIfLoggedIn = (to, from, next) => {
  const authStore = useAuthStore();

  // If user is logged in, redirect them away from login or register page
  if (authStore.user.emailVerified && authStore.isLoggedIn && authStore.role === 'customer' && (to.name === 'Login' || to.name === 'Register')) {
    return next({ name: 'Dashboard' });
  }

  // Otherwise, proceed as normal
  next();
};

const isAdmin = (to, from, next) => {
  const authStore = useAuthStore();

  if (!authStore.user && authStore.user.role === 'customer') {
    return next({ name: 'Login' });
  }

  next();
}

export default {requireAuth, checkIfLoggedIn, isAdmin};
