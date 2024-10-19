<!-- Register.vue -->
<template>
    <div class="flex items-center justify-center min-h-screen bg-gray-100">
        <div class="w-full max-w-md bg-white rounded-lg shadow-md p-6 space-y-4">
            <h2 class="text-2xl font-bold text-center">Register</h2>
            <form @submit.prevent="registerUser">
                <div class="mb-4">
                    <input v-model="username" type="text" placeholder="Username" class="form-input w-full" />
                </div>
                <div class="mb-4">
                    <input v-model="password" type="password" placeholder="Password" class="form-input w-full" />
                </div>
                <button type="submit" class="w-full btn btn-primary">Register</button>
            </form>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '../../store/auth';

const username = ref('');
const password = ref('');
const authStore = useAuthStore();

const registerUser = () => {
    authStore.register(username.value, password.value);
};
</script>
