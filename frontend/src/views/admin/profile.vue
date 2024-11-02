<template>
  <div class="px-4 py-6">
    <h1 class="text-2xl font-semibold text-gray-900 sm:text-3xl dark:text-white">User Settings</h1>

    <div class="grid grid-cols-1 gap-6 mt-6 xl:grid-cols-3">
      <!-- Profile Picture -->
      <div class="p-4 bg-white border border-gray-200 rounded-lg shadow-sm dark:border-gray-700 sm:p-6 dark:bg-gray-800">
        <div class="items-center sm:flex xl:block 2xl:flex sm:space-x-4 xl:space-x-0 2xl:space-x-4">
          <img v-if="profilePreview" :src="profilePreview" class="mb-4 rounded-lg w-28 h-28 sm:mb-0 xl:mb-4 2xl:mb-0" alt="Profile picture preview">
          <div>
            <h3 class="mb-1 text-xl font-bold text-gray-900 dark:text-white">Profile picture</h3>
            <div class="mb-4 text-sm text-gray-500 dark:text-gray-400">JPG, GIF or PNG. Max size of 800K</div>
            <div class="flex items-center space-x-4">
              <input type="file" @change="handleProfileImageUpload" class="hidden" ref="pictureInput" />
              <button @click="selectPicture" class="btn-primary">Upload Picture</button>
              <button @click="deletePicture" class="btn-danger">Delete</button>
            </div>
            <p v-if="errors.profileImage" class="text-red-500 text-sm">{{ errors.profileImage }}</p>
            <button @click="saveProfileImage" :disabled="loading.profile" class="mt-4 btn-primary">
              <span v-if="loading.profile">Saving...</span>
              <span v-else>Save Profile Picture</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Address Information -->
      <div class="p-4 bg-white border border-gray-200 rounded-lg shadow-sm dark:border-gray-700 sm:p-6 dark:bg-gray-800">
        <h3 class="mb-4 text-xl font-semibold dark:text-white">Address Information</h3>
        <form @submit.prevent="saveAddressInfo">
          <div class="grid grid-cols-6 gap-6">
            <div v-for="field in addressFields" :key="field.id" class="col-span-6 sm:col-span-3">
              <label :for="field.id" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">{{ field.label }}</label>
              <input v-model="form.address[field.model]" :type="field.type" :id="field.id" :placeholder="field.placeholder"
                     class="input-field" :class="{ 'border-red-500': errors[field.model] }" />
              <p v-if="errors[field.model]" class="text-red-500 text-sm">{{ errors[field.model] }}</p>
            </div>
            <div class="col-span-6 sm:col-full">
              <button type="submit" :disabled="loading.address" class="w-full btn-primary">
                <span v-if="loading.address">Saving...</span>
                <span v-else>Save Address Information</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      <!-- Password Information -->
      <div class="p-4 bg-white border border-gray-200 rounded-lg shadow-sm dark:border-gray-700 sm:p-6 dark:bg-gray-800">
        <h3 class="mb-4 text-xl font-semibold dark:text-white">Password Information</h3>
        <form @submit.prevent="savePasswordInfo">
          <div class="grid grid-cols-6 gap-6">
            <div class="col-span-6 sm:col-span-3">
              <label for="current-password" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Current Password</label>
              <input v-model="form.password.current" type="password" id="current-password" class="input-field" placeholder="••••••••" required>
            </div>
            <div class="col-span-6 sm:col-span-3">
              <label for="new-password" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">New Password</label>
              <input v-model="form.password.new" type="password" id="new-password" class="input-field" placeholder="••••••••" required>
            </div>
            <div class="col-span-6 sm:col-span-3">
              <label for="confirm-password" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Confirm Password</label>
              <input v-model="form.password.confirm" type="password" id="confirm-password" class="input-field" placeholder="••••••••" required>
              <p v-if="errors.passwordConfirm" class="text-red-500 text-sm">{{ errors.passwordConfirm }}</p>
            </div>
            <div class="col-span-6 sm:col-full">
              <button type="submit" :disabled="loading.password" class="w-full btn-primary">
                <span v-if="loading.password">Saving...</span>
                <span v-else>Save Password</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const form = ref({
  profileImage: null,
  address: { street: '', barangay: '', city: '', municipality: '' },
  password: { current: '', new: '', confirm: '' }
})

const errors = ref({})
const loading = ref({ profile: false, address: false, password: false })
const profilePreview = ref(null)

// Functions for handling image upload and preview
const selectPicture = () => document.querySelector('input[type="file"]').click()

const handleProfileImageUpload = (event) => {
  const file = event.target.files[0]
  if (file && file.size < 800 * 1024) {
    profilePreview.value = URL.createObjectURL(file)
    form.value.profileImage = file
    errors.value.profileImage = null
  } else {
    errors.value.profileImage = 'Image must be under 800KB and in JPG, GIF, or PNG format.'
  }
}

const deletePicture = () => {
  form.value.profileImage = null
  profilePreview.value = null
}

// Save functions for each form section
const saveProfileImage = async () => {
  if (!form.value.profileImage) {
    errors.value.profileImage = 'Profile image is required.'
    return
  }
  loading.value.profile = true
  try {
    // Call your saveProfileImage API endpoint here
    await saveToServer(form.value.profileImage)
    alert('Profile image saved successfully!')
  } catch (error) {
    errors.value.profileImage = 'Error saving profile image.'
  } finally {
    loading.value.profile = false
  }
}

const saveAddressInfo = async () => {
  loading.value.address = true
  try {
    // Call your saveAddress API endpoint here
    await saveToServer(form.value.address)
    alert('Address information saved successfully!')
  } catch (error) {
    errors.value.address = 'Error saving address information.'
  } finally {
    loading.value.address = false
  }
}

const savePasswordInfo = async () => {
  if (form.value.password.new !== form.value.password.confirm) {
    errors.value.passwordConfirm = 'Passwords do not match.'
    return
  }
  loading.value.password = true
  try {
    // Call your savePassword API endpoint here
    await saveToServer(form.value.password)
    alert('Password updated successfully!')
  } catch (error) {
    errors.value.password = 'Error saving password.'
  } finally {
    loading.value.password = false
  }
}

// Helper function simulating API calls
const saveToServer = async (data) => new Promise((resolve) => setTimeout(resolve, 1000))
</script>

<style scoped>
.input-field {
  border: 1px solid #d1d5db;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  width: 100%;
}
.btn-primary {
  background-color: #1f2937;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  transition: background-color 0.3s;
}
.btn-primary:hover {
  background-color: #4b5563;
}
.btn-danger {
  background-color: #dc2626;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  transition: background-color 0.3s;
}
.btn-danger:hover {
  background-color: #b91c1c;
}
</style>
