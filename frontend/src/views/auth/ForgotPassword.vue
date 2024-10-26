<!-- src/views/user/ForgotPassword.vue -->
<template>
  <div class="authentication">
    <v-container fluid class="pa-3">
      <v-row justify="center" align="center" class="fill-height">
        <v-col cols="12" lg="4" xl="3">
          <AuthForm
            title="Forgot Password"
            subtext="Enter your email to receive a password reset link."
            buttonText="Send Reset Link"
            :submitAction="resetPassword"
            :cancelAction="goBack"
          />
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup>
import AuthForm from '@/components/auth/authForm.vue';
import { useAuthStore } from '@stores/auth';
import router from '@router';

const authStore = useAuthStore();

const resetPassword = async (email) => {
  await authStore.sendPasswordResetEmail(email);
};

const goBack = () => {
  router.back();
};
</script>
