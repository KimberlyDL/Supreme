<!-- frontend\src\layouts\full\vertical-header\ProfileDD.vue -->
<script setup>
import { UserIcon, MailIcon, ListCheckIcon } from 'vue-tabler-icons';
import { useAuthStore } from '@/stores/authFirebase'; // Import the Pinia store
import { useRouter } from 'vue-router'; // For redirecting after logout

const authStore = useAuthStore(); // Access the auth store
const router = useRouter(); // Access the router

// Handle the logout action
const handleLogout = async () => {
  try {
    await authStore.logout(); // Call the logout method from the store
    router.push({ name: 'Login' }); // Redirect to login page after logout
  } catch (error) {
    console.error('Logout error:', error);
  }
};
</script>

<template>
    <!-- ---------------------------------------------- -->
    <!-- notifications DD -->
    <!-- ---------------------------------------------- -->
    <v-menu :close-on-content-click="false">
        <template v-slot:activator="{ props }">
            <v-btn class="profileBtn custom-hover-primary" variant="text" v-bind="props" icon>
                <v-avatar size="35">
                    <img src="@/assets/images/profile/user-1.jpg" height="35" alt="user" />
                </v-avatar>
            </v-btn>
        </template>
        <v-sheet rounded="md" width="200" elevation="10" class="mt-2">
            <v-list class="py-0" lines="one" density="compact">
                <v-list-item value="item1" color="primary" >
                    <template v-slot:prepend>
                        <UserIcon stroke-width="1.5" size="20"/>
                    </template>
                    <v-list-item-title class="pl-4 text-body-1">My Profile</v-list-item-title>
                </v-list-item>
                <v-list-item value="item2" color="primary">
                    <template v-slot:prepend>
                        <MailIcon stroke-width="1.5" size="20"/>
                    </template>
                    <v-list-item-title class="pl-4 text-body-1">My Account</v-list-item-title>
                </v-list-item>
                <v-list-item value="item3" color="primary">
                    <template v-slot:prepend>
                        <ListCheckIcon stroke-width="1.5"  size="20"/>
                    </template>
                    <v-list-item-title class="pl-4 text-body-1">My Task</v-list-item-title>
                </v-list-item>
            </v-list>
            <div class="pt-4 pb-4 px-5 text-center">
                <v-btn @click="handleLogout" color="primary" variant="outlined" block>Logout</v-btn>
            </div>
        </v-sheet>
    </v-menu>
</template>
