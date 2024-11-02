// frontend/src/stores/adminProfileStore.js
import { defineStore } from 'pinia'
import axios from 'axios'

const apiUrl = import.meta.env.VITE_API_BASE_URL

export const useAdminProfileStore = defineStore('adminProfile', {
  state: () => ({
    loading: { profile: false, address: false, password: false },
    error: { profile: null, address: null, password: null }
  }),

  actions: {
    async saveProfileImage(imageFile) {
      this.loading.profile = true
      this.error.profile = null
      try {
        const formData = new FormData()
        formData.append('file', imageFile)

        const response = await axios.post(`${apiUrl}/admin/profile/upload-image`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        return response.data // Return saved data to the component if needed
      } catch (error) {
        this.error.profile = 'Failed to save profile image. Please try again.'
      } finally {
        this.loading.profile = false
      }
    },

    async saveAddressInfo(addressData) {
      this.loading.address = true
      this.error.address = null
      try {
        const response = await axios.post(`${apiUrl}/admin/profile/update-address`, addressData)
        return response.data
      } catch (error) {
        this.error.address = 'Failed to save address information. Please try again.'
      } finally {
        this.loading.address = false
      }
    },

    async savePasswordInfo(passwordData) {
      this.loading.password = true
      this.error.password = null
      try {
        const response = await axios.post(`${apiUrl}/admin/profile/update-password`, passwordData)
        return response.data
      } catch (error) {
        this.error.password = 'Failed to update password. Please try again.'
      } finally {
        this.loading.password = false
      }
    }
  }
})
