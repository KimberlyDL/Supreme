<!-- frontend\src\layouts\admin\components\sideabar.vue -->
<template>
  <aside :class="[
    'fixed inset-y-0 left-0 z-20 flex flex-col w-64 transition-all duration-300 ease-in-out bg-bgPrimary-0 border-r border-bgPrimary-200',
    { '-translate-x-full': !isOpen, 'translate-x-0': isOpen },
  ]">
    <!-- Toggle button -->
    <div class="flex items-center justify-between p-4 pt-10">
      <button @click="$emit('toggle-sidebar')" type="button"></button>
    </div>

    <div class="flex flex-col flex-1 overflow-y-auto">
      <nav class="flex-1 px-3 py-4 space-y-2">
        <!-- Simple Links -->
        <SidebarLink to="AdminDashboard" :icon="LayoutDashboard" label="Dashboard" />
        <SidebarLink to="ReportDashboard" :icon="UsersRound" label="Report Dashboard" />
        <SidebarLink to="AdminDashboardBranches" :icon="Store" label="Branches" />
        <SidebarLink to="AdminDashboardEmployees" :icon="UsersRound" label="Employees" />
        <SidebarLink to="InventoryManagement" :icon="Boxes" label="Inventory" />

        <!-- Dropdowns -->
        <SidebarDropdown label="Landing Page" name="landingPage" :icon="PanelsTopLeft" :activeDropdown="activeDropdown" @toggle="toggleDropdown">
          <SidebarLink to="HomeProductCatalog" :icon="PanelsTopLeft" label="Landing Page" :nested="true" />
          <SidebarLink to="HomeProductCatalog" :icon="ShoppingBasket" label="Products" :nested="true" />
        </SidebarDropdown>

        <SidebarDropdown label="Analytics" name="analytics" :icon="ChartPie" :activeDropdown="activeDropdown" @toggle="toggleDropdown">
          <SidebarLink to="ReportDashboard" :icon="ChartPie" label="Report Dashboard" :nested="true" />
        </SidebarDropdown>

        <SidebarDropdown label="Sales" name="sale" :icon="ChartColumnBig" :activeDropdown="activeDropdown" @toggle="toggleDropdown">
          <SidebarLink to="AdminDashboardProducts" :icon="ChartColumnBig" label="Sales" :nested="true" />
          <SidebarLink to="SaleLogs" :icon="FileClock" label="Sale Log" :nested="true" />
        </SidebarDropdown>

        <SidebarDropdown label="Products" name="products" :icon="Box" :activeDropdown="activeDropdown" @toggle="toggleDropdown">
          <SidebarLink to="AdminDashboardProducts" :icon="Box" label="Products" :nested="true" />
          <SidebarLink to="CreateProduct" :icon="PackagePlus" label="Add Product" :nested="true" />
          <SidebarLink to="CreateProduct" :icon="FileClock" label="Product Logs" :nested="true" />
          <SidebarLink to="Categories" :icon="Shapes" label="Categories" :nested="true" />
        </SidebarDropdown>

        <SidebarDropdown label="Orders" name="order" :icon="ShoppingCart" :activeDropdown="activeDropdown" @toggle="toggleDropdown">
          <SidebarLink to="OrderList" :icon="ShoppingCart" label="Orders" :nested="true" />
          <SidebarLink to="CreateOrder" :icon="SquarePlus" label="Create Orders" :nested="true" />
          <SidebarLink to="OrderLogs" :icon="FileClock" label="Order Logs" :nested="true" />
        </SidebarDropdown>
      </nav>
    </div>

    <!-- Theme Switcher -->
    <div class="p-4 border-t border-bgPrimary-200">
      <ThemeSwitcher />
    </div>
  </aside>
</template>

<script setup>
import { ref } from 'vue';
import {
  LayoutDashboard, Store, UsersRound, Boxes, Box, ShoppingCart,
  FileClock, PackagePlus, SquarePlus, ChartColumnBig,
  PanelsTopLeft, ShoppingBasket, ChartPie,
  Shapes
} from 'lucide-vue-next';
import { useRoute } from 'vue-router';
import ThemeSwitcher from '@/components/ThemeSwitcher.vue';
import SidebarLink from './sidebarLink.vue';
import SidebarDropdown from './sidebarDropdown.vue';

defineProps({
  isOpen: {
    type: Boolean,
    default: true
  }
});

const activeDropdown = ref(null);
const toggleDropdown = (name) => {
  activeDropdown.value = activeDropdown.value === name ? null : name;
};

</script>
