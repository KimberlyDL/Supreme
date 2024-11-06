import axios from 'axios';
const apiUrl = import.meta.env.VITE_API_BASE_URL;

const apiClient = axios.create({
    baseURL: apiUrl,
    withCredentials: true,
});

apiClient.interceptors.request.use(
    (config) => {
        const accessToken = useAuthStore().accessToken;

        const publicRoutes = ['/public-route-1', '/public-route-2'];
        const isPublicRoute = publicRoutes.some(route => config.url.includes(route));

        if (!isPublicRoute && accessToken) {
            config.headers['Authorization'] = `Bearer ${accessToken}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);


apiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        if (error.response.status === 401 && !originalRequest._retry) {

            //avoid infinite loop for originalRequest
            originalRequest._retry = true;

            const refreshToken = getRefreshTokenFromCookies();

            try {
                const response = await apiClient.post('/session/refresh', { refreshToken });
                const newAccessToken = response.data.accessToken;

                originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

                return apiClient(originalRequest);
            } catch (err) {
                console.error('Refresh token expired or invalid, logging out.');
                logoutUser();
                return Promise.reject(err);
            }
        }

        return Promise.reject(error);
    }
);

function getRefreshTokenFromCookies() {
    return document.cookie
        .split(';')
        .find((cookie) => cookie.trim().startsWith('refreshToken='))
        .split('=')[1];
};

// Utility function to log out the user
function logoutUser() {
    const authStore = useAuthStore();
    authStore.clearToken();
    document.cookie = 'refreshToken=; Max-Age=0';

    window.location.href = '/login';
}

function startTokenTimer(accessToken) {
    const tokenPayload = JSON.parse(atob(accessToken.split('.')[1]));  // Decode JWT payload
    const expirationTime = tokenPayload.exp * 1000;  // Convert expiration to milliseconds
    const now = Date.now();

    const refreshInMs = expirationTime - now - 60000;  // Refresh 1 minute before expiry

    setTimeout(() => {
        refreshAccessToken();  // Call the refresh function before token expiration
    }, refreshInMs);
}

// Function to refresh the access token
async function refreshAccessToken() {
    const refreshToken = getRefreshTokenFromCookies();  // Get refresh token from cookies
    try {
        const response = await apiClient.post('/session/refresh', { refreshToken });  // Refresh the token

        const newAccessToken = response.data.accessToken;
        const authStore = useAuthStore();
        authStore.setAccessToken(newAccessToken);  // Store the new access token in memory

        startTokenTimer(newAccessToken);  // Start the timer for the new token
    } catch (error) {
        logoutUser();  // If refresh fails, log the user out
    }
}

export { apiClient, startTokenTimer };