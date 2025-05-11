// frontend\src\services\authService.js
import { auth, db } from './firebase';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    sendEmailVerification,
    sendPasswordResetEmail,
    setPersistence,
    browserLocalPersistence
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { getToken, clearTokenCache } from './tokenService';
import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_BASE_URL;

/**
 * Initialize auth persistence
 * @returns {Promise<void>}
 */
export const initializeAuthPersistence = () => {
    return setPersistence(auth, browserLocalPersistence);
};

/**
 * Get a fresh token for API calls
 * @param {boolean} forceRefresh - Force a token refresh
 * @returns {Promise<string|null>} The ID token or null if no user is logged in
 */
export const getFreshToken = (forceRefresh = false) => {
    return getToken(forceRefresh);
};

/**
 * Fetch user data from Firestore
 * @param {string} uid - User ID
 * @returns {Promise<Object|null>} User data or null if user doesn't exist
 */
export const fetchUserData = async (uid) => {
    try {
        const userDoc = await getDoc(doc(db, 'users', uid));
        if (userDoc.exists()) {
            return userDoc.data();
        }
        return null;
    } catch (error) {
        console.error('Error fetching user data:', error);
        throw error;
    }
};

/**
 * Login user with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} User credential
 */
export const loginUser = async (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
};

/**
 * Register a new user
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} User credential
 */
export const registerUser = async (email, password) => {
    return createUserWithEmailAndPassword(auth, email, password);
};

/**
 * Log out the current user
 * @returns {Promise<void>}
 */
export const logoutUser = async () => {
    clearTokenCache();
    return signOut(auth);
};

/**
 * Send email verification to the current user
 * @param {Object} user - Firebase user object
 * @returns {Promise<void>}
 */
export const sendVerificationEmail = async (user) => {
    return sendEmailVerification(user);
};

/**
 * Send password reset email
 * @param {string} email - User email
 * @returns {Promise<void>}
 */
export const resetPassword = async (email) => {
    return sendPasswordResetEmail(auth, email);
};

/**
 * Setup user claims via backend
 * @returns {Promise<boolean>} Success status
 */
export const setupUserClaims = async () => {
    try {
        const token = await getFreshToken(true);

        if (!token) {
            throw new Error('No authentication token available');
        }

        const response = await axios.post(
            `${apiUrl}account/setup-user`,
            {},
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        return response.data.success;
    } catch (error) {
        console.error('Error setting up user claims:', error);
        throw error;
    }
};

/**
 * Update user profile in Firestore
 * @param {string} uid - User ID
 * @param {Object} profileData - Profile data to update
 * @returns {Promise<void>}
 */
export const updateUserProfile = async (uid, profileData) => {
    try {
        const userRef = doc(db, 'users', uid);
        await updateDoc(userRef, {
            'profile.firstName': profileData.firstName,
            'profile.lastName': profileData.lastName,
            ...(profileData.phone && { 'profile.phone': profileData.phone }),
            ...(profileData.address && {
                'profile.address': {
                    street: profileData.address.street,
                    barangay: profileData.address.barangay,
                    municipality: profileData.address.municipality,
                    province: profileData.address.province,
                }
            })
        });
        return true;
    } catch (error) {
        console.error('Error updating user profile:', error);
        throw error;
    }
};