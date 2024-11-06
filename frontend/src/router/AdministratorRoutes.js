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
      name: 'AdminDashboardEditEmployee',
      path: 'employees/:id/edit',
      component: () => import('@/views/admin/employee/editEmployee.vue'),
      meta: { requiresAuth: true, roles: ['owner', 'manager'] }
    },
    {
      name: 'AdminDashboardEmployeeCreate',
      path: 'employee',
      component: () => import('@/views/admin/employee/createEmployee.vue'),
      // beforeEnter: [authMiddleware.requireAuth, authMiddleware.isAdmin]
    },
    // frontend\src\router\AdministratorRoutes.js
    {
      name: 'AdminDashboardViewEmployee',
      path: 'employees/:id',
      component: () => import('@/views/admin/employee/viewEmployee.vue'),
      meta: { requiresAuth: true, roles: ['owner', 'manager'] }
    },
    {
      name: 'AdminDashboardEmployees',
      path: 'employees',
      component: () => import('@/views/admin/employee/employees.vue'),
      // beforeEnter: [authMiddleware.requireAuth, authMiddleware.isAdmin]
    },
    {
      name: 'AdminDashboardBranches',
      path: 'branches',
      component: () => import('@/views/admin/branches.vue'),
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
