// src\router\MainRoutes.ts
import authMiddleware from '@/middleware/auth';

const MainRoutes = {
    path: '/',
    // meta: {
    //     requiresAuth: true
    // },
    redirect: '/',
    component: () => import('@/layouts/empty/BlankLayout.vue'),
    children: [
        {
            name: 'Home',
            path: '',
            component: () => import('@/views/site/Home.vue'),
        },
        {
            name: 'About',
            path: '',
            component: () => import('@/views/site/Home.vue'),
        },
        {
            name: 'Services',
            path: '',
            component: () => import('@/views/site/Home.vue'),
        },
        {
            name: 'Contact',
            path: '',
            component: () => import('@/views/site/Home.vue'),
        },
    ]
};

export default MainRoutes;
