// src\router\AdminRoutesFullLayout.ts
import authMiddleware from '@/middleware/auth';

const OrderRoutes = {
    path: '/administrator/orders',
    meta: {
        requiresAuth: true
    },
    redirect: '/administrator/orders',
    component: () => import('@/layouts/admin/AdminLayout.vue'),
    children: [
        {
            name: "OrderList",
            path: "",
            component: () => import("@/views/admin/orders/Orders.vue"),
            meta: { requiresAuth: true }
        },
        {
            name: 'CreateOrder',
            path: "create",
            component: () => import("@/views/admin/orders/CreateOrder.vue"),
            meta: { requiresAuth: true }
        },
        {
            name: 'EditOrder',
            path: "edit/:id",
            component: () => import("@/views/admin/orders/EditOrder.vue"),
            meta: { requiresAuth: true }
        }
    ]
};

export default OrderRoutes;
