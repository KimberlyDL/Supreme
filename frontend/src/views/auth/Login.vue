<!-- frontend/src/views/Login.vue -->
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
  
          <!-- Login button -->
          <button 
            type="submit" 
            class="w-full btn btn-primary" 
            :disabled="v$.$invalid"
          >
            Login
          </button>
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
      email.value = '';
      password.value = '';
  
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
    }
  };
  </script>
  
  <style scoped>
  /* You can customize the styles here */
  </style>
  