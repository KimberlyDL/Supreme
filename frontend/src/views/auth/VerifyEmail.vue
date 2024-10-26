<!-- src/views/user/VerifyEmail.vue -->
<template>
  <div class="authentication">
    <v-container fluid class="pa-3">
      <v-row justify="center" align="center" class="fill-height">
        <v-col cols="12" lg="4" xl="3">
          <AuthForm
            title="Verify Your Email"
            subtext="We will send a verification link to your email."
            buttonText="Send Verification Email"
            :submitAction="verifyEmail"
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

const verifyEmail = async (email) => {
  await authStore.sendVerificationEmail(email);
};

const goBack = () => {
  router.back();
};
</script>
