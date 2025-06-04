<!-- frontend\src\views\admin\dashboard\ReportDashboard.vue -->
<template>
  <div class="p-4 bg-bgPrimary-0">
    <h1 class="text-2xl font-bold mb-6 text-tBase-100">Sales Dashboard</h1>
    
    <!-- Date Range Selector -->
    <div class="mb-6 bg-white p-4 rounded-lg shadow">
      <div class="flex flex-wrap gap-4 items-center">
        <div class="flex-1 min-w-[200px]">
          <label class="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
          <select 
            v-model="dateRange" 
            class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="last7days">Last 7 Days</option>
            <option value="last30days">Last 30 Days</option>
            <option value="thisMonth">This Month</option>
            <option value="lastMonth">Last Month</option>
            <option value="custom">Custom Range</option>
          </select>
        </div>
        
        <div v-if="dateRange === 'custom'" class="flex flex-wrap gap-4">
          <div class="flex-1 min-w-[200px]">
            <label class="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input 
              type="date" 
              v-model="startDate" 
              class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div class="flex-1 min-w-[200px]">
            <label class="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input 
              type="date" 
              v-model="endDate" 
              class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
        
        <div class="flex items-end">
          <button 
            @click="refreshData" 
            class="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <RefreshCw v-if="isLoading" class="animate-spin h-5 w-5" />
            <span v-else>Refresh</span>
          </button>
        </div>
      </div>
    </div>
    
    <!-- Sales Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <DashboardCard 
        title="Today's Sales" 
        :value="formatCurrency(reportStore.dailySales)" 
        icon="TrendingUp" 
        color="bg-blue-500"
        :loading="reportStore.loading.salesSummary"
      />
      <DashboardCard 
        title="Weekly Sales" 
        :value="formatCurrency(reportStore.weeklySales)" 
        icon="Calendar" 
        color="bg-green-500"
        :loading="reportStore.loading.salesSummary"
      />
      <DashboardCard 
        title="Monthly Sales" 
        :value="formatCurrency(reportStore.monthlySales)" 
        icon="BarChart2" 
        color="bg-purple-500"
        :loading="reportStore.loading.salesSummary"
      />
      <DashboardCard 
        title="Yearly Sales" 
        :value="formatCurrency(reportStore.yearlySales)" 
        icon="DollarSign" 
        color="bg-orange-500"
        :loading="reportStore.loading.salesSummary"
      />
    </div>
    
    <!-- Order Status Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <DashboardCard 
        title="Pending Orders" 
        :value="reportStore.pendingOrderCount.toString()" 
        icon="Clock" 
        color="bg-yellow-500"
        :loading="reportStore.loading.orderCounts"
      />
      <DashboardCard 
        title="Completed Orders" 
        :value="reportStore.completedOrderCount.toString()" 
        icon="CheckCircle" 
        color="bg-green-500"
        :loading="reportStore.loading.orderCounts"
      />
      <DashboardCard 
        title="Voided Orders" 
        :value="reportStore.voidedOrderCount.toString()" 
        icon="XCircle" 
        color="bg-red-500"
        :loading="reportStore.loading.orderCounts"
      />
      <DashboardCard 
        title="Returned Orders" 
        :value="reportStore.returnedOrderCount.toString()" 
        icon="CornerUpLeft" 
        color="bg-purple-500"
        :loading="reportStore.loading.orderCounts"
      />
    </div>
    
    <!-- Charts and Tables Section -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <!-- Recent Orders Table -->
      <div class="bg-white rounded-lg shadow p-4">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-semibold text-gray-800">Recent Orders</h2>
          <router-link 
            to="/administrator/orders" 
            class="text-primary-500 hover:text-primary-700 text-sm flex items-center"
          >
            View All <ChevronRight class="h-4 w-4 ml-1" />
          </router-link>
        </div>
        
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order #</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <template v-if="reportStore.loading.recentOrders">
                <tr v-for="i in 5" :key="i">
                  <td class="px-4 py-3 whitespace-nowrap">
                    <div class="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
                  </td>
                  <td class="px-4 py-3 whitespace-nowrap">
                    <div class="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
                  </td>
                  <td class="px-4 py-3 whitespace-nowrap">
                    <div class="h-4 bg-gray-200 rounded animate-pulse w-32"></div>
                  </td>
                  <td class="px-4 py-3 whitespace-nowrap">
                    <div class="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
                  </td>
                  <td class="px-4 py-3 whitespace-nowrap">
                    <div class="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
                  </td>
                </tr>
              </template>
              <template v-else-if="reportStore.formattedRecentOrders.length === 0">
                <tr>
                  <td colspan="5" class="px-4 py-3 text-center text-gray-500">No orders found</td>
                </tr>
              </template>
              <template v-else>
                <tr v-for="order in reportStore.formattedRecentOrders" :key="order.id">
                  <td class="px-4 py-3 whitespace-nowrap">
                    <router-link :to="`/administrator/orders/${order.id}`" class="text-primary-500 hover:text-primary-700">
                      {{ order.orderNumber }}
                    </router-link>
                  </td>
                  <td class="px-4 py-3 whitespace-nowrap">{{ order.client }}</td>
                  <td class="px-4 py-3 whitespace-nowrap">{{ order.formattedDate }}</td>
                  <td class="px-4 py-3 whitespace-nowrap">${{ order.totalPrice?.toFixed(2) }}</td>
                  <td class="px-4 py-3 whitespace-nowrap">
                    <span :class="`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${order.statusClass}`">
                      {{ order.status }}
                    </span>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
      </div>
      
      <!-- Top Products Table -->
      <div class="bg-white rounded-lg shadow p-4">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-semibold text-gray-800">Top Products</h2>
          <div class="flex items-center">
            <select 
              v-model="topProductsTimeRange" 
              class="mr-2 border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              @change="fetchTopProducts"
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
          </div>
        </div>
        
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">% of Total</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <template v-if="reportStore.loading.topProducts">
                <tr v-for="i in 5" :key="i">
                  <td class="px-4 py-3 whitespace-nowrap">
                    <div class="h-4 bg-gray-200 rounded animate-pulse w-32"></div>
                  </td>
                  <td class="px-4 py-3 whitespace-nowrap">
                    <div class="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
                  </td>
                  <td class="px-4 py-3 whitespace-nowrap">
                    <div class="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
                  </td>
                  <td class="px-4 py-3 whitespace-nowrap">
                    <div class="h-4 bg-gray-200 rounded animate-pulse w-12"></div>
                  </td>
                </tr>
              </template>
              <template v-else-if="reportStore.formattedTopProducts.length === 0">
                <tr>
                  <td colspan="4" class="px-4 py-3 text-center text-gray-500">No products found</td>
                </tr>
              </template>
              <template v-else>
                <tr v-for="product in reportStore.formattedTopProducts" :key="`${product.productId}-${product.varietyId}`">
                  <td class="px-4 py-3">
                    <div class="flex items-center">
                      <div>
                        <div class="text-sm font-medium text-gray-900">{{ product.productName }}</div>
                        <div class="text-sm text-gray-500">{{ product.varietyName }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{{ product.quantity }}</td>
                  <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-500">${{ product.revenue }}</td>
                  <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{{ product.percentageOfTotal }}%</td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    
    <!-- Order Logs Section -->
    <div class="bg-white rounded-lg shadow p-4 mb-6">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-lg font-semibold text-gray-800">Recent Order Activity</h2>
        <router-link 
          to="/administrator/logs/orders" 
          class="text-primary-500 hover:text-primary-700 text-sm flex items-center"
        >
          View All <ChevronRight class="h-4 w-4 ml-1" />
        </router-link>
      </div>
      
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <template v-if="logStore.loading.orderLogs">
              <tr v-for="i in 5" :key="i">
                <td class="px-4 py-3 whitespace-nowrap">
                  <div class="h-4 bg-gray-200 rounded animate-pulse w-32"></div>
                </td>
                <td class="px-4 py-3 whitespace-nowrap">
                  <div class="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
                </td>
                <td class="px-4 py-3 whitespace-nowrap">
                  <div class="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
                </td>
                <td class="px-4 py-3 whitespace-nowrap">
                  <div class="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
                </td>
                <td class="px-4 py-3 whitespace-nowrap">
                  <div class="h-4 bg-gray-200 rounded animate-pulse w-32"></div>
                </td>
              </tr>
            </template>
            <template v-else-if="logStore.formattedOrderLogs.length === 0">
              <tr>
                <td colspan="5" class="px-4 py-3 text-center text-gray-500">No order logs found</td>
              </tr>
            </template>
            <template v-else>
              <tr v-for="log in logStore.formattedOrderLogs.slice(0, 5)" :key="log.id">
                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{{ log.formattedTimestamp }}</td>
                <td class="px-4 py-3 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">{{ log.user?.firstName }} {{ log.user?.lastName }}</div>
                  <div class="text-xs text-gray-500">{{ log.user?.role }}</div>
                </td>
                <td class="px-4 py-3 whitespace-nowrap">
                  <span :class="`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getActionClass(log.action)}`">
                    {{ formatAction(log.action) }}
                  </span>
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                  <router-link 
                    v-if="log.orderId" 
                    :to="`/administrator/orders/${log.orderId}`" 
                    class="text-primary-500 hover:text-primary-700"
                  >
                    {{ log.orderNumber || log.orderId }}
                  </router-link>
                  <span v-else>-</span>
                </td>
                <td class="px-4 py-3 text-sm text-gray-500 truncate max-w-xs">{{ log.details }}</td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
import { useReportStore } from '@/stores/reportStore';
import { useLogStore } from '@/stores/logStore';
import DashboardCard from '@/components/admin/dashboardCard.vue';
import { 
  RefreshCw, 
  ChevronRight, 
  TrendingUp, 
  Calendar, 
  BarChart2, 
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  CornerUpLeft
} from 'lucide-vue-next';

// Stores
const reportStore = useReportStore();
const logStore = useLogStore();

// State
const dateRange = ref('last30days');
const startDate = ref('');
const endDate = ref('');
const topProductsTimeRange = ref('month');
const isLoading = ref(false);

// Initialize date range
const initializeDateRange = () => {
  const today = new Date();
  
  // Set default end date to today
  endDate.value = formatDateForInput(today);
  
  // Set default start date to 30 days ago
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(today.getDate() - 30);
  startDate.value = formatDateForInput(thirtyDaysAgo);
};

// Format date for input field (YYYY-MM-DD)
const formatDateForInput = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Format currency
const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(value || 0);
};

