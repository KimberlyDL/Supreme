// frontend\src\stores\employeeStore.js
import { defineStore } from 'pinia';
import axios from 'axios';
import { auth, db } from '@services/firebase';
import { getIdToken } from 'firebase/auth';
import { collection, query, where, getDocs, doc, getDoc, onSnapshot } from 'firebase/firestore';
import router from '@router';
import { useAuthStore } from './authStore';

const apiUrl = import.meta.env.VITE_API_BASE_URL;

export const useEmployeeStore = defineStore('employee', {
    state: () => ({
        employees: [],
        loading: false,
        error: null,
    }),

    actions: {
        // async createEmployee(employeeData, profileImage) {
        //     try {
        //         const authStore = useAuthStore();

        //         if (!authStore.user.role || (authStore.user.role !== 'owner' && employeeData.role === 'manager')) {
        //             throw new Error('Unauthorized to create this type of employee');
        //         }

        //         const idToken = await getIdToken(auth.currentUser);

        //         this.loading = true;
        //         this.error = null;

        //         let uploadResponse = null;
        //         let fileName = null;
        //         let profileImageUrl = null;

        //         if (profileImage) {
        //             const formData = new FormData();
        //             formData.append('file', profileImage);
        //             formData.append('role', employeeData.role);

        // // make check in middleware logging
        // formData.append('action', 'CREATE_EMPLOYEE');

        //             uploadResponse = await axios.post(`${apiUrl}administrator/upload`,
        //                 formData,
        //                 {
        //                     headers: {
        //                         'Content-Type': 'multipart/form-data',
        //                         Authorization: `Bearer ${idToken}`,
        //                     },
        //                 });

        //             console.log('Image upload response:', uploadResponse);
        //             profileImageUrl = uploadResponse?.data?.fileUrl || null;
        //             fileName = uploadResponse?.data?.fileData?.fileName || null;
        //         }
        //         else {
        //             throw new Error('No image provided.');
        //         }

        //         const savingEmployeeResponse = await axios.post(`${apiUrl}administrator/employees/create`, {
        //             ...employeeData,
        //             fileName,
        //             profileImageUrl,
        //         },
        //             {
        //                 headers: {
        //                     Authorization: `Bearer ${idToken}`,
        //                 },
        //             }
        //         );

        //         if (savingEmployeeResponse && savingEmployeeResponse.data) {
        //             //this.employees.push(savingEmployeeResponse.data.employeeData);

        //             //   make notif - employee saved successfully, or dalhin sa view

        //             console.log('Employee saved successfully');
        //             console.log(this.employees);

        //             router.push({ name: 'AdminDashboardEmployees' });
        //         }

        //     } catch (error) {

        //         console.error('Error during employee creation:', error);
        //         this.error = error.response?.data?.message || 'Error creating employee';

        //     } finally {
        //         this.loading = false;
        //     }
        // },

        async createEmployeeWithImage(formData) {
            try {
                const authStore = useAuthStore();

                if (!authStore.user.role || (authStore.user.role !== 'owner' && formData.get('role') === 'manager')) {
                    throw new Error('Unauthorized to create this type of employee');
                }

                const idToken = await getIdToken(auth.currentUser);

                this.loading = true;
                this.error = null;

                // make check in middleware logging
                formData.append('action', 'CREATE_EMPLOYEE');

                const response = await axios.post(
                    `${apiUrl}administrator/employees/create`,
                    formData,
                    {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                            Authorization: `Bearer ${idToken}`,
                        },
                    }
                );

                if (response && response.data) {
                    console.log('Employee saved successfully');
                    router.push({ name: 'AdminDashboardEmployees' });
                }

            } catch (error) {
                console.error('Error during employee creation:', error);
                this.error = error.response?.data?.message || 'Error creating employee';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async fetchAssignedBranches(employeeId) {
            try {


                console.log('Fetching assigned branches for employee:', employeeId);

                // 1️⃣ Get the employee document
                const employeeRef = doc(db, "employees", employeeId);
                const employeeSnap = await getDoc(employeeRef);

                if (!employeeSnap.exists()) {
                    console.warn("Employee not found");
                    return;
                }

                const assignedBranchNames = employeeSnap.data().branch; // Assuming this is a string or an array

                if (!assignedBranchNames || assignedBranchNames.length === 0) {
                    console.warn("No assigned branches");
                    return;
                }

                // 2️⃣ Firestore query to fetch matching branches
                const branchesRef = collection(db, "branches");
                const q = query(branchesRef, where("name", "in", Array.isArray(assignedBranchNames) ? assignedBranchNames : [assignedBranchNames]));

                // 3️⃣ Set up Firestore listener
                this.unsubscribeBranchNames = onSnapshot(q, (snapshot) => {
                    this.fetchedBranchNames = snapshot.docs.map(doc => doc.data().name);
                    console.log("Updated branches:", this.fetchedBranchNames);
                });

            } catch (error) {
                console.error("Error fetching assigned branches:", error);
            }
        },
        
        async fetchEmployees() {
            try {
                this.loading = true
                const employeeCollection = collection(db, 'employees')
                const employeeSnapshot = await getDocs(employeeCollection)
                this.employees = employeeSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                }))
            } catch (error) {
                console.error('Error fetching employees:', error)
            } finally {
                this.loading = false
            }
        },

        async fetchActiveBranches() {
            try {
                const branchCollection = collection(db, 'branches');
                const activeBranchQuery = query(branchCollection, where('isActive', '==', true));
                const branchSnapshot = await getDocs(activeBranchQuery);
                return branchSnapshot.docs.map(doc => ({
                    uid: doc.id,
                    ...doc.data(),
                }));
            } catch (error) {
                console.error('Error fetching active branches:', error);
                throw error;
            }
        },

        async fetchEmployee(employeeId) {
            try {
                const employeeDoc = await getDoc(doc(db, 'employees', employeeId));
                if (employeeDoc.exists()) {
                    const data = employeeDoc.data();
                    return {
                        id: employeeDoc.id,
                        ...data,
                        address: data.address || {}, // Ensure address is an object
                    };
                } else {
                    throw new Error('Employee not found');
                }
            } catch (error) {
                console.error('Error fetching employee:', error);
                throw error;
            }
        },

        async updateEmployee(employeeId, employeeData, profileImage) {
            try {
                const idToken = await getIdToken(auth.currentUser);

                this.loading = true;
                this.error = null;

                let profileImageUrl = employeeData.profileImageUrl;
                let fileName = null;

                if (profileImage) {
                    const formData = new FormData();

                    formData.append('file', profileImage);
                    formData.append('role', employeeData.role);

                    const uploadResponse = await axios.post(`${apiUrl}administrator/upload`,
                        formData,
                        {
                            headers: {
                                'Content-Type': 'multipart/form-data',
                                Authorization: `Bearer ${idToken}`,
                            },
                        });

                    profileImageUrl = uploadResponse?.data?.fileUrl || null;
                    fileName = uploadResponse?.data?.fileData?.fileName || null;
                }

                // console.log(employeeData);

                const updateResponse = await axios.put(`${apiUrl}administrator/employees/${employeeId}`, {
                    ...employeeData,
                    fileName,
                    profileImageUrl,
                }, {
                    headers: {
                        Authorization: `Bearer ${idToken}`,
                    },
                });

                if (updateResponse && updateResponse.data) {
                    // Update the local employee data if needed
                    const index = this.employees.findIndex(e => e.id === employeeId);
                    if (index !== -1) {
                        this.employees[index] = { ...this.employees[index], ...updateResponse.data.employeeData };
                    }
                    return updateResponse.data.employeeData;
                }
            } catch (error) {
                console.error('Error updating employee:', error);
                this.error = error.response?.data?.message || 'Error updating employee';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        // frontend\src\stores\employeeStore.js
        async deactivateEmployee(employeeId) {
            try {
                const idToken = await getIdToken(auth.currentUser);
                const response = await axios.put(`${apiUrl}administrator/employees/${employeeId}/deactivate`, {}, {
                    headers: {
                        Authorization: `Bearer ${idToken}`,
                    },
                });
                return response.data;
            } catch (error) {
                console.error('Error deactivating employee:', error);
                throw error;
            }
        },

        async activateEmployee(employeeId) {
            try {
                const idToken = await getIdToken(auth.currentUser);
                const response = await axios.put(`${apiUrl}administrator/employees/${employeeId}/activate`, {}, {
                    headers: {
                        Authorization: `Bearer ${idToken}`,
                    },
                });
                return response.data;
            } catch (error) {
                console.error('Error activating employee:', error);
                throw error;
            }
        },

        async deleteEmployee(employeeId) {
            try {
                const idToken = await getIdToken(auth.currentUser);
                const response = await axios.delete(`${apiUrl}administrator/employees/${employeeId}`, {
                    headers: {
                        Authorization: `Bearer ${idToken}`,
                    },
                });
                return response.data;
            } catch (error) {
                console.error('Error deleting employee:', error);
                throw error;
            }
        },
    },
    persist: true
});