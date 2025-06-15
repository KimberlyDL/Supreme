// src\router\MainRoutes.ts
import authMiddleware from "@/middleware/auth";

const MainRoutes = {
  path: "/",
  meta: {
    requiresAuth: false,
  },
  redirect: "/",
  component: () => import("@/layouts/empty/BlankLayout.vue"),
  children: [
    {
      name: "Home",
      path: "",
      component: () => import("@/views/site/Home.vue"),
    },
    {
      name: "About",
      path: "about-us",
      component: () => import("@/views/site/AboutUs.vue"),
    },
    {
      name: "Services",
      path: "",
      component: () => import("@/views/site/Home.vue"),
    },
    {
      name: "Contact",
      path: "contact-us",
      component: () => import("@/views/site/ContactUs.vue"),
    },
    {
      name: "HomeProductCatalog",
      path: "products",
      component: () => import("@/views/site/ProductCatalog.vue"),
    },
    {
      name: "BranchProductCatalog",
      path: "products/:branchSlug",
      component: () => import("@/views/site/ProductCatalog.vue"),
      props: true,
    },
  ],
};

export default MainRoutes;
