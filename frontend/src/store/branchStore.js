// stores/branchStore.js
import { defineStore } from 'pinia';
import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_BASE_URL;

export const useBranchStore = defineStore('branch', {
    state: () => ({
        branchData: {
            name: '',
            location: {
                street: '',
                barangay: '',
                city: '',
                municipality: '',
            },
            contact: '',
            manager: '',
            isActive: true,
        },
        token: null // JWT token, typically obtained after login
    }),
    actions: {
        async addBranch() {
            try {
                // const payload = {
                //     ...this.branchData,
                //     userId: this.userId // Include userId in the payload
                // };
                const response = await axios.post(
                    `${apiUrl}/administrator/branches`,
                    this.branchData,
                    {
                        headers: {
                            Authorization: `Bearer ${this.token}` // Send token in Authorization header
                        }
                    }
                );
                console.log('Branch created:', response.data);
            } catch (error) {
                console.error('Error creating branch:', error);
            }
        },
    }
});