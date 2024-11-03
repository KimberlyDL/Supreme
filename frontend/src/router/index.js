import { createRouter, createWebHistory } from 'vue-router';
import AdminPanel from '../views/AdminPanel.vue'; 
import Dashboard from '../components/Dashboard.vue'; 
import UserManagement from '../components/UserManagement.vue'; 
import ProductView from '../components/ProductView.vue'; 
import UserView from '../views/UserView.vue'; // User view


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

  { path: '/userview', 
    name: 'Userview', 
    component: UserView
  }, // User section
]





















const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
