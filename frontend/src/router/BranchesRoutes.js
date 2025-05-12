import authMiddleware from '@/middleware/auth';

const BranchesRoutes = {
    path: '/administrator/branch',
    meta: {
        requiresAuth: true, requiresAdmin: true,
        roles: ['owner', 'manager', 'assistant_manager', 'stock_manager']
    },
    redirect: '/administrator/branch',
    component: () => import('@/layouts/admin/AdminLayout.vue'),
    children: [
        {
            name: "AdminDashboardBranches",
            path: "",
            component: () => import("@/views/admin/branches/Branches.vue"),
            meta: { requiresAuth: true, roles: ['owner', 'manager', 'assistant_manager'] },
            props: route => ({ userData: route.params.userData })
        },
        {
            path: "modal/:modalType",
            name: "BranchModal",
            component: () => import("@/views/admin/branches/Branches.vue"),
            meta: { requiresAuth: true, roles: ['owner', 'manager', 'assistant_manager'] },
            props: route => ({ userData: route.params.userData })
        },
        {
            path: "modal/:modalType/:id",
            name: "BranchModalWithId",
            component: () => import("@/views/admin/branches/Branches.vue"),
            meta: { requiresAuth: true, roles: ['owner', 'manager', 'assistant_manager'] },
            props: route => ({ userData: route.params.userData })
        }
    ]
};

export default BranchesRoutes;
