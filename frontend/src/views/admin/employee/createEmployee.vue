<template>
  <div class="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
    <div class="relative py-3 sm:max-w-xl md:max-w-2xl lg:max-w-4xl xl:max-w-6xl mx-auto">
      <div class="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
        <h2 class="text-2xl font-bold text-center mb-8">Create Employee</h2>

        <div v-if="generalError" class="text-red-500 text-center mb-4">{{ generalError }}</div>

        <form @submit.prevent="submitEmployeeData">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- General Information Column -->
            <div class="space-y-6">
              <div>
                <label for="firstName" class="block text-sm font-medium text-gray-700">First Name</label>
                <input v-model="employeeForm.firstName" @blur="vGeneral.firstName.$touch()" type="text" id="firstName"
                  placeholder="First Name"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
                <span v-if="vGeneral.firstName.$error" class="text-red-500 text-sm">First name is required</span>
              </div>

              <div>
                <label for="lastName" class="block text-sm font-medium text-gray-700">Last Name</label>
                <input v-model="employeeForm.lastName" @blur="vGeneral.lastName.$touch()" type="text" id="lastName"
                  placeholder="Last Name"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
                <span v-if="vGeneral.lastName.$error" class="text-red-500 text-sm">Last name is required</span>
              </div>

              <div>
                <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
                <input v-model="employeeForm.email" @blur="vGeneral.email.$touch()" type="email" id="email"
                  placeholder="Email"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
                <span v-if="vGeneral.email.$error" class="text-red-500 text-sm">Valid email is required</span>
              </div>

              <div>
                <label for="phone" class="block text-sm font-medium text-gray-700">Phone</label>
                <input v-model="employeeForm.phone" @blur="vGeneral.phone.$touch()" type="tel" id="phone"
                  placeholder="Phone"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
                <span v-if="vGeneral.phone.$error" class="text-red-500 text-sm">Phone number is required and must be
                  valid</span>
              </div>

              <!-- Address Section -->
              <div class="space-y-4 border border-gray-200 rounded-md p-4">
                <h3 class="font-medium text-gray-900">Address</h3>
                <div class="grid grid-cols-1 gap-4">
                  <div>
                    <label for="street" class="block text-sm font-medium text-gray-700">Street</label>
                    <input v-model="employeeForm.street" @blur="vGeneral.street.$touch()" type="text" id="street"
                      placeholder="Street"
                      class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
                    <span v-if="vGeneral.street.$error" class="text-red-500 text-sm">Street is required</span>
                  </div>
                  <div>
                    <label for="barangay" class="block text-sm font-medium text-gray-700">Barangay</label>
                    <input v-model="employeeForm.barangay" @blur="vGeneral.barangay.$touch()" type="text" id="barangay"
                      placeholder="Barangay"
                      class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
                    <span v-if="vGeneral.barangay.$error" class="text-red-500 text-sm">Barangay is required</span>
                  </div>
                  <div>
                    <label for="municipality" class="block text-sm font-medium text-gray-700">Municipality</label>
                    <input v-model="employeeForm.municipality" @blur="vGeneral.municipality.$touch()" type="text"
                      id="municipality" placeholder="Municipality"
                      class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
                    <span v-if="vGeneral.municipality.$error" class="text-red-500 text-sm">Municipality is
                      required</span>
                  </div>
                  <div>
                    <label for="province" class="block text-sm font-medium text-gray-700">Province</label>
                    <input v-model="employeeForm.province" @blur="vGeneral.province.$touch()" type="text" id="province"
                      placeholder="Province"
                      class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
                    <span v-if="vGeneral.province.$error" class="text-red-500 text-sm">Province is required</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Employee Specifications Column -->
            <div class="space-y-6">
              <div>
                <label for="profileImage" class="block text-sm font-medium text-gray-700">Profile Image</label>
                <input type="file" id="profileImage" @change="onFileChange" class="mt-1 block w-full" />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">Role</label>
                <div class="mt-2 space-y-2">
                  <label v-for="role in availableRoles" :key="role.value" class="inline-flex items-center">
                    <input type="radio" v-model="employeeForm.role" :value="role.value" class="form-radio" />
                    <span class="ml-2">{{ role.label }}</span>
                  </label>
                </div>
                <span v-if="vGeneral.role.$error" class="text-red-500 text-sm">Role is required</span>
              </div>

              <div>
                <label for="salary" class="block text-sm font-medium text-gray-700">Salary</label>
                <input v-model="employeeForm.salary" @blur="vGeneral.salary.$touch()" type="number" id="salary"
                  placeholder="Salary"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
                <span v-if="vGeneral.salary.$error" class="text-red-500 text-sm">Salary is required</span>
              </div>

              <div>
                <label for="branch" class="block text-sm font-medium text-gray-700">Branch</label>
                <select v-model="employeeForm.branchName" @blur="vGeneral.branchName.$touch()" id="branch"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                  <option v-for="branch in branches" :key="branch.uid" :value="branch.name">
                    {{ branch.name }}
                  </option>
                </select>
                <span v-if="vGeneral.branchName.$error" class="text-red-500 text-sm">Branch is required</span>
              </div>

              <!-- Password Fields -->
              <div class="space-y-4 border border-gray-200 rounded-md p-4">
                <h3 class="font-medium text-gray-900">Password</h3>
                <div>
                  <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
                  <input v-model="employeeForm.password" @blur="vGeneral.password.$touch()" type="password"
                    id="password" placeholder="Password"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
                  <span v-if="vGeneral.password.$error" class="text-red-500 text-sm">Minimum of 6 characters</span>
                </div>
                <div>
                  <label for="confirmPassword" class="block text-sm font-medium text-gray-700">Confirm Password</label>
                  <input v-model="employeeForm.confirmPassword" @blur="vGeneral.confirmPassword.$touch()"
                    type="password" id="confirmPassword" placeholder="Confirm Password"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
                  <span v-if="vGeneral.confirmPassword.$error" class="text-red-500 text-sm">Passwords must match</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Submit Button with Loading -->
          <div class="mt-8">
            <button type="submit"
              class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              :disabled="vGeneral.$invalid || loading">
              <span v-if="!loading">Save Information</span>
              <span v-if="loading" class="flex items-center">
                <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none"
                  viewBox="0 0 24 24">
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useVuelidate } from '@vuelidate/core';
import { required, minLength, minValue } from '@vuelidate/validators';
import { useEmployeeStore } from '@/stores/employeeStore';
import { useAuthStore } from '@/stores/authStore';

