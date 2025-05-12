<!-- frontend\src\layouts\admin\components\sidebar.vue -->
<template>
    <aside :class="[
        'fixed inset-y-0 left-0 z-20 flex flex-col w-64 transition-all duration-300 ease-in-out bg-bgPrimary-0 border-r border-bgPrimary-200',
        { '-translate-x-full': !isOpen, 'translate-x-0': isOpen },
    ]">
        <div class="flex items-center justify-between p-4 pt-10">
            <button @click="$emit('toggle-sidebar')" type="button"></button>
        </div>
        <div class="flex flex-col flex-1 overflow-y-auto">
            <nav class="flex-1 px-3 py-4 space-y-1">
                <router-link :to="{ name: 'AdminDashboard' }"
                    class="flex items-center p-2 text-base font-inter font-regular text-tBase-100 rounded-lg hover:bg-bgPrimary-100">
                    <LayoutDashboard :stroke-width="1" class="text-primary-500" />
                    <span class="ml-3">Dashboard</span>
                </router-link>



                <!-- Landing Page Management Dropdown -->
                <div class="relative">
                    <button @click="toggleDropdown('landingPage')"
                        class="flex items-center w-full p-2 text-base font-inter font-regular text-tBase-100 transition duration-75 rounded-lg group hover:bg-bgPrimary-100"
                        :aria-expanded="activeDropdown === 'landingPage'">
                        <PanelsTopLeft :stroke-width="1" class="text-primary-500" />
                        <span class="flex-1 ml-3 text-left whitespace-nowrap">Landing Page</span>
                    </button>
                    <ul v-show="activeDropdown === 'landingPage'" class="py-2 space-y-2">
                        <li>
                            <router-link :to="{ name: 'HomeProductCatalog' }"
                                class="flex items-center w-full p-2 text-base font-inter font-regular text-tBase-100 transition duration-75 rounded-lg pl-11 group hover:bg-bgPrimary-100">
                                <PanelsTopLeft :stroke-width="1" class="text-primary-500" />
                                <span class="flex-1 ml-3 text-left whitespace-nowrap">Landing Page</span>
                            </router-link>
                        </li>
                        <li>
                            <router-link :to="{ name: 'HomeProductCatalog' }"
                                class="flex items-center w-full p-2 text-base font-inter font-regular text-tBase-100 transition duration-75 rounded-lg pl-11 group hover:bg-bgPrimary-100">
                                <ShoppingBasket :stroke-width="1" class="text-primary-500" />
                                <span class="flex-1 ml-3 text-left whitespace-nowrap">Products</span>
                            </router-link>
                        </li>
                    </ul>
                </div>

                <router-link :to="{ name: 'ReportDashboard' }"
                    class="flex items-center p-2 text-base font-inter font-regular text-tBase-100 rounded-lg hover:bg-bgPrimary-100">
                    <UsersRound :stroke-width="1" class="text-primary-500" />
                    <span class="ml-3">Report Dashboard</span>
                </router-link>


                <!-- Analytics Management Dropdown -->
                <div class="relative">
                    <button @click="toggleDropdown('analytics')"
                        class="flex items-center w-full p-2 text-base font-inter font-regular text-tBase-100 transition duration-75 rounded-lg group hover:bg-bgPrimary-100"
                        :aria-expanded="activeDropdown === 'analytics'">
                        <ChartPie :stroke-width="1" class="text-primary-500" />
                        <span class="flex-1 ml-3 text-left whitespace-nowrap">Analytics</span>
                    </button>
                    <ul v-show="activeDropdown === 'analytics'" class="py-2 space-y-2">
                        <li>
                            <router-link :to="{ name: 'ReportDashboard' }"
                                class="flex items-center w-full p-2 text-base font-inter font-regular text-tBase-100 transition duration-75 rounded-lg pl-11 group hover:bg-bgPrimary-100">
                                <ChartPie :stroke-width="1" class="text-primary-500" />
                                <span class="flex-1 ml-3 text-left whitespace-nowrap">Report Dashboard</span>
                            </router-link>
                        </li>
                        <!-- <li>
                            <router-link :to="{ name: 'HomeProductCatalog' }"
                                class="flex items-center w-full p-2 text-base font-inter font-regular text-tBase-100 transition duration-75 rounded-lg pl-11 group hover:bg-bgPrimary-100">
                                <ShoppingBasket :stroke-width="1" class="text-primary-500" />
                                <span class="flex-1 ml-3 text-left whitespace-nowrap">Products</span>
                            </router-link>
                        </li> -->
                    </ul>
                </div>



                <router-link :to="{ name: 'AdminDashboardBranches' }"
                    class="flex items-center p-2 text-base font-inter font-regular text-tBase-100 rounded-lg hover:bg-bgPrimary-100">
                    <Store :stroke-width="1" class="text-primary-500" />
                    <span class="ml-3">Branches</span>
                </router-link>

                <router-link :to="{ name: 'AdminDashboardEmployees' }"
                    class="flex items-center p-2 text-base font-inter font-regular text-tBase-100 rounded-lg hover:bg-bgPrimary-100">
                    <UsersRound :stroke-width="1" class="text-primary-500" />
                    <span class="ml-3">Employees</span>
                </router-link>

                <!-- Sales Management Dropdown -->
                <div class="relative">
                    <button @click="toggleDropdown('sale')"
                        class="flex items-center w-full p-2 text-base font-inter font-regular text-tBase-100 transition duration-75 rounded-lg group hover:bg-bgPrimary-100"
                        :aria-expanded="activeDropdown === 'sale'">
                        <ChartColumnBig :stroke-width="1" class="text-primary-500" />
                        <span class="flex-1 ml-3 text-left whitespace-nowrap">Sales</span>
                    </button>
                    <ul v-show="activeDropdown === 'sale'" class="py-2 space-y-2">
                        <li>
                            <router-link :to="{ name: 'AdminDashboardProducts' }"
                                class="flex items-center w-full p-2 text-base font-inter font-regular text-tBase-100 transition duration-75 rounded-lg pl-11 group hover:bg-bgPrimary-100">
                                <ChartColumnBig :stroke-width="1" class="text-primary-500" />
                                <span class="flex-1 ml-3 text-left whitespace-nowrap">Sales</span>
                            </router-link>
                        </li>
                        <li>
                            <router-link :to="{ name: 'SaleLogs' }"
                                class="flex items-center w-full p-2 text-base font-inter font-regular text-tBase-100 transition duration-75 rounded-lg pl-11 group hover:bg-bgPrimary-100">
                                <FileClock :stroke-width="1" class="text-primary-500" />
                                <span class="flex-1 ml-3 text-left whitespace-nowrap">Sale Log</span>
                            </router-link>
                        </li>
                    </ul>
                </div>


                <!-- Product Management Dropdown -->
                <div class="relative">
                    <button @click="toggleDropdown('products')"
                        class="flex items-center w-full p-2 text-base font-inter font-regular text-tBase-100 transition duration-75 rounded-lg group hover:bg-bgPrimary-100"
                        :aria-expanded="activeDropdown === 'prducts'">
                        <Box :stroke-width="1" class="text-primary-500" />
                        <span class="flex-1 ml-3 text-left whitespace-nowrap">Products</span>
                    </button>
                    <ul v-show="activeDropdown === 'prducts'" class="py-2 space-y-2">
                        <li>
                            <router-link :to="{ name: 'AdminDashboardProducts' }"
                                class="flex items-center w-full p-2 text-base font-inter font-regular text-tBase-100 transition duration-75 rounded-lg pl-11 group hover:bg-bgPrimary-100">
                                <Box :stroke-width="1" class="text-primary-500" />
                                <span class="flex-1 ml-3 text-left whitespace-nowrap">Products</span>
                            </router-link>
                        </li>
                        <li>
                            <router-link :to="{ name: 'CreateProduct' }"
                                class="flex items-center w-full p-2 text-base font-inter font-regular text-tBase-100 transition duration-75 rounded-lg pl-11 group hover:bg-bgPrimary-100">
                                <PackagePlus :stroke-width="1" class="text-primary-500" />
                                <span class="flex-1 ml-3 text-left whitespace-nowrap">Add Product</span>
                            </router-link>
                        </li>
                        <li>
                            <router-link :to="{ name: 'CreateProduct' }"
                                class="flex items-center w-full p-2 text-base font-inter font-regular text-tBase-100 transition duration-75 rounded-lg pl-11 group hover:bg-bgPrimary-100">
                                <FileClock :stroke-width="1" class="text-primary-500" />
                                <span class="flex-1 ml-3 text-left whitespace-nowrap">Product Logs</span>
                            </router-link>
                        </li>
                    </ul>
                </div>


                <!-- Order Management Dropdown -->
                <div class="relative">
                    <button @click="toggleDropdown('order')"
                        class="flex items-center w-full p-2 text-base font-inter font-regular text-tBase-100 transition duration-75 rounded-lg group hover:bg-bgPrimary-100"
                        :aria-expanded="activeDropdown === 'order'">
                        <ShoppingCart :stroke-width="1" class="text-primary-500" />
                        <span class="flex-1 ml-3 text-left whitespace-nowrap">Orders</span>
                    </button>
                    <ul v-show="activeDropdown === 'order'" class="py-2 space-y-2">
                        <li>
                            <router-link :to="{ name: 'OrderList' }"
                                class="flex items-center w-full p-2 text-base font-inter font-regular text-tBase-100 transition duration-75 rounded-lg pl-11 group hover:bg-bgPrimary-100">
                                <ShoppingCart :stroke-width="1" class="text-primary-500" />
                                <span class="flex-1 ml-3 text-left whitespace-nowrap">Orders</span>
                            </router-link>
                        </li>
                        <li>
                            <router-link :to="{ name: 'CreateOrder' }"
                                class="flex items-center w-full p-2 text-base font-inter font-regular text-tBase-100 transition duration-75 rounded-lg pl-11 group hover:bg-bgPrimary-100">
                                <SquarePlus :stroke-width="1" class="text-primary-500" />
                                <span class="flex-1 ml-3 text-left whitespace-nowrap">Create Orders</span>
                            </router-link>
                        </li>
                        <li>
                            <router-link :to="{ name: 'OrderLogs' }"
                                class="flex items-center w-full p-2 text-base font-inter font-regular text-tBase-100 transition duration-75 rounded-lg pl-11 group hover:bg-bgPrimary-100">
                                <FileClock :stroke-width="1" class="text-primary-500" />
                                <span class="flex-1 ml-3 text-left whitespace-nowrap">Order Logs</span>
                            </router-link>
                        </li>
                    </ul>
                </div>

                <!-- Inventory Management Link -->
                <router-link :to="{ name: 'InventoryManagement' }"
                    class="flex items-center p-2 text-base font-inter font-regular text-tBase-100 rounded-lg hover:bg-bgPrimary-100"
                    v-slot="{ isActive }">
                    <div :class="[
                        'flex items-center',
                        isActive ? 'text-primary-500' : 'text-tBase-100'
                    ]">
                        <Boxes :stroke-width="1" class="text-primary-500" />
                        <!-- <span class="ml-3">Inventory</span> -->
                        <span class="flex-1 ml-3 text-left whitespace-nowrap">Inventory</span>
                    </div>

                    <!-- Tooltip for collapsed state
                    <div v-if="isCollapsed"
                        class="absolute left-full ml-6 px-2 py-1 bg-bgPrimary-800 text-white text-sm rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-50">
                        Inventory
                    </div> -->
                </router-link>


                <!-- <router-link :to="{ name: 'OrderLogs' }"
                    class="flex items-center p-2 text-base font-inter font-regular text-tBase-100 rounded-lg hover:bg-bgPrimary-100">
                    <UsersRound :stroke-width="1" class="text-primary-500" />
                    <span class="ml-3">OrderLogs</span>
                </router-link> -->

                <!-- <router-link :to="{ name: 'SaleLogs' }"
                    class="flex items-center p-2 text-base font-inter font-regular text-tBase-100 rounded-lg hover:bg-bgPrimary-100">
                    <UsersRound :stroke-width="1" class="text-primary-500" />
                    <span class="ml-3">SaleLOgs</span>
                </router-link> -->



                <!-- <router-link :to="{ name: 'CreateOrder' }"
                    class="flex items-center p-2 text-base font-inter font-regular text-tBase-100 rounded-lg hover:bg-bgPrimary-100">
                    <UsersRound :stroke-width="1" class="text-primary-500" />
                    <span class="ml-3">CreateeOrder</span>
                </router-link> -->
            </nav>
        </div>

        <!-- Theme Switcher at the bottom of sidebar -->
        <div class="p-4 border-t border-bgPrimary-200">
            <ThemeSwitcher />
        </div>
    </aside>
