// store/auth.js
import { defineStore } from 'pinia';
import axios from 'axios';
import router from '../router';

export const useAuthStore = defineStore('auth', {
    state: () => ({
        token: null,
        user: null,
    }),
    actions: {
        async register(username, password) {
            await axios.post('/api/register', { username, password });
        },
        async login(username, password) {
            const response = await axios.post('/api/login', { username, password });
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
    persist: {
        enabled: true,
    },
});
