// frontend\src\services\authListenerService.js
// src/services/auth-state.service.js
import { auth, db } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useAuthStore } from '@/stores/authStore';
import { initTokenRefresh } from './tokenService';

/**
 * Securely restores authentication state on page refresh
 * Returns a promise that resolves when auth state is restored
 * @returns {Promise<Object|null>} User profile or null if no user is logged in
 */
export const restoreAuthState = () => {
    const authStore = useAuthStore();

    return new Promise((resolve, reject) => {
        // Set a timeout to prevent hanging indefinitely
        const timeoutId = setTimeout(() => {
            authStore.isInitializing = false;
            reject(new Error('Auth state restoration timed out'));
        }, 10000); // 10 seconds timeout

        // Listen for auth state change from Firebase
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            try {
                // Clear timeout and unsubscribe to prevent memory leaks
                clearTimeout(timeoutId);
                unsubscribe();

                if (!user) {
                    // No user is signed in
                    authStore.isLoggedIn = false;
                    authStore.isInitializing = false;
                    return resolve(null);
                }

                // // Get fresh token with latest claims
                // const idTokenResult = await user.getIdTokenResult(true);

                // Fetch user data from Firestore
                const userDoc = await getDoc(doc(db, 'users', user.uid));

                if (!userDoc.exists()) {
                    console.warn(`User ${user.uid} exists in Firebase Auth but not in Firestore`);
                    authStore.isLoggedIn = false;
                    authStore.isInitializing = false;
                    return resolve(null);
                }

                const userData = userDoc.data();

                // Create user profile with verified data
                const userProfile = {
                    uid: user.uid,
                    role: userData.role || 'client',
                    firstName: userData.profile?.firstName || '',
                    lastName: userData.profile?.lastName || '',
                    email: userData.email || user.email,
                    emailVerified: user.emailVerified,
                    isLoggedIn: true,
                    // Include branch only if it exists
                    ...(userData.branch && { branch: userData.branch })
                };

                // Update auth store with verified data
                await authStore.setUser(userProfile);

                // no need authStore.setUser already have this
                // // Initialize token refresh mechanism
                // await initTokenRefresh();

                authStore.isInitializing = false;
                resolve(userProfile);
            } catch (error) {
                console.error('Error restoring auth state:', error);
                authStore.isLoggedIn = false;
                authStore.isInitializing = false;
                reject(error);
            }
        });
    });
};

/**
 * Continuously monitors auth state and keeps store in sync
 * This ensures the UI always reflects the current auth state
 * @returns {Function} Unsubscribe function to stop listening
 */
export const setupAuthStateListener = () => {
    const authStore = useAuthStore();

    return onAuthStateChanged(auth, async (user) => {
        try {
            if (!user) {
                // User signed out
                if (authStore.isLoggedIn) {
                    authStore.isLoggedIn = false;
                }
                return;
            }

            // User is signed in, update store if needed
            if (!authStore.isLoggedIn || authStore.user.uid !== user.uid) {
                // Fetch user data from Firestore
                const userDoc = await getDoc(doc(db, 'users', user.uid));

                if (userDoc.exists()) {
                    const userData = userDoc.data();

                    // Update store with fresh data
                    await authStore.setUser({
                        uid: user.uid,
                        role: userData.role || 'client',
                        firstName: userData.profile?.firstName || '',
                        lastName: userData.profile?.lastName || '',
                        email: userData.email || user.email,
                        emailVerified: user.emailVerified,
                        isLoggedIn: true,
                        ...(userData.branch && { branch: userData.branch })
                    });
                } else {
                    // User exists in Auth but not in Firestore
                    console.warn(`User ${user.uid} exists in Auth but not in Firestore`);
                    authStore.isLoggedIn = false;
                }
            }
        } catch (error) {
            console.error('Error in auth state listener:', error);
        }
    });
};

//#region routeGuards
// for route guards before each 
/**
 * Verifies if the current user has the required role
 * Gets data directly from Firebase, not from client-side store
 * @param {Array<string>} requiredRoles - Array of allowed roles
 * @returns {Promise<boolean>} True if user has one of the required roles
 */
export const verifyUserRole = async (requiredRoles = []) => {
    const currentUser = auth.currentUser;

    if (!currentUser) {
        return false;
    }

    try {
        // Get fresh token to ensure we have the latest claims
        const idTokenResult = await currentUser.getIdTokenResult(true);

        // Get user data from Firestore
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));

        if (!userDoc.exists()) {
            return false;
        }

        const userData = userDoc.data();
        const userRole = userData.role || 'client';

        // console.log('userDATA', userData);

        // If no specific roles required, just being authenticated is enough
        if (!requiredRoles.length) {

            console.log("isAuthorized: true");
            // return true;
            return { isAuthorized: true, userData };
        }

        // // Check if user has one of the required roles
        // console.log('requiredRoles', requiredRoles.includes(userRole));

        return { isAuthorized: requiredRoles.includes(userRole), userData };
        
    } catch (error) {
        console.error('Error verifying user role:', error);
        return false;
    }
};