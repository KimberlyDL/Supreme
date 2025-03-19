const AuthRoutes = {
  path: '/account',
  component: () => import('@/layouts/empty/BlankLayout.vue'),
  meta: {
    requiresAuth: false
  },
  children: [
    {
      name: 'Login',
      path: 'login',
      component: () => import('@/views/auth/Login.vue')
    },
    {
      name: 'Logout',
      path: 'logout',
      component: () => import('@/views/auth/Login.vue')
    },
    {
      name: 'Register',
      path: 'register',
      component: () => import('@/views/auth/Register.vue')
    },
    {
      name: 'RegisterEmp',
      path: 'register-emp',
      component: () => import('@/views/auth/RegisterEmp.vue')
    }
  ]
};

export default AuthRoutes;