// Get date range for API
const getDateRangeForApi = () => {
  const today = new Date();
  let start, end;
  let startDateValue = startDate.value;
  let endDateValue = endDate.value;

  switch (dateRange.value) {
    case 'today':
      start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      end = today;
      break;
    case 'yesterday':
      start = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
      end = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1, 23, 59, 59);
      break;
    case 'last7days':
      start = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);
      end = today;
      break;
    case 'last30days':
      start = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 30);
      end = today;
      break;
    case 'thisMonth':
      start = new Date(today.getFullYear(), today.getMonth(), 1);
      end = today;
      break;
    case 'lastMonth':
      start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      end = new Date(today.getFullYear(), today.getMonth(), 0, 23, 59, 59);
      break;
    case 'custom':
      start = startDateValue ? new Date(startDateValue) : null;
      end = endDateValue ? new Date(endDateValue) : null;
      break;
    default:
      start = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 30);
      end = today;
  }
  
  return { startDate: start, endDate: end };
};

// Fetch top products
const fetchTopProducts = async () => {
  await reportStore.fetchTopProducts(5, topProductsTimeRange.value);
};

// Refresh all data
const refreshData = async () => {
  isLoading.value = true;
  
  try {
    // Initialize dashboard with real-time data
    await reportStore.initializeDashboard();
    
    // Fetch order logs on-demand
    await logStore.fetchOrderLogs({ limit: 5, reset: true });
  } catch (error) {
    console.error('Error refreshing dashboard data:', error);
  } finally {
    isLoading.value = false;
  }
};

