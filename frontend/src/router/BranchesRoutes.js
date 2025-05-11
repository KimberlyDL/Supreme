import authMiddleware from '@/middleware/auth';

const BranchesRoutes = {
    path: '/administrator/branch',
    meta: {
        requiresAuth: true
    },
    redirect: '/administrator/branch',
    component: () => import('@/layouts/admin/AdminLayout.vue'),
    children: [
        {
            name: "AdminDashboardBranches",
            path: "",
            component: () => import("@/views/admin/branches/branches.vue"),
            meta: { requiresAuth: true }
        },
        // {
        //     name: 'CreateBranch',
        //     path: "create",
        //     component: () => import("@/views/admin/branches/createBranch.vue"),
        //     meta: { requiresAuth: true }
        // },
        // {
        //     name: 'EditBranch',
        //     path: ":id/edit",
        //     component: () => import("@/views/admin/branches/editBranch.vue"),
        //     meta: { requiresAuth: true }
        // },
        // {
        //     name: 'Branch',
        //     path: ':id',
        //     component: () => import('@/views/admin/branches/viewBranch.vue')
        // },
    ]
};

export default BranchesRoutes;
