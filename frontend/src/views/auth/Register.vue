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
import { useAuthStore as useAuthFirebaseStore } from '@stores/authFirebase';
import router from '@router';

const authFirebaseStore = useAuthFirebaseStore();

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
    const formattedStreet = capitalizeWords(street.value);
    const formattedBarangay = capitalizeWords(barangay.value);
    const formattedCity = capitalizeWords(city.value);
    const formattedMunicipality = capitalizeWords(municipality.value);

    const profileData = {
      firstName: firstName.value,
      lastName: lastName.value,
      address: {
        street: formattedStreet,
        barangay: formattedBarangay,
        city: formattedCity,
        municipality: formattedMunicipality,
      },
    };

    await authFirebaseStore.register(email.value, password.value, profileData);

    //make notif - user is successfully registered

    router.push({ name: 'Login' });

  } catch (error) {
    console.error('Registration error:', error);
    generalError.value = 'An error occurred during registration. Please try again.';
  }
};
</script>