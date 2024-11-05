<template>
  <div class="flex items-center justify-center min-h-screen bg-gray-100">
    <div class="w-full max-w-md bg-white rounded-lg shadow-md p-6 space-y-4">
      <h2 class="text-2xl font-bold text-center">Create Employee</h2>

      <div v-if="generalError" class="text-red-500 text-center mb-4">{{ generalError }}</div>

      <form @submit.prevent="submitGeneralInfo">

        <!-- //create General imformation text for indicator and design -->

        <!-- //create upload form for image here -->

        <!-- //create email input field -->

        <!-- First Name Field -->
        <div class="mb-4">
          <input v-model="generalForm.firstName" type="text" placeholder="First Name" class="form-input w-full" />
          <span v-if="vGeneral.firstName.$error" class="text-red-500 text-sm">First name is required</span>
        </div>

        <!-- Last Name Field -->
        <div class="mb-4">
          <input v-model="generalForm.lastName" type="text" placeholder="Last Name" class="form-input w-full" />
          <span v-if="vGeneral.lastName.$error" class="text-red-500 text-sm">Last name is required</span>
        </div>

        <!-- Phone Field -->
        <div class="mb-4">
          <input v-model="generalForm.phone" type="tel" placeholder="Phone" class="form-input w-full" />
          <span v-if="vGeneral.phone.$error" class="text-red-500 text-sm">Phone number is required and must be
            valid</span>
        </div>

        <!-- make the address in a group for indicator and design -->

        <!-- Street Field -->
        <div class="mb-4">
          <input v-model="generalForm.street" type="text" placeholder="Street" class="form-input w-full" />
          <span v-if="vGeneral.street.$error" class="text-red-500 text-sm">Street is required</span>
        </div>

        <!-- Barangay Field -->
        <div class="mb-4">
          <input v-model="generalForm.barangay" type="text" placeholder="Barangay" class="form-input w-full" />
          <span v-if="vGeneral.barangay.$error" class="text-red-500 text-sm">Barangay is required</span>
        </div>

        <!-- Municipality Field -->
        <div class="mb-4">
          <input v-model="generalForm.municipality" type="text" placeholder="Municipality" class="form-input w-full" />
          <span v-if="vGeneral.municipality.$error" class="text-red-500 text-sm">Municipality is required</span>
        </div>

        <!-- Province Field -->
        <div class="mb-4">
          <input v-model="generalForm.province" type="text" placeholder="Province" class="form-input w-full" />
          <span v-if="vGeneral.province.$error" class="text-red-500 text-sm">Province is required</span>
        </div>

        <!-- group these too (salary, position, branch), an create an appropriate label for this -->
        <!-- salary -->

        <!-- create a radio button here, to choose which type of user -->
        <!-- manager -->
        <!-- stock manager -->
        <!-- driver -->


        <!-- create a dropdown here to choose which branch the user will be saved to, the branch will be fetch from the firestore, you should create a method for it too -->


        <!-- create password -->
        <!-- create confirmPassword -->



        <!-- Submit Button with Loading -->
        <div class="relative">
          <button type="submit"
            class="w-full py-2 px-4 bg-indigo-600 text-white font-bold rounded-lg shadow-md transition-transform transform hover:scale-105 active:scale-95 active:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-300"
            :disabled="vGeneral.$invalid || loading">
            <span v-if="!loading">Save Information</span>
            <span v-if="loading" class="flex justify-center items-center">
              <svg class="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none"
                viewBox="0 0 24 24" stroke="currentColor">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
              </svg>
              Saving...
            </span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useVuelidate } from '@vuelidate/core';
import { required, helpers, minLength, maxLength } from '@vuelidate/validators';
import { useAuthStore as useAuthFirebaseStore } from '@stores/authStore';

// update this, include the new data given

const authFirebaseStore = useAuthFirebaseStore();
const generalForm = ref({
  firstName: '',
  lastName: '',
  phone: '',
  street: '',
  barangay: '',
  municipality: '',
  province: '',
});

const loading = ref(false);
const generalError = ref('');

// Validation rules for general information
const generalRules = {
  firstName: { required },
  lastName: { required },
  phone: {
    required,
    phone: helpers.regex('phone', /^\d+$/), // Only numbers allowed
    minLength: helpers.withMessage('Phone number must be at least 10 digits', minLength(10)),
    maxLength: helpers.withMessage('Phone number cannot exceed 15 digits', maxLength(15))
  },
  street: { required },
  barangay: { required },
  province: { required },
  municipality: { required }
};

// Vuelidate instance for validation
const vGeneral = useVuelidate(generalRules, generalForm);

// Submit handler for general information
const submitGeneralInfo = async () => {
  vGeneral.value.$touch(); // Activate validation

  if (vGeneral.value.$invalid) {
    generalError.value = 'Please correct the errors before submitting.';
    return;
  }

  loading.value = true; // Set loading state to true when submitting


  try {
    await authFirebaseStore.editUser({
      firstName: generalForm.value.firstName,
      lastName: generalForm.value.lastName,
      phone: generalForm.value.phone,
      street: generalForm.value.street,
      barangay: generalForm.value.barangay,
      province: generalForm.value.province,
      municipality: generalForm.value.municipality
    });

    // Handle successful save, e.g., show a notification or redirect

  } catch (error) {
    generalError.value = 'An error occurred while saving. Please try again.';
  } finally {
    loading.value = false; // Set loading to false when done
  }
};
</script>

<style scoped>
.form-input {
  border: 1px solid #e2e8f0;
  padding: 8px 12px;
  border-radius: 4px;
  width: 100%;
}

.form-input:focus {
  outline: none;
  border-color: #a0aec0;
}
</style>