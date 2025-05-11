// frontend\src\services\apiService.js
import axios from 'axios';
import { getToken } from './token.service';
import router from '@/router';
import { useAuthStore } from '@/stores/authStore'; // Import authStore here

const apiUrl = import.meta.env.VITE_API_BASE_URL;

// Create axios instance
const apiClient = axios.create({
    baseURL: apiUrl,
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Store for auth state - initialized in interceptors when needed
let authStore = useAuthStore(); // Initialize authStore here

// Add request interceptor to add auth token
apiClient.interceptors.request.use(
    async (config) => {
        // Skip auth for public endpoints
        if (config.public) {
            return config;
        }

        try {
            // Get token (will use cache if valid)
            const token = await getToken();

            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            } else {
                // No token available, might need to redirect to login
                // We'll handle this in the response interceptor
            }
        } catch (error) {
            console.error('Error setting auth header:', error);
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add response interceptor to handle auth errors
apiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // Handle 401 Unauthorized errors
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // Force token refresh
                const token = await getToken(true);

                if (token) {
                    // Retry the request with new token
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return apiClient(originalRequest);
                } else {
                    // No token available, redirect to login
                    // Initialize authStore if needed
                    if (authStore.isLoggedIn) {
                        authStore.isLoggedIn = false;
                        router.push({ name: 'Login' });
                    }
                }
            } catch (refreshError) {
                console.error('Error refreshing token:', refreshError);

                authStore.isLoggedIn = false;
                router.push({ name: 'Login' });
            }
        }

        return Promise.reject(error);
    }
);

// Helper for public endpoints
const publicRequest = (method) => {
    return (url, data = null, config = {}) => {
        return apiClient({
            method,
            url,
            data: method !== 'get' ? data : null,
            params: method === 'get' ? data : null,
            ...config,
            public: true
        });
    };
};

export const api = {
    // Authenticated requests
    get: (url, params = null, config = {}) => apiClient.get(url, { params, ...config }),
    post: (url, data, config = {}) => apiClient.post(url, data, config),
    put: (url, data, config = {}) => apiClient.put(url, data, config),
    delete: (url, config = {}) => apiClient.delete(url, config),

    // Public requests (no auth)
    public: {
        get: publicRequest('get'),
        post: publicRequest('post'),
        put: publicRequest('put'),
        delete: publicRequest('delete')
    }
};