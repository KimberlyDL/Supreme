<!-- frontend/src/views/user/Register.vue -->
<template>
  <div class="authentication">
    <div class="authentication">
      <v-container fluid class="pa-3">
        <v-row justify="center" align="center" class="fill-height">
          <v-col cols="12" lg="4" xl="3">
            <v-card rounded="md" elevation="10" class="mx-auto px-4 py-6">
              <v-card-title class="d-flex justify-center py-4">
                <Logo />
              </v-card-title>
              <v-card-subtitle class="text-center text-muted mb-3">Create An Account</v-card-subtitle>
              <v-alert v-if="generalError" type="error" class="mb-4" dense outlined>{{ generalError }}</v-alert>

              <!-- Vuetify Form Wrapper -->
              <v-form @submit.prevent="registerUser" ref="form" v-slot="{ submitForm }">
                <v-text-field v-model="email" label="Email" type="email"
                  :error-messages="backendErrors.email || (v$.email.$error ? ['Invalid email'] : [])" outlined dense
                  class="mb-4" required />
                <v-text-field v-model="firstName" label="First Name"
                  :error-messages="backendErrors.firstName || (v$.firstName.$error ? ['First name is required'] : [])"
                  outlined dense class="mb-4" required />
                <v-text-field v-model="lastName" label="Last Name"
                  :error-messages="backendErrors.lastName || (v$.lastName.$error ? ['Last name is required'] : [])"
                  outlined dense class="mb-4" required />
                <v-text-field v-model="password" label="Password" type="password"
                  :error-messages="backendErrors.password || (v$.password.$error ? ['Password must be at least 6 characters'] : [])"
                  outlined dense class="mb-4" required />
                <v-text-field v-model="confirmPassword" label="Confirm Password" type="password"
                  :error-messages="backendErrors.confirmPassword || (v$.confirmPassword.$error ? ['Passwords must match'] : [])"
                  outlined dense class="mb-4" required />
                <v-text-field v-model="street" label="Street"
                  :error-messages="backendErrors.street || (v$.street.$error ? ['Street is required'] : [])" outlined
                  dense class="mb-4" required />
                <v-text-field v-model="barangay" label="Barangay"
                  :error-messages="backendErrors.barangay || (v$.barangay.$error ? ['Barangay is required'] : [])"
                  outlined dense class="mb-4" required />
                <v-text-field v-model="city" label="City"
                  :error-messages="backendErrors.city || (v$.city.$error ? ['City is required'] : [])" outlined dense
                  class="mb-4" required />
                <v-text-field v-model="municipality" label="Municipality"
                  :error-messages="backendErrors.municipality || (v$.municipality.$error ? ['Municipality is required'] : [])"
                  outlined dense class="mb-4" required />
                <v-btn type="submit" color="primary" :disabled="v$.$invalid" block @click="submitForm">Register</v-btn>
              </v-form>

              <div class="d-flex justify-center align-center mt-3">
                <span class="text-muted">Already have an Account?</span>
                <RouterLink :to="{ name: 'Login' }" class="text-primary font-weight-medium pl-2">
                  Sign In
                </RouterLink>
              </div>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import Logo from '@/layouts/full/logo/Logo.vue';
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
