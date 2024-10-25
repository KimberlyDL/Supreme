// frontend\src\store\auth.js
import { defineStore } from 'pinia';
import axios from 'axios';
import router from '../router';

const apiUrl = import.meta.env.VITE_API_BASE_URL;

export const useAuthStore = defineStore('auth', {
    state: () => ({
        accessToken: null,
    }),
    actions: {
        setAccessToken(token) {
            this.accessToken = token;
            startTokenTimer(token);
        },

        async register(userDetails) {
            try {
                const { data } = await axios.post(`${apiUrl}/signup`, userDetails);
                return true;
            } catch (error) {
                throw error;
            }
        },
        async login(username, password) {
            const response = await axios.post(`${apiUrl}/login`, { username, password });
            this.token = response.data.token;
            axios.defaults.headers.common['Authorization'] = `Bearer ${this.token}`;
            router.push('/');
        },
        async logout() {
            try {
                await apiClient.post('/session/logout', { refreshToken: this.getRefreshTokenFromCookies() });

                this.clearAccessToken();

                this.user = null;

                delete apiClient.defaults.headers.common['Authorization'];

                router.push('/login');
            } catch (error) {
                console.error('Logout error:', error);
            };
        },
        clearAccessToken() {
            this.accessToken = null;
            window.location.href = '/login';
        },
        getRefreshTokenFromCookies() {
            const refreshToken = document.cookie.split('; ').find((row) => row.startsWith('refreshToken='));
            return refreshToken ? refreshToken.split('=')[1] : null;
        },
        persist: true,
    }
});
