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
            // component: () => import("@/views/admin/orders/Orders.vue"),
            component: () => import("@/views/admin/orders/OrderList.vue"),
            meta: { requiresAuth: true }
        },
        {
            name: 'CreateOrder',
            path: "create",
            component: () => import("@/views/admin/orders/CreateOrder.vue"),
            meta: { requiresAuth: true }
        },
        {
            name: 'CreateeOrder',
            path: "createe",
            component: () => import("@/views/admin/products/Orderpanel.vue"),
            meta: { requiresAuth: true }
        },
        {
            name: 'EditOrder',
            path: ":id/edit",
            component: () => import("@/views/admin/orders/EditOrder.vue"),
            meta: { requiresAuth: true }
        },
        // {
        //     path: ':id',
        //     name: 'ViewOrder',
        //     component: () => import('@/views/admin/orders/OrderDetail.vue')
        // },
        {
            path: ':id/approve',
            name: 'ApproveOrder',
            component: () => import('@/views/admin/orders/ApproveOrder.vue')
        },
    ]
};

export default OrderRoutes;
