// src\router\MainRoutes.ts
import authMiddleware from '@/middleware/auth';

const MainRoutes = {
    path: '/',
    meta: {
        requiresAuth: true
    },
    redirect: '/',
    component: () => import('@/layouts/blank/BlankLayout.vue'),
    children: [
        {
            name: 'Home',
            path: '',
            component: () => import('@/views/site/Home.vue'),
        },
    ]
};

export default MainRoutes;
