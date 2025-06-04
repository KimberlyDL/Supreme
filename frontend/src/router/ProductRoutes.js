// frontend\src\router\InventoryRoutes.js
// src/router/InventoryRoutes.js
const InventoryRoutes = {
    path: '/administrator/products',
    meta: {
        requiresAuth: true,
        requiresAdmin: true,
        roles: ['owner', 'manager', 'assistant_manager', 'stock_manager']
    },
    redirect: '/administrator',
    component: () => import('@/layouts/admin/AdminLayout.vue'),
    children: [
        {
            name: 'AdminDashboardProducts',
            path: '',
            component: () => import('@/views/admin/products/Products.vue'),
            meta: {
                requiresAuth: true,
                requiresAdmin: true
            },
            props: route => ({ userData: route.params.userData })
        },
        {
            name: 'ProductDetails',
            path: ':id',
            component: () => import('@/views/admin/products/ProductDetails.vue')
        },
        {
            name: 'CreateProduct',
            path: "create",
            component
                : () =>
                    import("@/views/admin/products/AddProduct.vue"),
            meta: {
                requiresAuth: true,
                requiresAdmin: true
            },
            props: route => ({ userData: route.params.userData })
        },
        {
            name: 'EditProduct',
            path: ":id/edit",
            component
                : () =>
                    import("@/views/admin/products/EditProduct.vue"),
            meta: {
                requiresAuth: true,
                requiresAdmin: true
            },
            props: route => ({ userData: route.params.userData })
        },
        {
            path: "modal/:modalType/:id",
            name: "ProductModalWithId",
            component: () => import("@/views/admin/products/Products.vue"),
            meta: { requiresAuth: true, requiresAdmin: true, roles: ['owner', 'manager', 'assistant_manager'] },
            props: route => ({ userData: route.params.userData })
        }
    ]
};

export default InventoryRoutes;