const employeeStore = useEmployeeStore();
const authStore = useAuthStore();

const employeeForm = ref({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  street: '',
  barangay: '',
  municipality: '',
  province: '',
  role: '',
  salary: '',
  branchName: '',
  password: '',
  confirmPassword: '',
});

const availableRoles = computed(() => {
  const roles = [
    { value: 'stock_manager', label: 'Stock Manager' },
    { value: 'cashier', label: 'Cashier' },
    { value: 'driver', label: 'Driver' },
  ];

  if (authStore.user.role === 'owner') {
    roles.unshift({ value: 'manager', label: 'Manager' });
  }

  return roles;
});

const selectedImage = ref(null);

const onFileChange = (event) => {
  const file = event.target.files[0];
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];

  if (file && !allowedTypes.includes(file.type)) {
    generalError.value = 'File must be a JPEG, JPG, or PNG image';
    selectedImage.value = null;
  } else {
    generalError.value = '';
    selectedImage.value = file;
  }
};

const generalRules = {
  firstName: { required },
  lastName: { required },
  email: { required },
  phone: { required },
  street: { required },
  barangay: { required },
  municipality: { required },
  province: { required },
  role: { required },
  salary: { required, minValue: minValue(1) },
  branchName: { required },
  password: { required, minLength: minLength(6) },
  confirmPassword: {
    required,
    minLength: minLength(6),
    sameAsPassword: (value) => value === employeeForm.value.password,
  },
};

const vGeneral = useVuelidate(generalRules, employeeForm);

const branches = ref([]);
const fetchBranches = async () => {
  branches.value = await employeeStore.fetchBranches();
};

onMounted(fetchBranches);

const loading = ref(false);
const generalError = ref('');



const submitEmployeeData = async () => {
  vGeneral.value.$touch();

  if (!selectedImage.value) {
    generalError.value = 'Profile image is required.';
    return;
  }

  if (vGeneral.value.$invalid) {
    generalError.value = 'Please correct the errors before submitting.';
    return;
  }

  if (authStore.user.role !== 'owner' && employeeForm.value.role === 'manager') {
    generalError.value = 'You are not authorized to create a manager employee.';
    return;
  }

  loading.value = true;

  try {
    const formData = new FormData();
    
    // Append employee data
    Object.keys(employeeForm.value).forEach(key => {
      formData.append(key, employeeForm.value[key]);
    });
    
    // Append profile image
    formData.append('profileImage', selectedImage.value);

    await employeeStore.createEmployeeWithImage(formData);
    // Handle success (e.g., show success message, redirect)
  } catch (error) {
    generalError.value = 'An error occurred while saving. Please try again.';
    console.error(error);
  } finally {
    loading.value = false;
  }
};
</script>