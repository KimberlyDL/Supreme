<!-- frontend\src\views\Login.vue -->
<template>
    <div class="flex items-center justify-center min-h-screen bg-gray-100">
        <div class="w-full max-w-md bg-white rounded-lg shadow-md p-6 space-y-4">
            <h2 class="text-2xl font-bold text-center">Login</h2>
            <div v-if="generalError" class="text-red-500 text-center mb-4">{{ generalError }}</div>
            <form @submit.prevent="loginUser">
                <div class="mb-4">
                    <input v-model="username" type="text" placeholder="Username" class="form-input w-full" />
                    <span v-if="v$.username.$error || backendErrors.username" class="text-red-500 text-sm">
                        {{ backendErrors.username || 'Username is required' }}
                    </span>
                </div>
                <div class="mb-4">
                    <input v-model="password" type="password" placeholder="Password" class="form-input w-full" />
                    <span v-if="v$.password.$error || backendErrors.password" class="text-red-500 text-sm">
                        {{ backendErrors.password || 'Password is required' }}
                    </span>
                </div>
                <button type="submit" class="w-full btn btn-primary" :disabled="v$.$invalid">Login</button>
            </form>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import useVuelidate from '@vuelidate/core';
import { required } from '@vuelidate/validators';
import { useAuthStore } from '../store/auth';
import router from '../router';

const username = ref('');
const password = ref('');
const authStore = useAuthStore();
const backendErrors = ref({});
const generalError = ref('');

const rules = {
    username: { required },
    password: { required }
};

const v$ = useVuelidate(rules, { username, password });

const loginUser = async () => {
    v$.value.$touch();
    backendErrors.value = {};
    generalError.value = '';

    if (v$.value.$invalid) {
        return;
    }

    try {
        await authStore.login(username.value, password.value);
        
        // make redirection - after successful login
        //router.push('/dashboard'); // Redirect to your desired route

    } catch (error) {
        console.log('Error caught in Login.vue:', error);

        if (error.response) {
            if (error.response.data.errors) {
                error.response.data.errors.forEach(err => {
                    backendErrors.value[err.param] = err.msg;
                });
                return;
            } else if (error.response.status === 400) {
                generalError.value = 'Invalid credentials. Please try again.';
                return;
            } else if (error.response.data.message) {
                generalError.value = error.response.data.message;
                return;
            }
        }
        generalError.value = 'An unexpected error occurred. Please try again.';
    }
};
</script>
