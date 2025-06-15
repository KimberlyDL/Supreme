// src/router/index.js
import { createRouter, createWebHistory } from "vue-router";
import { auth } from "@/services/firebase";
import { verifyUserRole } from "@/services/authListenerService";
import { useAuthStore } from "@/stores/authStore";

// Import route modules
import MainRoutes from "./MainRoutes";
import AuthRoutes from "./AuthRoutes";
import BranchesRoutes from "./BranchesRoutes";
import {
  AdminRoutesFullLayout,
  AdminRoutesBlankLayout,
} from "./AdministratorRoutes";
import OrderRoutes from "./OrderRoutes";
import InventoryRoutes from "./InventoryRoutes";
import ProductRoutes from "./ProductRoutes";

// Define allowed admin roles
const adminRoles = ["owner", "manager", "stock_manager", "admin"];

// Create router with routes
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    MainRoutes,
    AuthRoutes,
    BranchesRoutes,
    AdminRoutesFullLayout,
    AdminRoutesBlankLayout,
    OrderRoutes,
    InventoryRoutes,
    ProductRoutes,

    {
      path: "/:pathMatch(.*)*",
      component: () => import("@/views/auth/Error.vue"),
    },
  ],
});

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  
  const isLoggedIn = !!authStore.user;
  console.log("[Router Guard] isInitializing:", authStore.isInitializing);

  const isAuthPage = ["Login", "Logout"].includes(to.name);

  if (!isAuthPage) {
    localStorage.setItem("intendedRoute", to.fullPath);
  }

  if (authStore.isInitializing) {
    console.log("[Router] Auth still initializing, canceling navigation");
    return next(false);
  }

  if (to.meta.requiresAuth && !isLoggedIn) {
    console.log("[Router] Not logged in, redirecting to login");
    return next({ name: "Login" });
  }

  if (to.name === "Login" && isLoggedIn) {
    const redirectTo = localStorage.getItem("intendedRoute");
    localStorage.removeItem("intendedRoute");
    return next(redirectTo);
  }

  if (to.meta.requiresAuth) {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      console.log("[Router] Firebase user missing, redirecting to login");
      return next({ name: "Login" });
    }

    if (to.meta.requiresAdmin || (to.meta.roles && to.meta.roles.length)) {
      const requiredRoles = to.meta.roles || adminRoles;
      const { isAuthorized, userData } = await verifyUserRole(requiredRoles);

      if (!isAuthorized) {
        return next({ name: "Unauthorized" });
      }

      console.log("userData for index");
      console.log(userData);

      to.params.userData = userData;
    }
  }
  next();
});

router.afterEach((to) => {
  if (!["Login", "Logout"].includes(to.name)) {
    console.log(to.fullPath);
    localStorage.setItem("lastVisitedRoute", to.fullPath);
  }
});

export default router;
