// src/stores/batchStore.js
import { defineStore } from 'pinia';
import axios from 'axios';
import { auth } from '@/services/firebase';
import { getIdToken } from 'firebase/auth';

const apiUrl = import.meta.env.VITE_API_BASE_URL;

export const useBatchStore = defineStore('batch', {
  state: () => ({
    batches: [],
    loading: false,
    error: null,
  }),
  actions: {
    async fetchBatches(branchId) {
      try {
        this.loading = true;
        const idToken = await getIdToken(auth.currentUser);
        const response = await axios.get(`${apiUrl}/api/batches`, {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
          params: { branchId },
        });
        this.batches = response.data;
      } catch (error) {
        console.error('Error fetching batches:', error);
        this.error = error.message;
      } finally {
        this.loading = false;
      }
    },
    async addBatch(batchData) {
      try {
        this.loading = true;
        const idToken = await getIdToken(auth.currentUser);
        const response = await axios.post(`${apiUrl}/api/batches`, batchData, {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        });
        this.batches.push(response.data);
      } catch (error) {
        console.error('Error adding batch:', error);
        this.error = error.message;
      } finally {
        this.loading = false;
      }
    },
  },
});