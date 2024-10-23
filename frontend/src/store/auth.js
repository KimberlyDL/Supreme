// frontend\src\store\auth.js
import { defineStore } from 'pinia';
import axios from 'axios';
import router from '../router';

const apiUrl = import.meta.env.VITE_API_BASE_URL;

export const useAuthStore = defineStore('auth', {
    state: () => ({
        token: null,
        user: null,
    }),
    actions: {
        async register(userDetails) {
            try {
                const { data } = await axios.post('${apiUrl}/signup', userDetails);
                this.token = data.token;
                this.user = data.user;
            } catch (error) {
                console.error('Registration error:', error);
            }
        },
        async login(username, password) {
            const response = await axios.post(`${apiUrl}/login`, { username, password });
            this.token = response.data.token;
            axios.defaults.headers.common['Authorization'] = `Bearer ${this.token}`;
            router.push('/');
        },
        logout() {
            this.token = null;
            this.user = null;
            delete axios.defaults.headers.common['Authorization'];
            router.push('/login');
        },
    },
    persist: true,
});
