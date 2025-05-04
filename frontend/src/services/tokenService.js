// frontend\src\services\tokenService.js
// src/services/token.service.js
import { auth } from './firebase';

// Token cache to minimize unnecessary token refreshes
let tokenCache = {
    token: null,
    expiry: 0
};

/**
 * Gets a fresh Firebase ID token
 * Uses cache if token is still valid (unless forceRefresh is true)
 * @param {boolean} forceRefresh - Force a token refresh
 * @returns {Promise<string|null>} The ID token or null if no user is logged in
 */
export const getToken = async (forceRefresh = false) => {
    const now = Date.now();
    const bufferTime = 5 * 60 * 1000; // 5 minutes buffer before expiration

    // If we have a cached token that's not expired and we're not forcing a refresh
    if (!forceRefresh && tokenCache.token && tokenCache.expiry > (now + bufferTime)) {
        return tokenCache.token;
    }

    // Get current user
    const currentUser = auth.currentUser;
    if (!currentUser) {
        return null;
    }

    try {
        // Get a fresh token
        const token = await currentUser.getIdToken(forceRefresh);

        // Get token expiration time from the JWT payload
        const decodedToken = JSON.parse(atob(token.split('.')[1]));
        const expiryTime = decodedToken.exp * 1000; // Convert to milliseconds

        // Cache the token with its expiry time
        tokenCache = {
            token,
            expiry: expiryTime
        };

        // Store expiration in sessionStorage for persistence across page refreshes
        sessionStorage.setItem('tokenExpiration', expiryTime);

        return token;
    } catch (error) {
        console.error('Error getting token:', error);
        return null;
    }
};

/**
 * Schedules a token refresh before expiration
 * This ensures tokens are always fresh for API calls
 */
export const scheduleTokenRefresh = () => {
    // Clear any existing refresh timers
    if (window.tokenRefreshTimer) {
        clearTimeout(window.tokenRefreshTimer);
    }

    // Get token expiration from session storage
    const expiryTime = sessionStorage.getItem('tokenExpiration');
    if (!expiryTime) return;

    const now = Date.now();
    const expiry = parseInt(expiryTime, 10);

    // Calculate time until refresh (10 minutes before expiration or half the remaining time)
    const refreshBuffer = Math.min(10 * 60 * 1000, (expiry - now) / 2);
    const timeUntilRefresh = Math.max(0, expiry - now - refreshBuffer);

    // Schedule token refresh
    window.tokenRefreshTimer = setTimeout(async () => {
        try {
            // Only refresh if user is still logged in
            if (auth.currentUser) {
                await getToken(true); // Force refresh
                console.log('Token refreshed successfully');

                // Schedule next refresh
                scheduleTokenRefresh();
            }
        } catch (error) {
            console.error('Error refreshing token:', error);
        }
    }, timeUntilRefresh);

    console.log(`Token refresh scheduled in ${Math.round(timeUntilRefresh / 60000)} minutes`);
};

/**
 * Clears token cache and cancels refresh timer
 * Should be called on logout
 */
export const clearTokenCache = () => {
    tokenCache = {
        token: null,
        expiry: 0
    };

    sessionStorage.removeItem('tokenExpiration');

    if (window.tokenRefreshTimer) {
        clearTimeout(window.tokenRefreshTimer);
        window.tokenRefreshTimer = null;
    }
};

/**
 * Initializes token refresh mechanism
 * Should be called after successful authentication
 */
export const initTokenRefresh = async () => {
    // Get a fresh token first
    await getToken(true);

    // Schedule refresh
    scheduleTokenRefresh();

    // Set up listener for visibility changes
    document.addEventListener('visibilitychange', async () => {
        // When page becomes visible again, check if token needs refresh
        if (document.visibilityState === 'visible' && auth.currentUser) {
            const expiryTime = sessionStorage.getItem('tokenExpiration');
            if (expiryTime) {
                const now = Date.now();
                const expiry = parseInt(expiryTime, 10);

                // If token is expired or will expire soon, refresh it
                if (expiry - now < 15 * 60 * 1000) { // Less than 15 minutes left
                    await getToken(true);
                    scheduleTokenRefresh();
                }
            }
        }
    });

    return true;
};

/**
 * Gets user claims from the current token
 * @returns {Promise<Object|null>} User claims or null if no user is logged in
 */
export const getUserClaims = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) return null;

    try {
        const idTokenResult = await currentUser.getIdTokenResult();
        return idTokenResult.claims;
    } catch (error) {
        console.error('Error getting user claims:', error);
        return null;
    }
};