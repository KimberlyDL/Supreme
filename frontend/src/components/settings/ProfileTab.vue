<!-- frontend\src\components\settings\ProfileTab.vue -->
<template>
    <div class="max-w-4xl">
        <div class="mb-8">
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Profile Settings</h2>
            <p class="text-gray-600 dark:text-gray-400 mt-1">Manage your personal information and profile picture.</p>
        </div>

        <form @submit.prevent="saveProfile" class="space-y-8">
            <!-- Profile Picture Section -->
            <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Profile Picture</h3>

                <div class="flex items-center space-x-6">
                    <div class="relative">
                        <img :src="profileForm.avatarPreview || '/placeholder.svg?height=80&width=80'"
                            alt="Profile picture"
                            class="w-20 h-20 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600" />
                        <button type="button" @click="selectAvatar"
                            class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 hover:opacity-100 transition-opacity">
                            <Camera class="w-5 h-5 text-white" />
                        </button>
                    </div>

                    <div class="flex-1">
                        <input ref="avatarInput" type="file" accept="image/*" @change="handleAvatarChange"
                            class="hidden" />
                        <div class="flex space-x-3">
                            <button type="button" @click="selectAvatar"
                                class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
                                Upload Photo
                            </button>
                            <button type="button" @click="removeAvatar" v-if="profileForm.avatarPreview"
                                class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                                Remove
                            </button>
                        </div>
                        <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">JPG, PNG or GIF. Max size 2MB.</p>
                    </div>
                </div>
            </div>

            <!-- Personal Information -->
            <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Personal Information</h3>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label for="firstName" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            First Name
                        </label>
                        <input id="firstName" v-model="profileForm.firstName" type="text"
                            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                            placeholder="Enter your first name" />
                    </div>

                    <div>
                        <label for="lastName" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Last Name
                        </label>
                        <input id="lastName" v-model="profileForm.lastName" type="text"
                            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                            placeholder="Enter your last name" />
                    </div>

                    <div>
                        <label for="number" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Phone Number
                        </label>
                        <input id="number" v-model="profileForm.number" type="tel"
                            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                            placeholder="Enter your phone number" />
                    </div>
                </div>
            </div>

            <!-- Address Information -->
            <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Address</h3>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="md:col-span-2">
                        <label for="street" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Street Address
                        </label>
                        <input id="street" v-model="profileForm.address.street" type="text"
                            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                            placeholder="Enter your street address" />
                    </div>

                    <div>
                        <label for="barangay" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Barangay
                        </label>
                        <input id="barangay" v-model="profileForm.address.barangay" type="text"
                            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                            placeholder="Enter your barangay" />
                    </div>

                    <div>
                        <label for="municipality"
                            class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Municipality
                        </label>
                        <input id="municipality" v-model="profileForm.address.municipality" type="text"
                            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                            placeholder="Enter your municipality" />
                    </div>

                    <div>
                        <label for="province" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Province
                        </label>
                        <input id="province" v-model="profileForm.address.province" type="text"
                            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                            placeholder="Enter your province" />
                    </div>
                </div>
            </div>

            <!-- Save Button -->
            <div class="flex justify-end">
                <button type="submit" :disabled="loading"
                    class="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                    <span v-if="loading">Saving...</span>
                    <span v-else>Save Changes</span>
                </button>
            </div>
        </form>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Camera } from 'lucide-vue-next'
import { useUserStore } from '@/stores/userStore'

const userStore = useUserStore()
const loading = ref(false)
const avatarInput = ref(null)

const profileForm = ref({
    firstName: '',
    lastName: '',
    number: '',
    address: {
        street: '',
        barangay: '',
        municipality: '',
        province: ''
    },
    avatarFile: null,
    avatarPreview: null
})

const selectAvatar = () => {
    avatarInput.value.click()
}

const handleAvatarChange = (event) => {
    const file = event.target.files[0]
    if (file) {
        if (file.size > 2 * 1024 * 1024) {
            alert('File size must be less than 2MB')
            return
        }

        profileForm.value.avatarFile = file
        profileForm.value.avatarPreview = URL.createObjectURL(file)
    }
}

const removeAvatar = () => {
    profileForm.value.avatarFile = null
    profileForm.value.avatarPreview = null
    if (avatarInput.value) {
        avatarInput.value.value = ''
    }
}

const saveProfile = async () => {
    loading.value = true
    try {
        await userStore.updateProfile(profileForm.value)
        alert('Profile updated successfully!')
    } catch (error) {
        alert('Error updating profile: ' + error.message)
    } finally {
        loading.value = false
    }
}

onMounted(async () => {
    await userStore.fetchUserProfile()
    const user = userStore.user
    if (user) {
        profileForm.value = {
            firstName: user.profile?.firstName || '',
            lastName: user.profile?.lastName || '',
            number: user.profile?.number || '',
            address: {
                street: user.profile?.address?.street || '',
                barangay: user.profile?.address?.barangay || '',
                municipality: user.profile?.address?.municipality || '',
                province: user.profile?.address?.province || ''
            },
            avatarFile: null,
            avatarPreview: user.profile?.avatarUrl || null
        }
    }
})
</script>
