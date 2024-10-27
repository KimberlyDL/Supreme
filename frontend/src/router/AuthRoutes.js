<<<<<<< HEAD
// import DefaultLayout from '@/layouts/DefaultLayout.vue';
// import AuthLayout from '@/layouts/AuthLayout.vue';

// src\router\AuthRoutes.ts
const AuthRoutes = {
  path: '/account',
  // component: DefaultLayout,
  component: () => import('@/layouts/empty/BlankLayout.vue'),
  meta: {
    requiresAuth: false
=======
const AuthRoutes = {
  path: '/account',
  component: () => import('@/layouts/empty/BlankLayout.vue'), // Use BlankLayout for wrapping auth pages
  meta: {
    requiresAuth: false // These routes do not require authentication
>>>>>>> origin/Kimberly
  },
  children: [
    {
      name: 'Login',
      path: 'login',
<<<<<<< HEAD
      component: () => import('@/views/auth/Login.vue')
=======
      component: () => import('@/views/auth/Login.vue') // Renders the Login component inside BlankLayout
>>>>>>> origin/Kimberly
    },
    {
      name: 'Register',
      path: 'register',
<<<<<<< HEAD
      component: () => import('@/views/auth/Register.vue')
=======
      component: () => import('@/views/auth/Register.vue') // Renders the Register component inside BlankLayout
>>>>>>> origin/Kimberly
    }
  ]
};

<<<<<<< HEAD
export default AuthRoutes;
=======
export default AuthRoutes;
>>>>>>> origin/Kimberly