// Format action for display
const formatAction = (action) => {
  if (!action) return 'Unknown';
  
  // Convert snake_case to Title Case
  return action
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

// Get CSS class for action
const getActionClass = (action) => {
  if (!action) return 'bg-gray-100 text-gray-800';
  
  switch (action.toLowerCase()) {
    case 'create_order':
    case 'add_order':
      return 'bg-green-100 text-green-800';
    case 'update_order':
    case 'edit_order':
      return 'bg-blue-100 text-blue-800';
    case 'approve_order':
    case 'complete_order':
      return 'bg-purple-100 text-purple-800';
    case 'void_order':
      return 'bg-red-100 text-red-800';
    case 'return_order':
      return 'bg-orange-100 text-orange-800';
    case 'delete_order':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// Watch for date range changes
watch(dateRange, (newValue) => {
  if (newValue !== 'custom') {
    const { startDate: start, endDate: end } = getDateRangeForApi();
    startDate.value = formatDateForInput(start);
    endDate.value = formatDateForInput(end);
  }
});

// Initialize component
onMounted(async () => {
  reportStore.setupRealtimeRecentOrders(5);
  initializeDateRange();
  await refreshData();
});

onUnmounted(() => {
  reportStore.stopRealtimeRecentOrders(); // Optional cleanup
});
</script>

<style scoped>
/* Add any component-specific styles here */
</style>