// frontend\src\router\InventoryRoutes.js
// src/router/InventoryRoutes.js
const InventoryRoutes = {
    path: '/administrator/inventory',
    meta: {
        requiresAuth: true,
        requiresAdmin: true,
        roles: ['owner', 'manager', 'assistant_manager', 'stock_manager']
    },
    redirect: '/administrator/inventory',
    component: () => import('@/layouts/admin/AdminLayout.vue'),
    children: [
        {
            name: 'InventoryManagement',
            path: '',
            component: () => import('@/views/admin/inventory/InventoryManagement.vue'),
            meta: {
                requiresAuth: true,
                roles: ['owner', 'manager', 'assistant_manager', 'stock_manager']
            },
            props: route => ({ userData: route.params.userData })
        },
        {
            name: 'StockOverview',
            path: 'overview',
            component: () => import('@/views/admin/inventory/StockOverview.vue'),
            meta: {
                requiresAuth: true,
                roles: ['owner', 'manager', 'assistant_manager', 'stock_manager', 'helper']
            },
            props: route => ({ userData: route.params.userData })
        },
        {
            name: 'AddStock',
            path: 'add',
            component: () => import('@/views/admin/inventory/AddStock.vue'),
            meta: {
                requiresAuth: true,
                roles: ['owner', 'manager', 'assistant_manager', 'stock_manager']
            },
            props: route => ({ userData: route.params.userData })
        },
        {
            name: 'RejectStock',
            path: 'reject',
            component: () => import('@/views/admin/inventory/RejectStock.vue'),
            meta: {
                requiresAuth: true,
                roles: ['owner', 'manager', 'assistant_manager', 'stock_manager']
            },
            props: route => ({ userData: route.params.userData })
        },
        {
            name: 'TransferStock',
            path: 'transfer',
            component: () => import('@/views/admin/inventory/TransferStock.vue'),
            meta: {
                requiresAuth: true,
                roles: ['owner']
            },
            props: route => ({ userData: route.params.userData })
        },
        {
            name: 'AdjustStock',
            path: 'adjust',
            component: () => import('@/views/admin/inventory/AdjustStock.vue'),
            meta: {
                requiresAuth: true,
                roles: ['owner', 'manager']
            },
            props: route => ({ userData: route.params.userData })
        },
        {
            name: 'InventoryLogs',
            path: 'logs',
            component: () => import('@/views/admin/inventory/InventoryLogs.vue'),
            meta: {
                requiresAuth: true,
                roles: ['owner', 'manager', 'assistant_manager']
            },
            props: route => ({ userData: route.params.userData })
        }
    ]
};

export default InventoryRoutes;