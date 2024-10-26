<!-- src/components/AuthForm.vue -->
<template>
  <v-card rounded="md" elevation="10" class="mx-auto px-4 py-6">
    <v-card-title class="d-flex justify-center py-4">
      <Logo />
    </v-card-title>
    <v-card-subtitle class="text-center text-muted mb-1">{{ title }}</v-card-subtitle>

    <!-- Optional subtext -->
    <p v-if="subtext" class="text-center text-muted mb-3">{{ subtext }}</p>

    <v-alert v-if="generalError" type="error" class="mb-4" dense outlined>{{ generalError }}</v-alert>

    <v-form @submit.prevent="handleSubmit" ref="form" :disabled="v$.$invalid" v-slot="{ submitForm }">
      <v-text-field
        v-model="email"
        label="Email"
        type="email"
        :error-messages="backendErrors.email || (v$.email.$error ? ['Invalid email'] : [])"
        outlined
        dense
        class="mb-4"
        required
      />
      <v-btn type="submit" color="primary" block @click="submitForm">{{ buttonText }}</v-btn>

      <!-- Optional Cancel Button -->
      <v-btn v-if="cancelAction" color="secondary" block @click="cancelAction" class="mt-2">
        Cancel
      </v-btn>
    </v-form>
  </v-card>
</template>

<script setup>
import { ref } from 'vue';
import useVuelidate from '@vuelidate/core';
import { required, email as emailValidator } from '@vuelidate/validators';

const props = defineProps({
  title: {
    type: String,
    default: 'Enter Your Email',
  },
  subtext: {
    type: String,
    default: '',
  },
  buttonText: {
    type: String,
    default: 'Submit',
  },
  submitAction: {
    type: Function,
    required: true,
  },
  cancelAction: {
    type: Function,
    default: null,
  }
});

const email = ref('');
const backendErrors = ref({});
const generalError = ref('');

const rules = {
  email: { required, email: emailValidator }
};

const v$ = useVuelidate(rules, { email });

const handleSubmit = async () => {
  v$.value.$touch();
  backendErrors.value = {};
  generalError.value = '';

  if (v$.value.$invalid) return;

  try {
    await props.submitAction(email.value);
    email.value = '';
  } catch (error) {
    console.log('Error (AuthForm.vue):', error);

    if (error.response) {
      if (error.response.data.errors) {
        error.response.data.errors.forEach(err => {
          backendErrors.value[err.param] = err.msg;
        });
      } else if (error.response.data.message) {
        generalError.value = error.response.data.message;
      } else {
        generalError.value = 'An error occurred. Please try again.';
      }
    } else {
      generalError.value = 'An unexpected error occurred. Please try again.';
    }
  }
};
</script>

<style scoped>
.mx-auto {
  max-width: 400px;
}
</style>
