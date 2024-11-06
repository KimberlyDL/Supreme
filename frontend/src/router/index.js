import { createRouter, createWebHistory } from 'vue-router';
import AdminPanel from '../views/AdminPanel.vue'; 
import Dashboard from '../components/Dashboard.vue'; 
import UserManagement from '../components/UserManagement.vue'; 
import ProductView from '../components/ProductView.vue'; 
import Home from '../views/site/Home.vue'; // Import Home component
import ProductCatalog from '../views/site/ProductCatalog.vue'; // Import ProductCatalog
import OrdersTracking from '../views/site/OrdersTracking.vue'; // Import OrdersTracking
import Promotions from '../views/site/Promotions.vue'; // Import Promotions
import SupportTutorials from '../views/site/SupportTutorials.vue'; // Import SupportTutorials


const routes = [
  {
    path: '/admin',
    component: AdminPanel,
    children: [
      {
        path: '',
        name: 'Dashboard',
        component: Dashboard
      },
      {
        path: 'users',
        name: 'Users',
        component: UserManagement
      },
      {
        path: 'products',
        name: 'Products',
        component: ProductView
      },
    ]
  },

  // Add your new routes for the landing page and catalog
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/catalog',
    name: 'ProductCatalog',
    component: ProductCatalog
  },
  {
    path: '/orders-tracking',
    name: 'OrdersTracking',
    component: OrdersTracking
  },
  {
    path: '/promotions',
    name: 'Promotions',
    component: Promotions
  },
  {
    path: '/support-tutorials',
    name: 'SupportTutorials',
    component: SupportTutorials
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
