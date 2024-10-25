// frontend\src\router\index copy.js
// import { createRouter, createWebHistory } from 'vue-router';
// import MainRoutes from './MainRoutes';
// import AuthRoutes from './AuthRoutes';

// const router = createRouter({
//     history: createWebHistory(import.meta.env.BASE_URL),
//     routes: [
//         {
//             path: '/:pathMatch(.*)*',
//             component: () => import('@/views/auth/Error.vue')
//         },
//         MainRoutes,
//         AuthRoutes
//     ]
// });

// export default router; 


// frontend\src\router\index.js
import { createRouter, createWebHistory } from 'vue-router';
import MainRoutes from './MainRoutes'; // Your main routes
import AuthRoutes from './AuthRoutes'; // Your auth routes

// Importing the components for the new routes
import Home from '@views/Home.vue';
import About from '@views/About.vue';
import Login from '@views/Login.vue';
import Signup from '@views/user/Register.vue';
import PushNotif from '@views/user/PushNotif.vue';

// Define the new routes from the admin design
const adminRoutes = [
  { path: '/', component: Home },
  { path: '/about', component: About },
  { path: '/login', component: Login },
  { path: '/signup', component: Signup },
  { path: '/push-notif', component: PushNotif },
];

// Combine all routes
const routes = [
  ...adminRoutes, // Spread operator to include admin routes
  MainRoutes,
  AuthRoutes,
  {
    path: '/:pathMatch(.*)*',
    component: () => import('@/views/auth/Error.vue') // Catch-all for unmatched routes
  },
];

// Create the router
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
