// src\router\AdminRoutesFullLayout.ts
import authMiddleware from '@/middleware/auth';

const AdminRoutesFullLayout = {
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
  ]
};


const AdminRoutesBlankLayout = {
  path: '/administrator',
  meta: {
    requiresAuth: true
  },
  redirect: '/administrator',
  component: () => import('@/layouts/empty/BlankLayout.vue'),
  children: [
    {
      name: 'AdminProfile',
      path: 'profile',
      component: () => import('@/views/admin/profile.vue'),
      // beforeEnter: [authMiddleware.requireAuth, authMiddleware.isAdmin]
    },
  ]
};

export { AdminRoutesFullLayout, AdminRoutesBlankLayout };
