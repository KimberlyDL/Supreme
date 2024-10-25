// frontend\src\store\auth.js
import { defineStore } from 'pinia';
import { auth } from '@services/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
  }),
  actions: {
    async register(email, password) {
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        this.user = userCredential.user;
      } catch (error) {
        console.error('Registration error:', error.message);
      }
    },
    async login(email, password) {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        this.user = userCredential.user;
      } catch (error) {
        console.error('Login error:', error.message);
      }
    },
    async logout() {
      try {
        await signOut(auth);
        this.user = null;
      } catch (error) {
        console.error('Logout error:', error.message);
      }
    },
  },
  persist: true,
});
