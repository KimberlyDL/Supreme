<!-- frontend/src/views/Login.vue -->
<template>
  <div class="authentication">
    <v-container fluid class="pa-3">
      <v-row justify="center" align="center" class="fill-height">
        <v-col cols="12" lg="4" xl="3">
          <v-card rounded="md" elevation="10" class="mx-auto px-4 py-6">
            <v-card-title class="d-flex justify-center py-4">
              <Logo />
            </v-card-title>
            <v-card-subtitle class="text-center text-muted mb-3">Login to Your Account</v-card-subtitle>

            <v-alert v-if="generalError" type="error" class="mb-4" dense outlined>{{ generalError }}</v-alert>

            <v-form @submit.prevent="loginUser" ref="form" v-slot="{ submitForm }">
              <v-text-field v-model="email" label="Email"
                :error-messages="backendErrors.email || (v$.email.$error ? ['Email is required'] : [])"
                outlined dense class="mb-4" required />
              <v-text-field v-model="password" label="Password" type="password"
                :error-messages="backendErrors.password || (v$.password.$error ? ['Password is required'] : [])"
                outlined dense class="mb-4" required />
              <v-btn type="submit" color="primary" :disabled="v$.$invalid"  block @click="submitForm">Login</v-btn>
            </v-form>

            <div class="d-flex justify-center align-center mt-3">
              <span class="text-muted">Don't have an Account?</span>
              <RouterLink :to="{ name: 'Register' }" class="text-primary font-weight-medium pl-2">
                Sign Up
              </RouterLink>
            </div>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import Logo from '@/layouts/full/logo/Logo.vue';
import useVuelidate from '@vuelidate/core';
import { required } from '@vuelidate/validators';
import { useAuthStore } from '@/stores/authFirebase'; // Import the Firebase store
import router from '@router';

const email = ref('');
const password = ref('');
const authStore = useAuthStore();
const backendErrors = ref({});
const generalError = ref('');

const rules = {
  email: { required },
  password: { required }
};

const v$ = useVuelidate(rules, { email, password });

const loginUser = async () => {
  v$.value.$touch();

  backendErrors.value = {};
  generalError.value = '';

  if (v$.value.$invalid) {
    return;
  }

  try {
    await authStore.login(email.value, password.value);

    // If login successful, reset the input fields
    email.value = '';
    password.value = '';

    // make notif - logs in
    router.push({ name: 'Home' });

  } catch (error) {
    // make log
    console.log('Firebase login error:', error);

    //make notif
    if (error.message.includes('Unverified')) {
      generalError.value = 'Please verify your email. A verification email has been sent to your email address.';
    } else {
      generalError.value = 'Invalid login. Please check your credentials and try again.';
    }
  }
};
</script>
