<!-- frontend\src\views\auth\Login.vue -->
<template>
  <NotificationModal ref="notificationModal" :title="modalTitle" :message="modalMessage" :theme="modalTheme" />

  <div class="flex items-center justify-center min-h-screen bg-gray-100">
    <div class="w-full max-w-md bg-white rounded-lg shadow-md p-6 space-y-4">
      <h2 class="text-2xl font-bold text-center">Login</h2>

      <!-- Display error message -->
      <div v-if="generalError" class="text-red-500 text-center mb-4">{{ generalError }}</div>

      <!-- Form -->
      <form @submit.prevent="loginUser">
        <!-- Email input -->
        <div class="mb-4">
          <input v-model="email" type="email" placeholder="Email" class="form-input w-full" />
          <span v-if="backendErrors.email || v$.email.$error" class="text-red-500 text-sm">
            {{ backendErrors.email || 'Email is required' }}
          </span>
        </div>

        <!-- Password input -->
        <div class="mb-4">
          <input v-model="password" type="password" placeholder="Password" class="form-input w-full" />
          <span v-if="backendErrors.password || v$.password.$error" class="text-red-500 text-sm">
            {{ backendErrors.password || 'Password is required' }}
          </span>
          <!-- Forgot Password link -->
          <div class="text-right">
            <button type="button" @click="showForgotPasswordModal" class="text-sm text-indigo-600 hover:underline mt-2">
              Forgot Password?
            </button>
          </div>
        </div>

        <!-- Login button with loading spinner -->
        <div class="relative">
          <button type="submit"
            class="w-full py-2 px-4 bg-indigo-600 text-white font-bold rounded-lg shadow-md transition-transform transform hover:scale-105 active:scale-95 active:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-300"
            :disabled="v$.$invalid || loading">
            <span v-if="!loading">Login</span>
            <span v-if="loading" class="flex justify-center items-center">
              <svg class="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none"
                viewBox="0 0 24 24" stroke="currentColor">
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
        <RouterLink :to="{ name: 'Register' }" class="text-sm text-indigo-600 hover:underline font-medium ml-2">
          Sign Up
        </RouterLink>
      </div>
    </div>
  </div>

  <!-- Forgot Password Modal -->
  <ModalComponent ref="forgotPasswordModal" title="Forgot Password">
    <template #content>
      <p class="text-gray-700">Please enter your email to receive password reset instructions.</p>
      <input type="email" v-model="forgotPasswordEmail" placeholder="Enter your email" class="form-input w-full mt-3" />
    </template>
    <template #actions>
      <button @click="submitForgotPassword" class="px-4 py-2 bg-indigo-600 text-white rounded-md">Send Email</button>
    </template>
  </ModalComponent>

</template>

<script setup>
import { ref } from 'vue';
import useVuelidate from '@vuelidate/core';
import { required } from '@vuelidate/validators';
import { useAuthStore } from '@/stores/authStore';
import router from '@router';
import NotificationModal from "@components/utils/notification/NotifModal.vue";
import ModalComponent from "@/components/Modal.vue";

const authStore = useAuthStore();

const email = ref('');
const password = ref('');

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
      modalTitle.value = 'Email Verification Required';
      modalMessage.value = 'An email has been sent to your registered address. Please verify your email to complete the login process.';
      modalTheme.value = 'normal';
      showEmailVerificationModal();
      //generalError.value = 'Please verify your email. A verification email has been sent to your email address.';
    } else {
      modalTitle.value = 'Invalid Login';
      modalMessage.value = 'Please check your credentials and try again.';
      modalTheme.value = 'danger';
      showEmailVerificationModal();
      //generalError.value = 'Invalid login. Please check your credentials and try again.';
    }
  } finally {
    loading.value = false; // Set loading to false after login is complete or failed
  }
};


// Forgot Password Modal
// Reference for forgot password modal
const modalTitle = ref(''); // Define title for NotificationModal
const modalMessage = ref(''); // Define message for NotificationModal
const modalTheme = ref(''); // Define theme for NotificationModal

const notificationModal = ref(null); // Reference for NotificationModal

// Function to show the NotificationModal
const showEmailVerificationModal = () => {
  notificationModal.value.openModal();
};






const forgotPasswordModal = ref(null);

// Forgot Password email input
const forgotPasswordEmail = ref('');

// Show Forgot Password modal
const showForgotPasswordModal = () => {
  forgotPasswordModal.value.openModal();
};

// Submit Forgot Password
const submitForgotPassword = async () => {
  try {
    // Send password reset email
    await authStore.forgotPassword(forgotPasswordEmail.value);
    modalTitle.value = 'Password Reset Sent';
    modalMessage.value = 'A password reset link has been sent to your email address.';
    modalTheme.value = 'success';

    // Close the modal after submitting
    forgotPasswordModal.value.closeModal();

    setTimeout(() => {
      showEmailVerificationModal();
    }, 300);

  } catch (error) {
    // Handle errors
    console.error("Error sending password reset email:", error);
    modalTitle.value = 'Error';
    if (error.message.includes('Send email for password verification failed')) {
      modalMessage.value = 'No account found with this email address.';
    } else {
      modalMessage.value = 'An error occurred while sending the reset email. Please try again later.';
    }
    modalTheme.value = 'danger';

    // Close the modal after submitting
    forgotPasswordModal.value.closeModal();

    setTimeout(() => {
      showEmailVerificationModal();
    }, 300);
  }
};


</script>

<style scoped></style>