// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import { auth } from '@/services/firebase';
import { verifyUserRole } from '@/services/authListenerService';
import { useAuthStore } from '@/stores/authStore';

// Import route modules
import MainRoutes from './MainRoutes';
import AuthRoutes from './AuthRoutes';
import BranchesRoutes from './BranchesRoutes';
import { AdminRoutesFullLayout, AdminRoutesBlankLayout } from './AdministratorRoutes';
import OrderRoutes from './OrderRoutes';
import InventoryRoutes from './InventoryRoutes';
import ProductRoutes from './ProductRoutes'

// Define allowed admin roles
const adminRoles = ['owner', 'manager', 'stock_manager', 'admin'];

// Create router with routes
const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        MainRoutes,
        AuthRoutes, // This should be a single object, not an array
        BranchesRoutes,
        AdminRoutesFullLayout,
        AdminRoutesBlankLayout,
        OrderRoutes,
        InventoryRoutes,
        ProductRoutes,
        
        // Catch-all route
        {
            path: '/:pathMatch(.*)*',
            component: () => import('@/views/auth/Error.vue')
        }
    ],
});

// Global route guard
router.beforeEach(async (to, from, next) => {
    console.log('Route navigation to:', to.path);
    const authStore = useAuthStore();

    // If auth is still initializing and going to a protected route, wait
    if (authStore.isInitializing && to.meta.requiresAuth) {
        // Store the intended destination
        localStorage.setItem('intendedRoute', to.fullPath);
        console.log('Auth initializing, delaying navigation to:', to.fullPath);
        return next(false);
    }

    // For protected routes, verify directly with Firebase
    if (to.meta.requiresAuth) {
        
        // Get current user directly from Firebase
        const currentUser = auth.currentUser;

        if (!currentUser) {
            // No user is signed in
            authStore.isLoggedIn = false;

            // Store intended destination
            if (to.fullPath !== '/account/login') {
                localStorage.setItem('intendedRoute', to.fullPath);
            }

            console.log('Not authenticated, redirecting to login');
            return next({ name: 'Login' });
        }

        // Check roles if required
        let userData;
        // For admin routes, verify role directly with Firebase
        if (to.meta.requiresAdmin || (to.meta.roles && to.meta.roles.length > 0)) {
            // Use the roles from meta if available, otherwise use adminRoles
            const requiredRoles = to.meta.roles || adminRoles;
            const { isAuthorized, userData: fetchedUserData } = await verifyUserRole(requiredRoles);

            if (!isAuthorized) {
                console.log('Insufficient permissions, redirecting to unauthorized');
                return next({ name: 'Unauthorized' });
            }

            // Store retrieved data
            userData = fetchedUserData;
        }

        // Save admin routes for future reference
        if (to.path.startsWith('/administrator') && authStore.isAdmin) {
            localStorage.setItem('lastVisitedRoute', to.fullPath);
        }

        // Pass data as props to the route
        to.params.userData = userData;
    }

    // Always save last visited route for non-login pages
    if (to.path !== '/account/login') {
        localStorage.setItem('lastVisitedRoute', to.path);
        console.log('Last visited route set to:', to.path);
    }

    // Proceed to the route
    next();
});

export default router;








// // src/router/index.js
// import { createRouter, createWebHistory } from 'vue-router'; // Use standard import, not /auto
// import { auth } from '@/services/firebase';
// import { verifyUserRole } from '@/services/authListenerService';
// import { useAuthStore } from '@/stores/authStore';

// // Import route modules with error checking
// // Add console logs to identify which module might be causing issues
// // console.log('Importing MainRoutes');
// import MainRoutes from './MainRoutes';
// // console.log('MainRoutes:', MainRoutes);

// // console.log('Importing AuthRoutes');
// import AuthRoutes from './AuthRoutes';
// console.log('AuthRoutes:', AuthRoutes);

// // console.log('Importing BranchesRoutes');
// import BranchesRoutes from './BranchesRoutes';
// // console.log('BranchesRoutes:', BranchesRoutes);

