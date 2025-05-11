<template>
  <div class="flex items-center justify-center min-h-screen bg-gray-100">
    <div class="w-full max-w-md bg-white rounded-lg shadow-md p-6 space-y-4">
      <h2 class="text-2xl font-bold text-center">Employee Registration</h2>
      <div v-if="generalError" class="text-red-500 text-center mb-4">{{ generalError }}</div>
      <form @submit.prevent="registerUser" class="space-y-4">
        <div>
          <input v-model="email" type="email" placeholder="Email" class="w-full px-3 py-2 border rounded-md" />
          <span v-if="v$.email.$error" class="text-red-500 text-sm">
            {{ v$.email.$errors[0].$message }}
          </span>
        </div>
        <div>
          <input v-model="password" type="password" placeholder="Password" class="w-full px-3 py-2 border rounded-md" />
          <span v-if="v$.password.$error" class="text-red-500 text-sm">
            {{ v$.password.$errors[0].$message }}
          </span>
        </div>
        <div>
          <input v-model="confirmPassword" type="password" placeholder="Confirm Password"
            class="w-full px-3 py-2 border rounded-md" />
          <span v-if="v$.confirmPassword.$error" class="text-red-500 text-sm">
            {{ v$.confirmPassword.$errors[0].$message }}
          </span>
        </div>
        <div>
          <select v-model="role" class="w-full px-3 py-2 border rounded-md">
            <option value="">Select Role</option>
            <option value="assistant manager">Assistant Manager</option>
            <option value="helper">Helper</option>
          </select>
          <span v-if="v$.role.$error" class="text-red-500 text-sm">
            {{ v$.role.$errors[0].$message }}
          </span>
        </div>
        <div>
          <select v-model="branch" class="w-full px-3 py-2 border rounded-md">
            <option value="">Select Branch</option>
            <option v-for="branch in branches" :key="branch" :value="branch">
              {{ toPascalCase(branch) }}
            </option>
          </select>
          <span v-if="v$.branch.$error" class="text-red-500 text-sm">
            {{ v$.branch.$errors[0].$message }}
          </span>
        </div>
        <button type="submit"
          class="w-full py-2 px-4 bg-indigo-600 text-white font-bold rounded-lg shadow-md transition-transform transform hover:scale-105 active:scale-95 active:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-300"
          :disabled="loading">
          <span v-if="!loading">Register</span>
          <span v-else class="flex justify-center items-center">
            <svg class="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none"
              viewBox="0 0 24 24" stroke="currentColor">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
            </svg>
            Loading...
          </span>
        </button>
      </form>
      <div class="text-center mt-4">
        <span class="text-sm text-gray-600">Already have an account?</span>
        <router-link :to="{ name: 'Login' }" class="text-sm text-indigo-600 hover:underline font-medium ml-2">
          Log in
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useVuelidate } from '@vuelidate/core';
import { required, email as emailValidator, minLength, sameAs } from '@vuelidate/validators';
import { useAuthStore } from '@/stores/authStore';
import { useBranchStore } from '@/stores/branchStore';

const router = useRouter();
const authStore = useAuthStore();
const branchStore = useBranchStore();

const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const role = ref('');
const branch = ref('');
const generalError = ref('');
const loading = ref(false);
//const branches = ref([]);

const branches = computed(() => branchStore.fetchedBranchNames);

const rules = {
  email: { required, email: emailValidator },
  password: { required, minLength: minLength(6) },
  confirmPassword: { required, sameAsPassword: sameAs(password) },
  role: { required },
  branch: { required }
};

const v$ = useVuelidate(rules, { email, password, confirmPassword, role, branch });


onMounted(async () => {
  try {
    branchStore.fetchBranchNamesRealtime();

    // branches.value = [...await branchStore.getExistingStoreBranches()];
    console.log(branches.value);
    
  } catch (error) {
    console.error('Error fetching branches:', error);
    generalError.value = 'Failed to fetch branches. Please try again.';
  }
});

const toPascalCase = (text) => {
  return text
    .toLowerCase()
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

const registerUser = async () => {
  v$.value.$touch();
  if (v$.value.$invalid) return;

  loading.value = true;
  generalError.value = '';

  try {
    await authStore.registerEmp({
      email: email.value,
      password: password.value,
      role: role.value,
      branch: branch.value
    });
    router.push({ name: 'Login' });
  } catch (error) {
    if (error.message === 'EmailAlreadyInUse') {
      generalError.value = 'The email address is already in use';
    } else {
      generalError.value = 'An error occurred during registration. Please try again.';
    }
  } finally {
    loading.value = false;
  }
};

onUnmounted(() => {
  branchStore.stopListening();
});
</script>