<template>
    <div class="flex items-center justify-center min-h-screen bg-gray-100">
        <div class="w-full max-w-md bg-white rounded-lg shadow-md p-6 space-y-4">
            <h2 class="text-2xl font-bold text-center">Register</h2>
            <div v-if="generalError" class="text-red-500 text-center mb-4">{{ generalError }}</div>
            <form @submit.prevent="registerUser">
                <div class="mb-4">
                    <input v-model="email" type="email" placeholder="Email" class="form-input w-full" />
                    <span v-if="v$.email.$error || backendErrors.email" class="text-red-500 text-sm">
                        {{ backendErrors.email || 'Invalid email' }}
                    </span>
                </div>
                <div class="mb-4">
                    <input v-model="password" type="password" placeholder="Password" class="form-input w-full" />
                    <span v-if="v$.password.$error || backendErrors.password" class="text-red-500 text-sm">
                        {{ backendErrors.password || 'Password must be at least 6 characters' }}
                    </span>
                </div>
                <div class="mb-4">
                    <input v-model="confirmPassword" type="password" placeholder="Confirm Password"
                        class="form-input w-full" />
                    <span v-if="v$.confirmPassword.$error || backendErrors.confirmPassword"
                        class="text-red-500 text-sm">
                        {{ backendErrors.confirmPassword || 'Passwords must match' }}
                        <!-- v$.confirmPassword.$errors[0].$message -->
                    </span>
                </div>

                <!-- Register button with click and loading effect -->
                <div class="relative">
                    <button type="submit"
                        class="w-full py-2 px-4 bg-indigo-600 text-white font-bold rounded-lg shadow-md transition-transform transform hover:scale-105 active:scale-95 active:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-300"
                        :disabled="loading">
                        <span v-if="!loading">Register</span>
                        <span v-if="loading" class="flex justify-center items-center">
                            <svg class="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg"
                                fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                    stroke-width="4"></circle>
                                <path class="opacity-75" fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                            </svg>
                            Loading...
                        </span>
                    </button>
                </div>

                <!-- Sign up link -->
                <div class="text-center mt-4">
                    <span class="text-sm text-gray-600">Already have an account?</span>
                    <RouterLink :to="{ name: 'Login' }"
                        class="text-sm text-indigo-600 hover:underline font-medium ml-2">
                        Log in
                    </RouterLink>
                </div>
            </form>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { useVuelidate } from '@vuelidate/core';
import { required, minLength, email as emailValidator, sameAs } from '@vuelidate/validators';
import { useAuthStore } from '@stores/authStore';
import router from '@router';
import { updatePassword } from 'firebase/auth';

const authStore = useAuthStore();

const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const generalError = ref('');
const backendErrors = ref({
    email: null,
    password: null,
    confirmPassword: null,
});
const loading = ref(false);

const rules = {
    email: { required, email: emailValidator },
    password: { required, minLength: minLength(6) },
    confirmPassword: { required, sameAsPassword: sameAs(password) },
};



const v$ = useVuelidate(rules, { email, password, confirmPassword });

const registerUser = async () => {
    v$.value.$touch();
    backendErrors.value = {};
    generalError.value = '';

    if (v$.value.$invalid) {
        return;
    }

    loading.value = true; 


    try {
        const response = await authStore.register(email.value, password.value);

        // make notif - user is successfully registered

        loading.value = false;
        router.push({ name: 'Login' });

    } catch (error) {
        if (error.message === 'EmailAlreadyInUse') {
            backendErrors.value.email = 'The email address is already in use';
        } else {
            generalError.value = 'An error occurred during registration. Please try again.';
        }
    } finally {
        loading.value = false;
    }
};
</script>

<style scoped>
/* Add any additional styles here */
</style>