// // console.log('Importing AdminRoutes');
// import { AdminRoutesFullLayout, AdminRoutesBlankLayout } from './AdministratorRoutes';
// // console.log('AdminRoutesFullLayout:', AdminRoutesFullLayout);
// // console.log('AdminRoutesBlankLayout:', AdminRoutesBlankLayout);

// // console.log('Importing OrderRoutes');
// import OrderRoutes from './OrderRoutes';
// // console.log('OrderRoutes:', OrderRoutes);

// // Define allowed admin roles
// const adminRoles = ['owner', 'manager', 'stock_manager', 'admin'];

// // Safely collect routes - filter out any undefined routes
// const collectRoutes = () => {
//     const routeModules = [
//         MainRoutes,
//         AuthRoutes,
//         BranchesRoutes,
//         AdminRoutesFullLayout,
//         AdminRoutesBlankLayout,
//         OrderRoutes,
//     ];

//     // Filter out undefined routes and log warnings
//     const validRoutes = routeModules.filter(route => {
//         if (!route) {
//             console.warn('Found undefined route module:', route);
//             return false;
//         }
//         return true;
//     });

//     // Add catch-all route
//     validRoutes.push({
//         path: '/:pathMatch(.*)*',
//         component: () => import('@/views/auth/Error.vue')
//     });

//     return validRoutes;
// };

// // Create router with collected routes
// const router = createRouter({
//     history: createWebHistory(import.meta.env.BASE_URL),
//     routes: collectRoutes(),
// });

// // Global route guard
// router.beforeEach(async (to, from, next) => {
//     console.log('Route navigation to:', to.path);
//     const authStore = useAuthStore();

//     // If auth is still initializing and going to a protected route, wait
//     if (authStore.isInitializing && to.meta.requiresAuth) {
//         // Store the intended destination
//         localStorage.setItem('intendedRoute', to.fullPath);
//         console.log('Auth initializing, delaying navigation to:', to.fullPath);
//         return next(false);
//     }

//     // For protected routes, verify directly with Firebase
//     if (to.meta.requiresAuth) {
//         // Get current user directly from Firebase
//         const currentUser = auth.currentUser;

//         if (!currentUser) {
//             // No user is signed in
//             authStore.isLoggedIn = false;

//             // Store intended destination
//             if (to.fullPath !== '/account/login') {
//                 localStorage.setItem('intendedRoute', to.fullPath);
//             }

//             console.log('Not authenticated, redirecting to login');
//             return next({ name: 'Login' });
//         }

//         // Check roles if required
//         let userData;
//         // For admin routes, verify role directly with Firebase
//         if (to.meta.requiresAdmin || (to.meta.roles && to.meta.roles.length > 0)) {
//             // Use the roles from meta if available, otherwise use adminRoles
//             const requiredRoles = to.meta.roles || adminRoles;
//             // const hasRequiredRole = await verifyUserRole(requiredRoles);
//             const { isAuthorized: isAuthorized, userData: fetchedUserData } = await verifyUserRole(requiredRoles);

//             // if (!hasRequiredRole) {
//             //     console.log('Insufficient permissions, redirecting to unauthorized');
//             //     return next({ name: 'Unauthorized' });
//             // }
//             if (!isAuthorized) {
//                 console.log('Insufficient permissions, redirecting to unauthorized');
//                 return next({ name: 'Unauthorized' });
//             }

//             // Store retrieved data
//             userData = fetchedUserData;

//         }

//         // Save admin routes for future reference
//         if (to.path.startsWith('/administrator') && authStore.isAdmin) {
//             localStorage.setItem('lastVisitedRoute', to.fullPath);
//         }

//         // Pass data as props to the route
//         to.params.userData = userData;
//     }

//     // Always save last visited route for non-login pages
//     if (to.path !== '/account/login') {
//         localStorage.setItem('lastVisitedRoute', to.path);
//         console.log('Last visited route set to:', to.path);
//     }

//     // Proceed to the route
//     next();
// });

// // // Log all registered routes for debugging
// // console.log('All registered routes:');
// // router.getRoutes().forEach(route => {
// //     console.log(`- ${route.path} (${route.name || 'unnamed'})`);
// // });

// export default router;