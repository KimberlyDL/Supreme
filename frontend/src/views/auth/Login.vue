<template>
    <div class="flex items-center justify-center min-h-screen bg-gray-100">
      <div class="w-full max-w-md bg-white rounded-lg shadow-md p-6 space-y-4">
        <h2 class="text-2xl font-bold text-center">Login</h2>
        
        <!-- Display error message -->
        <div v-if="generalError" class="text-red-500 text-center mb-4">{{ generalError }}</div>
        
        <!-- Form -->
        <form @submit.prevent="loginUser">
          <!-- Email input -->
          <div class="mb-4">
            <input 
              v-model="email" 
              type="email" 
              placeholder="Email" 
              class="form-input w-full" 
            />
            <span v-if="backendErrors.email || v$.email.$error" class="text-red-500 text-sm">
              {{ backendErrors.email || 'Email is required' }}
            </span>
          </div>
  
          <!-- Password input -->
          <div class="mb-4">
            <input 
              v-model="password" 
              type="password" 
              placeholder="Password" 
              class="form-input w-full" 
            />
            <span v-if="backendErrors.password || v$.password.$error" class="text-red-500 text-sm">
              {{ backendErrors.password || 'Password is required' }}
            </span>
          </div>
  
          <!-- Login button with loading spinner -->
          <div class="relative">
            <button 
              type="submit" 
              class="w-full py-2 px-4 bg-indigo-600 text-white font-bold rounded-lg shadow-md transition-transform transform hover:scale-105 active:scale-95 active:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-300"
              :disabled="v$.$invalid || loading"
            >
              <span v-if="!loading">Login</span>
              <span v-if="loading" class="flex justify-center items-center">
                <svg class="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
                Logging in...
              </span>
            </button>
          </div>
        </form>
  
        <!-- Sign up link -->
        <div class="text-center">
          <span class="text-sm text-gray-600">Don't have an account?</span>
          <RouterLink
            :to="{ name: 'Register' }"
            class="text-sm text-indigo-600 hover:underline font-medium ml-2"
          >
            Sign Up
          </RouterLink>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  import useVuelidate from '@vuelidate/core';
  import { required } from '@vuelidate/validators';
  import { useAuthStore } from '@/stores/authFirebase';
  import router from '@router';
  
  const email = ref('');
  const password = ref('');
  const authStore = useAuthStore();
  const backendErrors = ref({});
  const generalError = ref('');
  const loading = ref(false); // Add loading state
  
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
  
    loading.value = true; // Set loading state to true when the form is submitted
  
    try {
      await authStore.login(email.value, password.value);
      email.value = '';
      password.value = '';
  
      // Redirect based on user role
      if (authStore.user.role && authStore.user.role !== 'customer') {
        router.push({ name: 'AdminDashboard' });
      } else {
        router.push({ name: 'Home' });
      }
    } catch (error) {
      console.log('Firebase login error:', error);
      if (error.message.includes('Unverified')) {
        generalError.value = 'Please verify your email. A verification email has been sent to your email address.';
      } else {
        generalError.value = 'Invalid login. Please check your credentials and try again.';
      }
    } finally {
      loading.value = false; // Set loading to false after login is complete or failed
    }
  };
  </script>
  
  <style scoped>
  /* You can customize the styles here */
  </style>
  