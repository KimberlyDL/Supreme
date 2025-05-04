import { defineStore } from 'pinia';
import { auth } from '@/services/firebase';
import {
    signInWithEmailAndPassword,
    signOut,
    createUserWithEmailAndPassword,
    sendPasswordResetEmail,
    updateProfile,
    updateEmail,
    updatePassword,
    reauthenticateWithCredential,
    EmailAuthProvider
} from 'firebase/auth';
import axios from 'axios';
import { getIdToken } from 'firebase/auth';

const apiUrl = import.meta.env.VITE_API_BASE_URL;

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: null,
        isLoggedIn: false,
        loading: false,
        error: null,
        isInitializing: true,
        userRole: null,
        availableBranches: []
    }),

    getters: {
        currentUser: (state) => state.user,
        isAdmin: (state) => ['owner', 'manager'].includes(state.userRole),
        isOwner: (state) => state.userRole === 'owner',
        isManager: (state) => state.userRole === 'manager',
        isStockManager: (state) => state.userRole === 'stock_manager',
        userBranch: (state) => state.user?.branch || null
    },

    actions: {
        async login(email, password) {
            this.loading = true;
            this.error = null;

            try {
                const userCredential = await signInWithEmailAndPassword(auth, email, password);
                const idToken = await getIdToken(userCredential.user);

                // Get user data from backend
                const response = await axios.get(`${apiUrl}users/me`, {
                    headers: {
                        Authorization: `Bearer ${idToken}`
                    }
                });

                this.user = {
                    uid: userCredential.user.uid,
                    email: userCredential.user.email,
                    ...response.data
                };

                this.userRole = response.data.role;
                this.isLoggedIn = true;

                // Fetch available branches if user is admin
                if (['owner', 'manager'].includes(this.userRole)) {
                    await this.fetchAvailableBranches();
                }

                return { success: true };
            } catch (error) {
                this.error = error.message;
                return { success: false, error: error.message };
            } finally {
                this.loading = false;
            }
        },

        async logout() {
            try {
                await signOut(auth);
                this.user = null;
                this.isLoggedIn = false;
                this.userRole = null;
                this.availableBranches = [];
                return { success: true };
            } catch (error) {
                this.error = error.message;
                return { success: false, error: error.message };
            }
        },

        async register(userData) {
            this.loading = true;
            this.error = null;

            try {
                const userCredential = await createUserWithEmailAndPassword(auth, userData.email, userData.password);

                // Send user data to backend
                const idToken = await getIdToken(userCredential.user);

                const response = await axios.post(`${apiUrl}users/register`, {
                    ...userData,
                    uid: userCredential.user.uid
                }, {
                    headers: {
                        Authorization: `Bearer ${idToken}`
                    }
                });

                return { success: true, user: response.data };
            } catch (error) {
                this.error = error.message;
                return { success: false, error: error.message };
            } finally {
                this.loading = false;
            }
        },

        async resetPassword(email) {
            this.loading = true;
            this.error = null;

            try {
                await sendPasswordResetEmail(auth, email);
                return { success: true };
            } catch (error) {
                this.error = error.message;
                return { success: false, error: error.message };
            } finally {
                this.loading = false;
            }
        },

        async updateUserProfile(displayName, photoURL) {
            this.loading = true;
            this.error = null;

            try {
                await updateProfile(auth.currentUser, {
                    displayName,
                    photoURL
                });

                // Update local user state
                this.user = {
                    ...this.user,
                    displayName,
                    photoURL
                };

                return { success: true };
            } catch (error) {
                this.error = error.message;
                return { success: false, error: error.message };
            } finally {
                this.loading = false;
            }
        },

        async updateUserEmail(newEmail, password) {
            this.loading = true;
            this.error = null;

            try {
                // Re-authenticate user first
                const credential = EmailAuthProvider.credential(auth.currentUser.email, password);
                await reauthenticateWithCredential(auth.currentUser, credential);

                // Update email
                await updateEmail(auth.currentUser, newEmail);

                // Update local user state
                this.user = {
                    ...this.user,
                    email: newEmail
                };

                return { success: true };
            } catch (error) {
                this.error = error.message;
                return { success: false, error: error.message };
            } finally {
                this.loading = false;
            }
        },

        async updateUserPassword(currentPassword, newPassword) {
            this.loading = true;
            this.error = null;

            try {
                // Re-authenticate user first
                const credential = EmailAuthProvider.credential(auth.currentUser.email, currentPassword);
                await reauthenticateWithCredential(auth.currentUser, credential);

                // Update password
                await updatePassword(auth.currentUser, newPassword);

                return { success: true };
            } catch (error) {
                this.error = error.message;
                return { success: false, error: error.message };
            } finally {
                this.loading = false;
            }
        },

        async fetchAvailableBranches() {
            try {
                const idToken = await getIdToken(auth.currentUser);

                const response = await axios.get(`${apiUrl}branches`, {
                    headers: {
                        Authorization: `Bearer ${idToken}`
                    }
                });

                this.availableBranches = response.data;
                return this.availableBranches;
            } catch (error) {
                console.error('Error fetching branches:', error);
                return [];
            }
        },

        setUser(user) {
            if (user) {
                this.user = user;
                this.isLoggedIn = true;
                this.userRole = user.role;
            } else {
                this.user = null;
                this.isLoggedIn = false;
                this.userRole = null;
            }
        }
    },

    persist: {
        enabled: true,
        strategies: [
            {
                key: 'auth',
                storage: localStorage,
                paths: ['user', 'isLoggedIn', 'userRole']
            }
        ]
    }
});