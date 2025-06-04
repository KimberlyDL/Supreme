<!-- frontend\src\components\settings\PasswordTab.vue -->
<template>
    <div class="max-w-2xl">
        <div class="mb-8">
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Password Settings</h2>
            <p class="text-gray-600 dark:text-gray-400 mt-1">Update your password to keep your account secure.</p>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <form @submit.prevent="changePassword" class="space-y-6">
                <div>
                    <label for="currentPassword"
                        class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Current Password
                    </label>
                    <div class="relative">
                        <input id="currentPassword" v-model="passwordForm.currentPassword"
                            :type="showCurrentPassword ? 'text' : 'password'" required
                            class="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                            placeholder="Enter your current password" />
                        <button type="button" @click="showCurrentPassword = !showCurrentPassword"
                            class="absolute inset-y-0 right-0 pr-3 flex items-center">
                            <Eye v-if="!showCurrentPassword" class="h-4 w-4 text-gray-400" />
                            <EyeOff v-else class="h-4 w-4 text-gray-400" />
                        </button>
                    </div>
                </div>

                <div>
                    <label for="newPassword" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        New Password
                    </label>
                    <div class="relative">
                        <input id="newPassword" v-model="passwordForm.newPassword"
                            :type="showNewPassword ? 'text' : 'password'" required
                            class="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                            placeholder="Enter your new password" />
                        <button type="button" @click="showNewPassword = !showNewPassword"
                            class="absolute inset-y-0 right-0 pr-3 flex items-center">
                            <Eye v-if="!showNewPassword" class="h-4 w-4 text-gray-400" />
                            <EyeOff v-else class="h-4 w-4 text-gray-400" />
                        </button>
                    </div>

                    <!-- Password Strength Indicator -->
                    <div class="mt-2">
                        <div class="flex space-x-1">
                            <div v-for="i in 4" :key="i" :class="[
                                'h-1 flex-1 rounded-full',
                                i <= passwordStrength ? getStrengthColor(passwordStrength) : 'bg-gray-200 dark:bg-gray-600'
                            ]" />
                        </div>
                        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {{ getStrengthText(passwordStrength) }}
                        </p>
                    </div>
                </div>

                <div>
                    <label for="confirmPassword"
                        class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Confirm New Password
                    </label>
                    <div class="relative">
                        <input id="confirmPassword" v-model="passwordForm.confirmPassword"
                            :type="showConfirmPassword ? 'text' : 'password'" required
                            class="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                            placeholder="Confirm your new password" />
                        <button type="button" @click="showConfirmPassword = !showConfirmPassword"
                            class="absolute inset-y-0 right-0 pr-3 flex items-center">
                            <Eye v-if="!showConfirmPassword" class="h-4 w-4 text-gray-400" />
                            <EyeOff v-else class="h-4 w-4 text-gray-400" />
                        </button>
                    </div>

                    <p v-if="passwordForm.newPassword && passwordForm.confirmPassword && !passwordsMatch"
                        class="text-red-500 text-sm mt-1">
                        Passwords do not match
                    </p>
                </div>

                <div class="pt-4">
                    <button type="submit"
                        :disabled="loading || !passwordsMatch || !passwordForm.currentPassword || !passwordForm.newPassword"
                        class="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                        <span v-if="loading">Updating Password...</span>
                        <span v-else>Update Password</span>
                    </button>
                </div>
            </form>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Eye, EyeOff } from 'lucide-vue-next'
import { useUserStore } from '@/stores/userStore'

const userStore = useUserStore()
const loading = ref(false)

const showCurrentPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)

const passwordForm = ref({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
})

const passwordsMatch = computed(() => {
    return passwordForm.value.newPassword === passwordForm.value.confirmPassword
})

const passwordStrength = computed(() => {
    const password = passwordForm.value.newPassword
    let strength = 0

    if (password.length >= 8) strength++
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++
    if (/\d/.test(password)) strength++
    if (/[^a-zA-Z\d]/.test(password)) strength++

    return strength
})

const getStrengthColor = (strength) => {
    switch (strength) {
        case 1: return 'bg-red-500'
        case 2: return 'bg-yellow-500'
        case 3: return 'bg-blue-500'
        case 4: return 'bg-green-500'
        default: return 'bg-gray-200'
    }
}

const getStrengthText = (strength) => {
    switch (strength) {
        case 1: return 'Weak password'
        case 2: return 'Fair password'
        case 3: return 'Good password'
        case 4: return 'Strong password'
        default: return 'Enter a password'
    }
}

const changePassword = async () => {
    if (!passwordsMatch.value) {
        alert('Passwords do not match')
        return
    }

    loading.value = true
    try {
        await userStore.changePassword({
            currentPassword: passwordForm.value.currentPassword,
            newPassword: passwordForm.value.newPassword
        })

        // Reset form
        passwordForm.value = {
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
        }

        alert('Password updated successfully!')
    } catch (error) {
        alert('Error updating password: ' + error.message)
    } finally {
        loading.value = false
    }
}
</script>
