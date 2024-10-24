<!-- frontend\src\views\user\Register.vue -->
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
                    <input v-model="city" type="text" placeholder="City" class="form-input w-full" />
                    <span v-if="v$.city.$error || backendErrors.city" class="text-red-500 text-sm">
                        {{ backendErrors.city || 'City is required' }}
                    </span>
                </div>
                <div class="mb-4">
                    <input v-model="municipality" type="text" placeholder="Municipality" class="form-input w-full" />
                    <span v-if="v$.municipality.$error || backendErrors.municipality" class="text-red-500 text-sm">
                        {{ backendErrors.municipality || 'Municipality is required' }}
                    </span>
                </div>
                <button type="submit" class="w-full btn btn-primary" :disabled="v$.$invalid">Register</button>
            </form>
        </div>
    </div>
</template>


<script setup>
import { ref } from 'vue';
import useVuelidate from '@vuelidate/core';
import { required, minLength, email as emailValidator, sameAs } from '@vuelidate/validators';
import { useAuthStore } from '@store/auth';
import router from '@route';

const authStore = useAuthStore();

// Form fields
const email = ref('');
const firstName = ref('');
const lastName = ref('');
const password = ref('');
const confirmPassword = ref('');
const street = ref('');
const barangay = ref('');
const city = ref('');
const municipality = ref('');

const backendErrors = ref({});
const generalError = ref('');

const rules = {
    email: { required, email: emailValidator },
    firstName: { required },
    lastName: { required },
    password: { required, minLength: minLength(6) },
    confirmPassword: { required, sameAsPassword: sameAs(password) },
    street: { required },
    barangay: { required },
    city: { required },
    municipality: { required }
};

const v$ = useVuelidate(rules, { email, firstName, lastName, password, confirmPassword, street, barangay, city, municipality });

const registerUser = async () => {
    v$.value.$touch();
    backendErrors.value = {};
    generalError.value = '';

    if (v$.value.$invalid) {
        return;
    }

    try {
        const success = await authStore.register({
            email: email.value,
            firstName: firstName.value,
            lastName: lastName.value,
            password: password.value,
            confirmPassword: confirmPassword.value,
            street: street.value,
            barangay: barangay.value,
            city: city.value,
            municipality: municipality.value
        });

        email.value = '';
        firstName.value = '';
        lastName.value = '';
        password.value = '';
        confirmPassword.value = '';
        street.value = '';
        barangay.value = '';
        city.value = '';
        municipality.value = '';

        if (success) {
            //make redirection - send to login
            router.push('/login');
        }

    } catch (error) {
        //for begugging
        //console.log('Error data message caught in Register.vue:', error.response.data.message);
        // console.log('Error STATUS caught in Register.vue:', error.response.status);

        console.log('Error (Register.vue):', error);

        if (error.response) {
            if (error.response.data.errors) {
                error.response.data.errors.forEach(err => {
                    backendErrors.value[err.param] = err.msg;
                });
                return;
            } else if (error.response.status === 400) {
                generalError.value = 'There was an error with your registration details. Please try again.';
                return;
            } else if (error.response.data.message) {
                generalError.value = error.response.data.message;
                console.log('General error set from message:', generalError.value);
                return;
            }
        }
        generalError.value = 'An unexpected error occurred. Please try again.';
    }
};
</script>