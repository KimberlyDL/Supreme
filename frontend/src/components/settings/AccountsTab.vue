<!-- frontend\src\components\settings\AccountsTab.vue -->
<template>
    <div class="max-w-4xl">
        <div class="mb-8">
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Account Settings</h2>
            <p class="text-gray-600 dark:text-gray-400 mt-1">Manage your account status and login information.</p>
        </div>

        <div class="space-y-8">
            <!-- Account Information -->
            <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Account Information</h3>

                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Email Address
                        </label>
                        <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <span class="text-gray-900 dark:text-white">{{ userStore.user?.email }}</span>
                            <span
                                class="text-xs px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full">
                                Verified
                            </span>
                        </div>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Account Status
                        </label>
                        <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <span class="text-gray-900 dark:text-white">
                                {{ userStore.user?.isActive ? 'Active' : 'Inactive' }}
                            </span>
                            <span :class="[
                                'text-xs px-2 py-1 rounded-full',
                                userStore.user?.isActive
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            ]">
                                {{ userStore.user?.isActive ? 'Active' : 'Inactive' }}
                            </span>
                        </div>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Account Role
                        </label>
                        <div class="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <span class="text-gray-900 dark:text-white capitalize">{{ userStore.user?.role }}</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Account Deactivation -->
            <div class="bg-white dark:bg-gray-800 rounded-lg border border-red-200 dark:border-red-800 p-6">
                <div class="flex items-start space-x-3">
                    <AlertTriangle class="w-5 h-5 text-red-500 mt-0.5" />
                    <div class="flex-1">
                        <h3 class="text-lg font-semibold text-red-900 dark:text-red-100 mb-2">Deactivate Account</h3>
                        <p class="text-red-700 dark:text-red-300 mb-4">
                            Once you deactivate your account, you will lose access to all services. This action can be
                            reversed by contacting support.
                        </p>

                        <button @click="showDeactivateModal = true" v-if="userStore.user?.isActive"
                            class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                            Deactivate Account
                        </button>

                        <div v-else class="text-red-600 dark:text-red-400">
                            Your account is currently deactivated. Contact support to reactivate.
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Deactivation Modal -->
        <div v-if="showDeactivateModal"
            class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Confirm Account Deactivation</h3>

                <p class="text-gray-600 dark:text-gray-400 mb-4">
                    Please enter your password to confirm account deactivation.
                </p>

                <form @submit.prevent="deactivateAccount">
                    <div class="mb-4">
                        <label for="confirmPassword"
                            class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Current Password
                        </label>
                        <input id="confirmPassword" v-model="deactivateForm.password" type="password" required
                            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-white"
                            placeholder="Enter your password" />
                    </div>

                    <div class="flex space-x-3">
                        <button type="button" @click="showDeactivateModal = false"
                            class="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                            Cancel
                        </button>
                        <button type="submit" :disabled="deactivateLoading"
                            class="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors">
                            <span v-if="deactivateLoading">Deactivating...</span>
                            <span v-else>Deactivate</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { AlertTriangle } from 'lucide-vue-next'
import { useUserStore } from '@/stores/userStore'

const userStore = useUserStore()
const showDeactivateModal = ref(false)
const deactivateLoading = ref(false)

const deactivateForm = ref({
    password: ''
})

const deactivateAccount = async () => {
    deactivateLoading.value = true
    try {
        await userStore.deactivateAccount(deactivateForm.value.password)
        showDeactivateModal.value = false
        alert('Account deactivated successfully')
    } catch (error) {
        alert('Error deactivating account: ' + error.message)
    } finally {
        deactivateLoading.value = false
        deactivateForm.value.password = ''
    }
}
</script>
