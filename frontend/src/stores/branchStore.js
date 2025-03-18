// frontend\src\stores\branchStore.js
import { defineStore } from 'pinia';
import axios from 'axios';
import { db, auth } from '@services/firebase';
import { getIdToken } from 'firebase/auth';
import { useAuthStore } from './authStore';
import { collection, query, where, getDocs, doc, getDoc, onSnapshot } from 'firebase/firestore';

const apiUrl = import.meta.env.VITE_API_BASE_URL;

export const useBranchStore = defineStore('branch', {
    state: () => ({
        branchData: {
            name: '',
            location: {
                street: '',
                barangay: '',
                municipality: '',
                province: '',
            },
            isActive: true,
        },
        branches: [],
        unsubscribeBranches: null,
        unsubscribeCategories: null,
        fetchedBranches: [],
        fetchedCategories: []
    }),
    actions: {
        // When you set up a Firestore listener using onSnapshot(), Firebase returns an unsubscribe function.
        fetchBranchesRealtime() {
            try {
                console.log('Fetching branches...'); 
                const branchesRef = collection(db, 'branches');
                this.unsubscribeBranches = onSnapshot(branchesRef, (snapshot) => {
                    // this.fetchedBranches = snapshot.docs.map(doc => ({
                    //     id: doc.id,
                    //     ...doc.data()
                    // }));
                    this.fetchedBranches = snapshot.docs.map(doc => doc.data().name);
                });
            } catch (error) {
                console.error(error);
            }
        },

        fetchCategoriesRealtime() {
            const categoryRef = query(collection(db, 'categories'), where('isActive', '==', true));
            this.unsubscribeCategories = onSnapshot(categoryRef, (snapshot) => {
                this.fetchedCategories = snapshot.docs.map(doc => doc.data().name);
            });
        },

        stopListening() {
            if (this.unsubscribeBranches) {
                this.unsubscribeBranches();
                this.unsubscribeBranches = null;
                this.fetchedBranches = [];
            }
            if (this.unsubscribeCategories) {
                this.unsubscribeCategories();
                this.unsubscribeCategories = null;
                this.fetchedCategories = [];
            }
        },

        async addBranch(branchData) {
            try {
                const authStore = useAuthStore();
                const idToken = await getIdToken(auth.currentUser);

                const payload = {
                    name: branchData.name,
                    location: branchData.location,
                    isActive: branchData.isActive,
                    createdBy: {
                        uid: authStore.user.uid,
                        firstName: authStore.user.firstName,
                        lastName: authStore.user.lastName,
                        email: authStore.user.email
                    }
                };

                console.log('Payload sent to backend:', payload);
                console.log('ID Token sent to backend:', idToken);

                const response = await axios.post(
                    `${apiUrl}administrator/branches`,
                    payload,
                    {
                        headers: {
                            Authorization: `Bearer ${idToken}`,
                        },
                    }
                );

                //make notif
                console.log('Branch created:', response.data);

            } catch (error) {
                // Log detailed error response if available
                if (error.response) {
                    console.error('Error creating branch:', error.response.data);
                } else {
                    console.error('Error creating branch:', error.message);
                }
            }
        },

        async getExistingStoreBranches() {
            try {
                const response = await axios.get(`${apiUrl}store/branches`);
                if (response.data) {
                    return response.data;
                }
            } catch (error) {
                console.error('getExistingStoreBranches:', error.message);
            }
        },

        async editBranch(branchId, branchData) {
            try {
                const authStore = useAuthStore();
                const idToken = await getIdToken(auth.currentUser);

                const payload = {
                    name: branchData.name,
                    location: branchData.location,
                    isActive: branchData.isActive,
                    updatedBy: {
                        uid: authStore.user.uid,
                        firstName: authStore.user.firstName,
                        lastName: authStore.user.lastName,
                        email: authStore.user.email
                    }
                };

                const response = await axios.put(
                    `${apiUrl}administrator/branches/${branchId}`,
                    payload,
                    {
                        headers: {
                            Authorization: `Bearer ${idToken}`,
                        },
                    }
                );

                console.log('Branch updated:', response.data);
                return response.data;

            } catch (error) {
                console.error('Error updating branch:', error);
                throw error;
            }
        },

        async toggleBranchStatus(branchId, currentStatus) {
            try {
                const authStore = useAuthStore();
                const idToken = await getIdToken(auth.currentUser);

                const payload = {
                    isActive: !currentStatus,
                    updatedBy: {
                        uid: authStore.user.uid,
                        firstName: authStore.user.firstName,
                        lastName: authStore.user.lastName,
                        email: authStore.user.email
                    }
                };

                const response = await axios.put(
                    `${apiUrl}administrator/branches/${branchId}/toggle-status`,
                    payload,
                    {
                        headers: {
                            Authorization: `Bearer ${idToken}`,
                        },
                    }
                );

                console.log('Branch status updated:', response.data);
                return response.data;

            } catch (error) {
                console.error('Error updating branch status:', error);
                throw error;
            }
        },
    },
    persist: true
});