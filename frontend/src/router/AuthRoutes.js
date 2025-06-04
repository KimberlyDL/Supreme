// frontend\src\router\AuthRoutes.js
// const AuthRoutes = {
//   path: '/account',
//   component: () => import('@/layouts/empty/BlankLayout.vue'),
//   meta: {
//     requiresAuth: false
//   },
//   children: [
//     {
//       name: 'Login',
//       path: 'login',
//       component: () => import('@/views/auth/Login.vue')
//     },
//     {
//       name: 'Logout',
//       path: 'logout',
//       component: () => import('@/views/auth/Login.vue')
//     },
//     {
//       name: 'Register',
//       path: 'register',
//       component: () => import('@/views/auth/Register.vue')
//     },
//     {
//       name: 'RegisterEmp',
//       path: 'register-emp',
//       component: () => import('@/views/auth/RegisterEmp.vue')
//     }
//   ]
// };

// export default AuthRoutes;

// src/router/AuthRoutes.js
// src/router/AuthRoutes.js
const AuthRoutes = {
  path: "/account",
  component: () => import("@/layouts/empty/BlankLayout.vue"),
  meta: {
    requiresAuth: false,
  },
  children: [
    {
      name: "Login",
      path: "login",
      component: () => import("@/views/auth/Login.vue"),
    },
    {
      name: "Logout",
      path: "logout",
      component: () => import("@/views/auth/Login.vue"),
    },
    {
      name: "Register",
      path: "register",
      component: () => import("@/views/auth/Register.vue"),
    },
    {
      name: "RegisterEmp",
      path: "register-emp",
      component: () => import("@/views/auth/RegisterEmp.vue"),
      meta: {
        requiresAuth: true,
        requiresAdmin: true,
      },
    },
    {
      name: "Settings",
      path: "settings",
      component: () => import("@/views/SettingsDashboard.vue"),
    },
  ],
};

export default AuthRoutes;