</template>

<script setup>
import { ref } from 'vue';
import {
    LayoutDashboard, Store, UsersRound, Users, Boxes, Box, ShoppingCart, FileClock, PackagePlus,
    SquarePlus,
    ChartColumnBig,
    PanelsTopLeft,
    ShoppingBasket,
    ChartPie
} from 'lucide-vue-next';
import ThemeSwitcher from '@/components/ThemeSwitcher.vue';

defineProps({
    isOpen: {
        type: Boolean,
        default: true,
    },
});

defineEmits(['toggle-sidebar']);

const activeDropdown = ref(null);

const toggleDropdown = (name) => {
    activeDropdown.value = activeDropdown.value === name ? null : name;
};

// const isProductDropdownOpen = ref(false);
// const isOrderDropdownOpen = ref(false);
// const isLandingPageDropdownOpen = ref(false);
// const isSaleDropdownOpen = ref(false);
// const isAnalyticsDropdownOpen = ref(false);

// const toggleProductDropdown = () => {
//     isProductDropdownOpen.value = !isProductDropdownOpen.value;
// };

// const toggleOrderDropdown = () => {
//     isOrderDropdownOpen.value = !isOrderDropdownOpen.value;
// };

// const toggleLandingPageDropdown = () => {
//     isLandingPageDropdownOpen.value = !isLandingPageDropdownOpen.value;
// };

// const toggleAnalyticsDropdown = () => {
//     isAnalyticsDropdownOpen.value = !isAnalyticsDropdownOpen.value;
// };

// const toggleSaleDropdown = () => {
//     isSaleDropdownOpen.value = !isSaleDropdownOpen.value;
// }
</script>