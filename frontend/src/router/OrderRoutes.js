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
        // {
        //     name: 'CreateOrder',
        //     path: "create",
        //     component: () => import("@/views/admin/orders/CreateOrder.vue"),
        //     meta: { requiresAuth: true }
        // },
        {
            name: 'CreateOrder',
            path: "create",
            component: () => import("@/views/admin/orders/CreateOrder.vue"),
            meta: { requiresAuth: true }
        },
        {
            name: 'EditOrder',
            path: ":id/edit",
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
            component: () => import('@/views/admin/orders/ApproveOrder.vue'),
            meta: { requiresAuth: true, requiresAdmin: true }
        },
        {
            path: ':id',
            name: "ViewOrder",
            component: () => import("@/views/admin/orders/ViewOrder.vue"),
            meta: { requiresAuth: true, requiresAdmin: true }
        },
        // {
        //     path: ":id/edit", name
        //         : 'EditOrder',
        //     component: () =>
        //         import("@/views/admin/orders/EditOrder.vue"), 
        //     meta:
        //     {
        //         requiresAuth: true, requiresAdmin
        //             : true
        //     }
        // }
        // ,
        // {
        //     path: "/administrator/orders/:id/approve", name
        //         : 'ApproveOrder',
        //     component: () =>
        //         import("@/views/admin/orders/ApproveOrder.vue"), meta
        //         :
        //     {
        //         requiresAuth: true, requiresAdmin
        //             : true
        //     }
        // }

    ]
};

export default OrderRoutes;
