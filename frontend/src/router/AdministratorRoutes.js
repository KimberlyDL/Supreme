// src\router\MainRoutes.ts
import authMiddleware from '@/middleware/auth';

const MainRoutes = {
  path: '/administrator',
  meta: {
    requiresAuth: true
  },
  redirect: '/administrator',
  component: () => import('@/layouts/admin/AdminLayout.vue'),
  children: [
    {
      name: 'AdminDashboard',
      path: '',
      component: () => import('@/views/admin/dashboard.vue'),
      // beforeEnter: [authMiddleware.requireAuth, authMiddleware.isAdmin]
    },
    {
      name: 'AdminDashboardUser',
      path: 'user',
      component: () => import('@/views/admin/users.vue'),
      // beforeEnter: [authMiddleware.requireAuth, authMiddleware.isAdmin]
    },
    {
      name: 'AdminDashboardEmployee',
      path: 'employee',
      component: () => import('@/views/admin/employee.vue'),
      // beforeEnter: [authMiddleware.requireAuth, authMiddleware.isAdmin]
    },
    {
      name: 'AdminDashboardEmployees',
      path: 'employees',
      component: () => import('@/views/admin/employees.vue'),
      // beforeEnter: [authMiddleware.requireAuth, authMiddleware.isAdmin]
    },
    // {
    //   name: 'ManageUsers',
    //   path: 'users',
    //   component: () => import('@/views/admin/ManageUsers.vue'),
    //   beforeEnter: [authMiddleware.requireAuth, authMiddleware.isAdmin]
    // },
    // {
    //   name: 'Typography',
    //   path: 'ui/typography',
    //   component: () => import('@/views/components/Typography.vue')
    // },
    // {
    //   name: 'Shadow',
    //   path: 'ui/shadow',
    //   component: () => import('@/views/components/Shadow.vue')
    // },
    // {
    //   name: 'Icons',
    //   path: 'icons',
    //   component: () => import('@/views/pages/Icons.vue')
    // },
    // {
    //   name: 'Starter',
    //   path: 'sample-page',
    //   component: () => import('@/views/pages/SamplePage.vue')
    // },
  ]
};

export default MainRoutes;
