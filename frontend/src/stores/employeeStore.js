// frontend\src\stores\employeeStore.js
import { defineStore } from 'pinia';
import axios from 'axios';
import { auth, db } from '@services/firebase';
import { getIdToken } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
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
        async createEmployee(employeeData, profileImage) {
            try {
                const authStore = useAuthStore();
                const idToken = await getIdToken(auth.currentUser);

                this.loading = true;
                this.error = null;

                // Step 1: Upload the image to the backend
                let uploadResponse = null;
                let fileName = null;
                let profileImageUrl = null;

                if (profileImage) {
                    const formData = new FormData();
                    formData.append('file', profileImage);

                    uploadResponse = await axios.post(`${apiUrl}administrator/upload`, formData, {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                            Authorization: `Bearer ${idToken}`,
                        },
                    });

                    console.log('Image upload response:', uploadResponse);
                    profileImageUrl = uploadResponse?.data?.fileUrl || null;
                    fileName = uploadResponse?.data?.fileData?.fileName || null;
                }
                else {
                    throw new Error('No image provided.');
                }

                // Step 2: Send the employee data along with the image URL
                const savingEmployeeResponse = await axios.post(`${apiUrl}administrator/employees/create`, {
                    ...employeeData,
                    fileName,
                    profileImageUrl,
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${idToken}`,
                        },
                    }
                );

                // Step 3: Save employee data locally if needed
                if (savingEmployeeResponse && savingEmployeeResponse.data) {
                    //this.employees.push(savingEmployeeResponse.data.employeeData);

                    //   make notif - employee saved successfully, or dalhin sa view

                    console.log('Employee saved successfully');
                    console.log(this.employees);

                    router.push({ name: 'AdminDashboardEmployees' });
                }

            } catch (error) {
                
                console.error('Error during employee creation:', error);
                this.error = error.response?.data?.message || 'Error creating employee';

            } finally {
                this.loading = false;
            }
        },

        async fetchBranches() {
            try {
                const branchCollection = collection(db, 'branches'); // Get the 'branches' collection reference
                const branchSnapshot = await getDocs(branchCollection); // Fetch all documents
                return branchSnapshot.docs.map(doc => ({
                    uid: doc.id, // Get the document ID
                    name: doc.data().name, // Get the 'name' field from the document
                }));
            } catch (error) {
                console.error('Error fetching branches:', error);
                return [];
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
                // Step 1: Get the collection reference
                const branchCollection = collection(db, 'branches');

                // Step 2: Construct the query to fetch only branches where isActive == true
                const activeBranchQuery = query(branchCollection, where('isActive', '==', true));

                // Step 3: Execute the query and get the documents
                const branchSnapshot = await getDocs(activeBranchQuery);

                // Step 4: Map the documents to return the required data
                return branchSnapshot.docs.map(doc => ({
                    uid: doc.id,
                    ...doc.data(),
                }));
            } catch (error) {
                console.error('Error fetching active branches:', error);
                return [];
            }
        }

    },
    persist: true
});
