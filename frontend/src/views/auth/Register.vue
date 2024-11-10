<template>
    <div class="flex items-center justify-center min-h-screen bg-gray-100">
        <div class="w-full max-w-md bg-white rounded-lg shadow-md p-6 space-y-4">
            <h2 class="text-2xl font-bold text-center">Register</h2>
            <div v-if="generalError" class="text-red-500 text-center mb-4">{{ generalError }}</div>
            <form @submit.prevent="registerUser">
                <!-- Other form fields (email, firstName, lastName, etc.) go here -->

                <div class="mb-4">
                    <input v-model="email" type="email" placeholder="Email" class="form-input w-full" />
                    <span v-if="v$.email.$error || backendErrors.email" class="text-red-500 text-sm">
                        {{ backendErrors.email || 'Invalid email' }}
                    </span>
                </div>
                <div class="mb-4">
                    <input v-model="firstName" type="text" placeholder="First Name" class="form-input w-full" />
                    <span v-if="v$.firstName.$error || backendErrors.firstName" class="text-red-500 text-sm">
                        {{ backendErrors.firstName || 'First name is required' }}
                    </span>
                </div>
                <div class="mb-4">
                    <input v-model="lastName" type="text" placeholder="Last Name" class="form-input w-full" />
                    <span v-if="v$.lastName.$error || backendErrors.lastName" class="text-red-500 text-sm">
                        {{ backendErrors.lastName || 'Last name is required' }}
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
                    </span>
                </div>
                <div class="mb-4">
                    <input v-model="street" type="text" placeholder="Street" class="form-input w-full" />
                    <span v-if="v$.street.$error || backendErrors.street" class="text-red-500 text-sm">
                        {{ backendErrors.street || 'Street is required' }}
                    </span>
                </div>
                <div class="mb-4">
                    <input v-model="barangay" type="text" placeholder="Barangay" class="form-input w-full" />
                    <span v-if="v$.barangay.$error || backendErrors.barangay" class="text-red-500 text-sm">
                        {{ backendErrors.barangay || 'Barangay is required' }}
                    </span>
                </div>
                <div class="mb-4">
                    <input v-model="municipality" type="text" placeholder="Municipality" class="form-input w-full" />
                    <span v-if="v$.municipality.$error || backendErrors.municipality" class="text-red-500 text-sm">
                        {{ backendErrors.municipality || 'Municipality is required' }}
                    </span>
                </div>
                <div class="mb-4">
                    <input v-model="province" type="text" placeholder="Province" class="form-input w-full" />
                    <span v-if="v$.province.$error || backendErrors.province" class="text-red-500 text-sm">
                        {{ backendErrors.province || 'Province is required' }}
                    </span>
                </div>

                <!-- Register button with click and loading effect -->
                <div class="relative">
                    <button type="submit"
                        class="w-full py-2 px-4 bg-indigo-600 text-white font-bold rounded-lg shadow-md transition-transform transform hover:scale-105 active:scale-95 active:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-300"
                        :disabled="v$.$invalid || loading">
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
import useVuelidate from '@vuelidate/core';
import { required, minLength, email as emailValidator, sameAs } from '@vuelidate/validators';
import { useAuthStore as useAuthFirebaseStore } from '@stores/authStore';
import router from '@router';

const authFirebaseStore = useAuthFirebaseStore();

const email = ref('');
const firstName = ref('');
const lastName = ref('');
const password = ref('');
const confirmPassword = ref('');

const street = ref('');
const barangay = ref('');
const province = ref('');
const municipality = ref('');

const backendErrors = ref({});
const generalError = ref('');
const loading = ref(false); // Add loading state

const capitalizeWords = (string) => {
    return string.replace(/\b\w/g, (char) => char.toUpperCase());
};

const rules = {
    email: { required, email: emailValidator },
    firstName: { required },
    lastName: { required },
    password: { required, minLength: minLength(6) },
    confirmPassword: { required, sameAsPassword: sameAs(password) },
    street: { required },
    barangay: { required },
    municipality: { required },
    province: { required }
};

const v$ = useVuelidate(rules, { email, firstName, lastName, password, confirmPassword, street, barangay, municipality, province });

const registerUser = async () => {
    v$.value.$touch();
    backendErrors.value = {};
    generalError.value = '';

    if (v$.value.$invalid) {
        return;
    }

    loading.value = true; // Set loading state to true when the form is submitted

    try {
        const formattedStreet = capitalizeWords(street.value);
        const formattedBarangay = capitalizeWords(barangay.value);
        const formattedProvince = capitalizeWords(province.value);
        const formattedMunicipality = capitalizeWords(municipality.value);

        const profileData = {
            firstName: firstName.value,
            lastName: lastName.value,
            address: {
                street: formattedStreet,
                barangay: formattedBarangay,
                municipality: formattedMunicipality,
                province: formattedProvince
            },
        };

        await authFirebaseStore.register(email.value, password.value, profileData);

        // make notif - user is successfully registered

        router.push({ name: 'Login' });
    } catch (error) {
        console.error('Registration error:', error);
        if (error.code === 'auth/email-already-in-use') {
            generalError.value = 'The email address is already in use. Please use a different email.';
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
