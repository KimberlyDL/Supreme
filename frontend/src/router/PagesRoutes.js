// src\router\AdminRoutesFullLayout.ts
import authMiddleware from '@/middleware/auth';

const OrderRoutes = {
    path: '/administrator/pages',
    meta: {
        requiresAuth: true
    },
    redirect: '/administrator/pages',
    component: () => import('@/layouts/admin/AdminLayout.vue'),
    children: [
        {
            name: "ContactUsManager",
            path: "contact-us",
            component: () => import("@/views/admin/pages/ContactAdmin.vue"),
            meta: { requiresAuth: true }
        },
        {
            name: 'AboutUsManager',
            path: "about-us",
            component: () => import("@/views/admin/pages/AboutAdmin.vue"),
            meta: { requiresAuth: true }
        },
    ]
};

export default OrderRoutes;
