const AuthRoutes = {
  path: '/account',
  component: () => import('@/layouts/empty/BlankLayout.vue'), // Use BlankLayout for wrapping auth pages
  meta: {
    requiresAuth: false // These routes do not require authentication
  },
  children: [
    {
      name: 'Login',
      path: 'login',
      component: () => import('@/views/auth/Login.vue') // Renders the Login component inside BlankLayout
    },
    {
      name: 'Register',
      path: 'register',
      component: () => import('@/views/auth/Register.vue') // Renders the Register component inside BlankLayout
    }
  ]
};

export default AuthRoutes;