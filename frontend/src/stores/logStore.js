// frontend/src/stores/logStore.js
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { db, auth } from "@/services/firebase";
import {
    collection,
    query,
    where,
    orderBy,
    limit,
    getDocs,
    startAfter,
    Timestamp
} from "firebase/firestore";
import axios from "axios";
import { getIdToken } from "firebase/auth";

const apiUrl = import.meta.env.VITE_API_BASE_URL;

export const useLogStore = defineStore("log", {
    state: () => ({
        activityLogs: [],
        securityLogs: [],
        inventoryLogs: [],
        orderLogs: [],
        saleLogs: [],

        pagination: {
            activityLogs: { hasMore: false, lastDoc: null },
            securityLogs: { hasMore: false, lastDoc: null },
            inventoryLogs: { hasMore: false, lastDoc: null },
            orderLogs: { hasMore: false, lastDoc: null },
            saleLogs: { hasMore: false, lastDoc: null }
        },

        loading: {
            activityLogs: false,
            securityLogs: false,
            inventoryLogs: false,
            orderLogs: false,
            saleLogs: false
        },

        error: null
    }),

    getters: {
        // Formatted activity logs
        formattedActivityLogs: (state) => {
            return state.activityLogs.map(log => ({
                ...log,
                formattedTimestamp: log.timestamp ? new Date(log.timestamp).toLocaleString() : 'Unknown'
            }));
        },

        // Formatted security logs
        formattedSecurityLogs: (state) => {
            return state.securityLogs.map(log => ({
                ...log,
                formattedTimestamp: log.timestamp ? new Date(log.timestamp).toLocaleString() : 'Unknown',
                severityClass: getSeverityClass(log.severity)
            }));
        },

        // Formatted inventory logs
        formattedInventoryLogs: (state) => {
            return state.inventoryLogs.map(log => ({
                ...log,
                formattedTimestamp: log.timestamp ? new Date(log.timestamp).toLocaleString() : 'Unknown',
                typeClass: getInventoryTypeClass(log.type)
            }));
        },

        // Formatted order logs
        formattedOrderLogs: (state) => {
            return state.orderLogs.map(log => ({
                ...log,
                formattedTimestamp: log.timestamp ? new Date(log.timestamp).toLocaleString() : 'Unknown',
                statusClass: getStatusClass(log.status)
            }));
        },

        // Formatted sale logs
        formattedSaleLogs: (state) => {
            return state.saleLogs.map(log => ({
                ...log,
                formattedTimestamp: log.timestamp ? new Date(log.timestamp).toLocaleString() : 'Unknown',
                formattedAmount: log.amount ? `$${log.amount.toFixed(2)}` : '$0.00'
            }));
        }
    },

    actions: {
        // Fetch activity logs (on-demand)
        async fetchActivityLogs(options = {}) {
            this.loading.activityLogs = true;
            this.error = null;

            try {
                const {
                    limit = 20,
                    reset = false,
                    userId = null,
                    activityType = null,
                    startDate = null,
                    endDate = null
                } = options;

                // Reset logs if requested
                if (reset) {
                    this.activityLogs = [];
                    this.pagination.activityLogs = { hasMore: false, lastDoc: null };
                }

                // Build query constraints
                let constraints = [orderBy("timestamp", "desc")];

                if (userId) {
                    constraints.push(where("user.uid", "==", userId));
                }

                if (activityType) {
                    constraints.push(where("activityType", "==", activityType));
                }

                if (startDate) {
                    const startTimestamp = Timestamp.fromDate(new Date(startDate));
                    constraints.push(where("timestamp", ">=", startTimestamp));
                }

                if (endDate) {
                    const endTimestamp = Timestamp.fromDate(new Date(endDate));
                    constraints.push(where("timestamp", "<=", endTimestamp));
                }

                // Add pagination
                constraints.push(limit(limit));

                if (!reset && this.pagination.activityLogs.lastDoc) {
                    constraints.push(startAfter(this.pagination.activityLogs.lastDoc));
                }

                // Create and execute query
                const q = query(collection(db, "activity_logs"), ...constraints);
                const snapshot = await getDocs(q);

                // Process results
                const logs = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    timestamp: doc.data().timestamp?.toDate() || null
                }));

                // Update state
                if (reset) {
                    this.activityLogs = logs;
                } else {
                    this.activityLogs = [...this.activityLogs, ...logs];
                }

                // Update pagination
                this.pagination.activityLogs = {
                    hasMore: logs.length === limit,
                    lastDoc: logs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null
                };

                return logs;
            } catch (error) {
                console.error("Error fetching activity logs:", error);
                this.error = error.message;
                throw error;
            } finally {
                this.loading.activityLogs = false;
            }
        },

        // Fetch security logs (on-demand)
        async fetchSecurityLogs(options = {}) {
            this.loading.securityLogs = true;
            this.error = null;

            try {
                const {
                    limit = 20,
                    reset = false,
                    userId = null,
                    eventType = null,
                    severity = null,
                    startDate = null,
                    endDate = null
                } = options;

                // Reset logs if requested
                if (reset) {
                    this.securityLogs = [];
                    this.pagination.securityLogs = { hasMore: false, lastDoc: null };
                }

                // Build query constraints
                let constraints = [orderBy("timestamp", "desc")];

                if (userId) {
                    constraints.push(where("user.uid", "==", userId));
                }

                if (eventType) {
                    constraints.push(where("eventType", "==", eventType));
                }

                if (severity) {
                    constraints.push(where("severity", "==", severity));
                }

                if (startDate) {
                    const startTimestamp = Timestamp.fromDate(new Date(startDate));
                    constraints.push(where("timestamp", ">=", startTimestamp));
                }

                if (endDate) {
                    const endTimestamp = Timestamp.fromDate(new Date(endDate));
                    constraints.push(where("timestamp", "<=", endTimestamp));
                }

                // Add pagination
                constraints.push(limit(limit));

                if (!reset && this.pagination.securityLogs.lastDoc) {
                    constraints.push(startAfter(this.pagination.securityLogs.lastDoc));
                }

                // Create and execute query
                const q = query(collection(db, "security_logs"), ...constraints);
                const snapshot = await getDocs(q);

                // Process results
                const logs = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    timestamp: doc.data().timestamp?.toDate() || null
                }));

                // Update state
                if (reset) {
                    this.securityLogs = logs;
                } else {
                    this.securityLogs = [...this.securityLogs, ...logs];
                }

                // Update pagination
                this.pagination.securityLogs = {
                    hasMore: logs.length === limit,
                    lastDoc: logs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null
                };

                return logs;
            } catch (error) {
                console.error("Error fetching security logs:", error);
                this.error = error.message;
                throw error;
            } finally {
                this.loading.securityLogs = false;
            }
        },

        // Fetch inventory logs (on-demand)
        async fetchInventoryLogs(options = {}) {
            this.loading.inventoryLogs = true;
            this.error = null;

            try {
                const {
                    limit = 20,
                    reset = false,
                    branchId = null,
                    type = null,
                    startDate = null,
                    endDate = null
                } = options;

                // Reset logs if requested
                if (reset) {
                    this.inventoryLogs = [];
                    this.pagination.inventoryLogs = { hasMore: false, lastDoc: null };
                }

                // Build query constraints
                let constraints = [orderBy("timestamp", "desc")];

                if (branchId) {
                    constraints.push(where("branchId", "==", branchId));
                }

                if (type) {
                    constraints.push(where("type", "==", type));
                }

                if (startDate) {
                    const startTimestamp = Timestamp.fromDate(new Date(startDate));
                    constraints.push(where("timestamp", ">=", startTimestamp));
                }

                if (endDate) {
                    const endTimestamp = Timestamp.fromDate(new Date(endDate));
                    constraints.push(where("timestamp", "<=", endTimestamp));
                }

                // Add pagination
                constraints.push(limit(limit));

                if (!reset && this.pagination.inventoryLogs.lastDoc) {
                    constraints.push(startAfter(this.pagination.inventoryLogs.lastDoc));
                }

                // Create and execute query
                const q = query(collection(db, "inventory_logs"), ...constraints);
                const snapshot = await getDocs(q);

                // Process results
                const logs = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    timestamp: doc.data().timestamp?.toDate() || null
                }));

                // Update state
                if (reset) {
                    this.inventoryLogs = logs;
                } else {
                    this.inventoryLogs = [...this.inventoryLogs, ...logs];
                }

                // Update pagination
                this.pagination.inventoryLogs = {
                    hasMore: logs.length === limit,
                    lastDoc: logs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null
                };

                return logs;
            } catch (error) {
                console.error("Error fetching inventory logs:", error);
                this.error = error.message;
                throw error;
            } finally {
                this.loading.inventoryLogs = false;
            }
        },

        // Fetch order logs (on-demand)
        async fetchOrderLogs(options = {}) {
            this.loading.orderLogs = true;
            this.error = null;

            try {
                const {
                    page = 1,
                    limit = 20,
                    reset = false,
                    status = null,
                    startDate = null,
                    endDate = null,
                    search = null
                } = options;

                // Reset logs if requested
                if (reset) {
                    this.orderLogs = [];
                    this.pagination.orderLogs = { hasMore: false, lastDoc: null };
                }

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

                // Process results
                const logs = response.data.logs || [];

                // Update state
                if (reset || page === 1) {
                    this.orderLogs = logs;
                } else {
                    this.orderLogs = [...this.orderLogs, ...logs];
                }

                // Update pagination
                this.pagination.orderLogs = {
                    hasMore: logs.length === limit,
                    page: page
                };

                return {
                    logs,
                    hasMore: logs.length === limit,
                    page
                };
            } catch (error) {
                console.error("Error fetching order logs:", error);
                this.error = error.message;
                throw error;
            } finally {
                this.loading.orderLogs = false;
            }
        },

        // Fetch sale logs (on-demand)
        async fetchSaleLogs(options = {}) {
            this.loading.saleLogs = true;
            this.error = null;

            try {
                const {
                    page = 1,
                    limit = 20,
                    reset = false,
                    startDate = null,
                    endDate = null,
                    productId = null,
                    branchId = null
                } = options;

                // Reset logs if requested
                if (reset) {
                    this.saleLogs = [];
                    this.pagination.saleLogs = { hasMore: false, lastDoc: null };
                }

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

                // Process results
                const logs = response.data.logs || [];

                // Update state
                if (reset || page === 1) {
                    this.saleLogs = logs;
                } else {
                    this.saleLogs = [...this.saleLogs, ...logs];
                }

                // Update pagination
                this.pagination.saleLogs = {
                    hasMore: logs.length === limit,
                    page: page
                };

                return {
                    logs,
                    hasMore: logs.length === limit,
                    page
                };
            } catch (error) {
                console.error("Error fetching sale logs:", error);
                this.error = error.message;
                throw error;
            } finally {
                this.loading.saleLogs = false;
            }
        }
    }
});

// Helper functions for styling
function getSeverityClass(severity) {
    switch (severity) {
        case 'high':
            return 'text-red-600 bg-red-100';
        case 'medium':
            return 'text-yellow-600 bg-yellow-100';
        case 'low':
            return 'text-blue-600 bg-blue-100';
        default:
            return 'text-gray-600 bg-gray-100';
    }
}

function getInventoryTypeClass(type) {
    switch (type) {
        case 'add_stock':
            return 'text-green-600 bg-green-100';
        case 'deduct_stock':
            return 'text-red-600 bg-red-100';
        case 'transfer_stock':
            return 'text-blue-600 bg-blue-100';
        case 'adjust_stock':
            return 'text-purple-600 bg-purple-100';
        case 'reject_stock':
            return 'text-orange-600 bg-orange-100';
        default:
            return 'text-gray-600 bg-gray-100';
    }
}

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