// frontend/src/stores/reportStore.js
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { db, auth } from "@/services/firebase";
import {
    collection,
    query,
    where,
    orderBy,
    limit,
    onSnapshot,
    Timestamp,
    getDocs,
    startAfter,
    getCountFromServer
} from "firebase/firestore";
import axios from "axios";
import { getIdToken } from "firebase/auth";

const apiUrl = import.meta.env.VITE_API_BASE_URL;

export const useReportStore = defineStore("report", {
    state: () => ({
        // Dashboard metrics
        salesSummary: {
            daily: 0,
            weekly: 0,
            monthly: 0,
            yearly: 0,
        },
        orderCounts: {
            pending: 0,
            completed: 0,
            voided: 0,
            returned: 0,
            total: 0
        },
        recentOrders: [],
        topProducts: [],

        // Listeners
        unsubscribeSales: null,
        unsubscribeRecentOrders: null,

        // UI state
        loading: {
            salesSummary: false,
            orderCounts: false,
            recentOrders: false,
            topProducts: false,
            logs: false
        },
        error: null,
    }),

    getters: {
        // Computed sales metrics
        dailySales: (state) => state.salesSummary.daily,
        weeklySales: (state) => state.salesSummary.weekly,
        monthlySales: (state) => state.salesSummary.monthly,
        yearlySales: (state) => state.salesSummary.yearly,

        // Order metrics
        pendingOrderCount: (state) => state.orderCounts.pending,
        completedOrderCount: (state) => state.orderCounts.completed,
        voidedOrderCount: (state) => state.orderCounts.voided,
        returnedOrderCount: (state) => state.orderCounts.returned,
        totalOrderCount: (state) => state.orderCounts.total,

        // Recent orders with computed properties
        formattedRecentOrders: (state) => {
            return state.recentOrders.map(order => ({
                ...order,
                formattedDate: order.createdAt ? new Date(order.createdAt.toDate()).toLocaleString() : 'Unknown',
                statusClass: getStatusClass(order.status)
            }));
        },

        // Top products with computed properties
        formattedTopProducts: (state) => {
            return state.topProducts.map(product => ({
                ...product,
                revenue: product.revenue.toFixed(2),
                percentageOfTotal: product.percentageOfTotal.toFixed(2)
            }));
        }
    },

    actions: {
        // Initialize all dashboard data
        async initializeDashboard() {
            this.setupRealtimeSalesSummary();
            this.setupRealtimeRecentOrders();
            await this.fetchOrderCounts();
            await this.fetchTopProducts();
        },

        // Clean up all listeners
        cleanupListeners() {
            if (this.unsubscribeSales) {
                this.unsubscribeSales();
                this.unsubscribeSales = null;
            }

            if (this.unsubscribeRecentOrders) {
                this.unsubscribeRecentOrders();
                this.unsubscribeRecentOrders = null;
            }
        },

        // Set up real-time listener for sales summary
        setupRealtimeSalesSummary() {
            this.loading.salesSummary = true;

            // Calculate date ranges
            const now = new Date();
            const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const weekStart = new Date(now);
            weekStart.setDate(now.getDate() - now.getDay());
            const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
            const yearStart = new Date(now.getFullYear(), 0, 1);

            // Create Firestore timestamps
            const todayTimestamp = Timestamp.fromDate(todayStart);
            const weekTimestamp = Timestamp.fromDate(weekStart);
            const monthTimestamp = Timestamp.fromDate(monthStart);
            const yearTimestamp = Timestamp.fromDate(yearStart);

            // Query for completed orders only
            const ordersRef = collection(db, "orders");
            const completedOrdersQuery = query(
                ordersRef,
                where("status", "==", "Completed"),
                where("completedAt", ">=", yearTimestamp),
                orderBy("completedAt", "desc")
            );

            this.unsubscribeSales = onSnapshot(completedOrdersQuery, (snapshot) => {
                // Reset summary
                const summary = {
                    daily: 0,
                    weekly: 0,
                    monthly: 0,
                    yearly: 0
                };

                // Calculate totals
                snapshot.docs.forEach(doc => {
                    const order = doc.data();
                    const completedAt = order.completedAt?.toDate();

                    if (completedAt) {
                        const totalPrice = order.totalPrice || 0;

                        // Add to yearly total
                        summary.yearly += totalPrice;

                        // Check if within month
                        if (completedAt >= monthStart) {
                            summary.monthly += totalPrice;

                            // Check if within week
                            if (completedAt >= weekStart) {
                                summary.weekly += totalPrice;

                                // Check if today
                                if (completedAt >= todayStart) {
                                    summary.daily += totalPrice;
                                }
                            }
                        }
                    }
                });

                // Update state
                this.salesSummary = summary;
                this.loading.salesSummary = false;
            }, (error) => {
                console.error("Error fetching sales summary:", error);
                this.error = error.message;
                this.loading.salesSummary = false;
            });
        },

        // Set up real-time listener for recent orders
        setupRealtimeRecentOrders(limit = 10) {
            this.loading.recentOrders = true;

            const ordersRef = collection(db, "orders");
            const recentOrdersQuery = query(
                ordersRef,
                orderBy("createdAt", "desc"),
                limit(limit)
            );

            this.unsubscribeRecentOrders = onSnapshot(recentOrdersQuery, (snapshot) => {
                const orders = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                this.recentOrders = orders;
                this.loading.recentOrders = false;
            }, (error) => {
                console.error("Error fetching recent orders:", error);
                this.error = error.message;
                this.loading.recentOrders = false;
            });
        },

        // Fetch order counts (on-demand)
        async fetchOrderCounts() {
            this.loading.orderCounts = true;

            try {
                const ordersRef = collection(db, "orders");

                // Get total count
                const totalQuery = query(ordersRef);
                const totalSnapshot = await getCountFromServer(totalQuery);
                const total = totalSnapshot.data().count;

                // Get pending count
                const pendingQuery = query(ordersRef, where("status", "==", "Pending"));
                const pendingSnapshot = await getCountFromServer(pendingQuery);
                const pending = pendingSnapshot.data().count;

                // Get completed count
                const completedQuery = query(ordersRef, where("status", "==", "Completed"));
                const completedSnapshot = await getCountFromServer(completedQuery);
                const completed = completedSnapshot.data().count;

                // Get voided count
                const voidedQuery = query(ordersRef, where("status", "==", "Voided"));
                const voidedSnapshot = await getCountFromServer(voidedQuery);
                const voided = voidedSnapshot.data().count;

                // Get returned count
                const returnedQuery = query(ordersRef, where("status", "==", "Returned"));
                const returnedSnapshot = await getCountFromServer(returnedQuery);
                const returned = returnedSnapshot.data().count;

                this.orderCounts = {
                    total,
                    pending,
                    completed,
                    voided,
                    returned
                };
            } catch (error) {
                console.error("Error fetching order counts:", error);
                this.error = error.message;
            } finally {
                this.loading.orderCounts = false;
            }
        },

        // Fetch top products (on-demand)
        async fetchTopProducts(limit = 5, timeRange = 'month') {
            this.loading.topProducts = true;

            try {
                // Get token for API request
                const token = await getIdToken(auth.currentUser);

                // Call backend API for top products
                const response = await axios.get(`${apiUrl}reports/top-products`, {
                    params: { limit, timeRange },
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                if (response.data.success) {
                    this.topProducts = response.data.products;
                } else {
                    throw new Error(response.data.message || "Failed to fetch top products");
                }
            } catch (error) {
                console.error("Error fetching top products:", error);
                this.error = error.message;

                // Fallback: Calculate from client-side if API fails
                await this.calculateTopProductsFallback(limit, timeRange);
            } finally {
                this.loading.topProducts = false;
            }
        },

        // Fallback method to calculate top products from client-side
        async calculateTopProductsFallback(limit = 5, timeRange = 'month') {
            try {
                // Calculate date range
                const now = new Date();
                let startDate;

                switch (timeRange) {
                    case 'week':
                        startDate = new Date(now);
                        startDate.setDate(now.getDate() - 7);
                        break;
                    case 'month':
                        startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
                        break;
                    case 'year':
                        startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
                        break;
                    default:
                        startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
                }

                const startTimestamp = Timestamp.fromDate(startDate);

                // Query completed orders in the date range
                const ordersRef = collection(db, "orders");
                const ordersQuery = query(
                    ordersRef,
                    where("status", "==", "Completed"),
                    where("completedAt", ">=", startTimestamp),
                    orderBy("completedAt", "desc")
                );

                const snapshot = await getDocs(ordersQuery);

                // Process orders to extract product data
                const productMap = new Map();
                let totalRevenue = 0;

                snapshot.docs.forEach(doc => {
                    const order = doc.data();
                    const items = order.items || [];

                    items.forEach(item => {
                        const productId = item.productId;
                        const varietyId = item.varietyId;
                        const key = `${productId}-${varietyId}`;
                        const quantity = item.quantity || 0;
                        const revenue = item.totalPrice || 0;

                        totalRevenue += revenue;

                        if (productMap.has(key)) {
                            const product = productMap.get(key);
                            product.quantity += quantity;
                            product.revenue += revenue;
                            product.orderCount += 1;
                        } else {
                            productMap.set(key, {
                                productId,
                                varietyId,
                                productName: item.product || "Unknown Product",
                                varietyName: item.varietyName || "Default",
                                quantity,
                                revenue,
                                orderCount: 1
                            });
                        }
                    });
                });

                // Convert map to array and sort by revenue
                const products = Array.from(productMap.values())
                    .map(product => ({
                        ...product,
                        percentageOfTotal: (product.revenue / totalRevenue) * 100
                    }))
                    .sort((a, b) => b.revenue - a.revenue)
                    .slice(0, limit);

                this.topProducts = products;
            } catch (error) {
                console.error("Error in fallback top products calculation:", error);
                this.topProducts = [];
            }
        },

        // Fetch order logs (on-demand)
        async fetchOrderLogs(options = {}) {
            this.loading.logs = true;

            try {
                const {
                    page = 1,
                    limit = 20,
                    status = null,
                    startDate = null,
                    endDate = null,
                    search = null
                } = options;

                // Get token for API request
                const token = await getIdToken(auth.currentUser);

                // Build query parameters
                let params = { page, limit };
                if (status) params.status = status;
                if (startDate) params.startDate = startDate;
                if (endDate) params.endDate = endDate;
                if (search) params.search = search;

                // Call backend API for logs
                const response = await axios.get(`${apiUrl}logs/orders`, {
                    params,
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                return response.data;
            } catch (error) {
                console.error("Error fetching order logs:", error);
                this.error = error.message;
                throw error;
            } finally {
                this.loading.logs = false;
            }
        },

        // Fetch sale logs (on-demand)
        async fetchSaleLogs(options = {}) {
            this.loading.logs = true;

            try {
                const {
                    page = 1,
                    limit = 20,
                    startDate = null,
                    endDate = null,
                    productId = null,
                    branchId = null
                } = options;

                // Get token for API request
                const token = await getIdToken(auth.currentUser);

                // Build query parameters
                let params = { page, limit };
                if (startDate) params.startDate = startDate;
                if (endDate) params.endDate = endDate;
                if (productId) params.productId = productId;
                if (branchId) params.branchId = branchId;

                // Call backend API for logs
                const response = await axios.get(`${apiUrl}logs/sales`, {
                    params,
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                return response.data;
            } catch (error) {
                console.error("Error fetching sale logs:", error);
                this.error = error.message;
                throw error;
            } finally {
                this.loading.logs = false;
            }
        },

        // Generate sales report
        async generateSalesReport(options = {}) {
            try {
                const {
                    startDate = null,
                    endDate = null,
                    branchId = null,
                    groupBy = 'day' // day, week, month
                } = options;

                // Get token for API request
                const token = await getIdToken(auth.currentUser);

                // Build query parameters
                let params = { groupBy };
                if (startDate) params.startDate = startDate;
                if (endDate) params.endDate = endDate;
                if (branchId) params.branchId = branchId;

                // Call backend API for report
                const response = await axios.get(`${apiUrl}reports/sales`, {
                    params,
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                return response.data;
            } catch (error) {
                console.error("Error generating sales report:", error);
                this.error = error.message;
                throw error;
            }
        }
    }
});

// Helper function for status styling
function getStatusClass(status) {
    switch (status) {
        case 'Completed':
            return 'text-green-600 bg-green-100';
        case 'Pending':
            return 'text-yellow-600 bg-yellow-100';
        case 'Voided':
            return 'text-red-600 bg-red-100';
        case 'Returned':
            return 'text-purple-600 bg-purple-100';
        default:
            return 'text-gray-600 bg-gray-100';
    }
}