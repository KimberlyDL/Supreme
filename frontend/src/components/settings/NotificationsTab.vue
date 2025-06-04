<!-- frontend\src\components\settings\NotificationsTab.vue -->
<template>
    <div class="max-w-4xl">
        <div class="mb-8">
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Notification Settings</h2>
            <p class="text-gray-600 dark:text-gray-400 mt-1">Manage how you receive notifications and updates.</p>
        </div>

        <div class="space-y-8">
            <!-- Email Notifications -->
            <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-6">Email Notifications</h3>

                <div class="space-y-6">
                    <NotificationToggle v-model="notificationSettings.emailNotifications" title="Email Notifications"
                        description="Receive email notifications for important updates and activities"
                        @update:modelValue="updateNotificationSetting('emailNotifications', $event)" />

                    <NotificationSetting title="Project Updates"
                        description="Get notified when there are updates to your projects or when someone comments on your work"
                        :enabled="notificationSettings.projectUpdates"
                        @toggle="updateNotificationSetting('projectUpdates', $event)" />

                    <NotificationSetting title="Account Security"
                        description="Important security notifications about your account, login attempts, and password changes"
                        :enabled="notificationSettings.securityAlerts"
                        @toggle="updateNotificationSetting('securityAlerts', $event)" />

                    <NotificationSetting title="Marketing Communications"
                        description="Promotional emails, newsletters, and updates about new features and services"
                        :enabled="notificationSettings.marketing"
                        @toggle="updateNotificationSetting('marketing', $event)" />
                </div>
            </div>

            <!-- Push Notifications -->
            <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-6">Push Notifications</h3>

                <div class="space-y-6">
                    <NotificationToggle v-model="notificationSettings.pushNotifications" title="Browser Notifications"
                        description="Receive push notifications in your browser for real-time updates"
                        @update:modelValue="updateNotificationSetting('pushNotifications', $event)" />

                    <NotificationSetting title="Instant Messages"
                        description="Get notified immediately when you receive direct messages or mentions"
                        :enabled="notificationSettings.instantMessages"
                        @toggle="updateNotificationSetting('instantMessages', $event)" />

                    <NotificationSetting title="Activity Reminders"
                        description="Periodic reminders about pending tasks, deadlines, and important activities"
                        :enabled="notificationSettings.activityReminders"
                        @toggle="updateNotificationSetting('activityReminders', $event)" />
                </div>
            </div>

            <!-- Save Button -->
            <div class="flex justify-end">
                <button @click="saveNotificationSettings" :disabled="loading"
                    class="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                    <span v-if="loading">Saving...</span>
                    <span v-else>Save Notification Settings</span>
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/stores/userStore'
import NotificationToggle from './NotificationToggle.vue'
import NotificationSetting from './NotificationSetting.vue'

const userStore = useUserStore()
const loading = ref(false)

const notificationSettings = ref({
    emailNotifications: true,
    pushNotifications: false,
    projectUpdates: true,
    securityAlerts: true,
    marketing: false,
    instantMessages: true,
    activityReminders: false
})

const updateNotificationSetting = (key, value) => {
    notificationSettings.value[key] = value
}

const saveNotificationSettings = async () => {
    loading.value = true
    try {
        await userStore.updateNotificationSettings(notificationSettings.value)
        alert('Notification settings saved successfully!')
    } catch (error) {
        alert('Error saving notification settings: ' + error.message)
    } finally {
        loading.value = false
    }
}

const userProfile = ref(null);

onMounted(async () => {
    await fetchUserProfile();
});

const fetchUserProfile = async () => {
    await userStore.fetchUserProfile();
    userProfile.value = userStore.user;

    if (userProfile.value?.notifications) {
        Object.assign(notificationSettings.value, userProfile.value.notifications);
    }
};
</script>
