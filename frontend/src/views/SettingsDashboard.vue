<template>
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div class="flex">
            <!-- Sidebar -->
            <aside
                class="w-64 bg-white dark:bg-gray-800 shadow-sm border-r border-gray-200 dark:border-gray-700 min-h-screen">
                <div class="p-6">
                    <h1 class="text-xl font-semibold text-gray-900 dark:text-white">Settings</h1>
                </div>

                <nav class="px-4 pb-4">
                    <ul class="space-y-1">
                        <li>
                            <button @click="activeTab = 'profile'" :class="[
                                'w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                                activeTab === 'profile'
                                    ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300'
                                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                            ]">
                                <User class="inline-block w-4 h-4 mr-3" />
                                Profile
                            </button>
                        </li>

                        <li class="pt-4">
                            <div class="border-t border-gray-200 dark:border-gray-700"></div>
                        </li>

                        <li>
                            <button @click="activeTab = 'accounts'" :class="[
                                'w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                                activeTab === 'accounts'
                                    ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300'
                                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                            ]">
                                <Settings class="inline-block w-4 h-4 mr-3" />
                                Accounts
                            </button>
                        </li>

                        <li>
                            <button @click="activeTab = 'notifications'" :class="[
                                'w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                                activeTab === 'notifications'
                                    ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300'
                                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                            ]">
                                <Bell class="inline-block w-4 h-4 mr-3" />
                                Notifications
                            </button>
                        </li>

                        <li>
                            <button @click="activeTab = 'password'" :class="[
                                'w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                                activeTab === 'password'
                                    ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300'
                                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                            ]">
                                <Lock class="inline-block w-4 h-4 mr-3" />
                                Password
                            </button>
                        </li>
                    </ul>
                </nav>
            </aside>

            <!-- Main Content -->
            <main class="flex-1 p-8">
                <ProfileTab v-if="activeTab === 'profile'" />
                <AccountsTab v-if="activeTab === 'accounts'" />
                <NotificationsTab v-if="activeTab === 'notifications'" />
                <PasswordTab v-if="activeTab === 'password'" />
            </main>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { User, Settings, Bell, Lock } from 'lucide-vue-next'
import ProfileTab from '@/components/settings/ProfileTab.vue'
import AccountsTab from '@/components/settings/AccountsTab.vue'
import NotificationsTab from '@/components/settings/NotificationsTab.vue'
import PasswordTab from '@/components/settings/PasswordTab.vue'

const activeTab = ref('profile')
</script>
