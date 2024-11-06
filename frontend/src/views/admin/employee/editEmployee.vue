<template>
  <div class="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
    <div class="relative py-3 sm:max-w-xl md:max-w-2xl lg:max-w-4xl xl:max-w-6xl mx-auto">
      <div class="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
        <h2 class="text-2xl font-bold text-center mb-8">Edit Employee</h2>

        <div v-if="generalError" class="text-red-500 text-center mb-4">{{ generalError }}</div>

        <form @submit.prevent="submitEmployeeData">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- General Information Column -->
            <div class="space-y-6">
              <div>
                <label for="firstName" class="block text-sm font-medium text-gray-700">First Name</label>
                <input v-model="employeeForm.firstName" @blur="vGeneral.firstName.$touch()" type="text" id="firstName"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
                <span v-if="vGeneral.firstName.$error" class="text-red-500 text-sm">First name is required</span>
              </div>

              <div>
                <label for="lastName" class="block text-sm font-medium text-gray-700">Last Name</label>
                <input v-model="employeeForm.lastName" @blur="vGeneral.lastName.$touch()" type="text" id="lastName"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
                <span v-if="vGeneral.lastName.$error" class="text-red-500 text-sm">Last name is required</span>
              </div>

              <div>
                <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
                <input v-model="employeeForm.email" @blur="vGeneral.email.$touch()" type="email" id="email"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
                <span v-if="vGeneral.email.$error" class="text-red-500 text-sm">Valid email is required</span>
              </div>

              <div>
                <label for="phone" class="block text-sm font-medium text-gray-700">Phone</label>
                <input v-model="employeeForm.phone" @blur="vGeneral.phone.$touch()" type="tel" id="phone"
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
                    <input v-model="employeeForm.address.street" @blur="vGeneral.address.street.$touch()" type="text"
                      id="street"
                      class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
                    <span v-if="vGeneral.address.street.$error" class="text-red-500 text-sm">Street is required</span>
                  </div>
                  <div>
                    <label for="barangay" class="block text-sm font-medium text-gray-700">Barangay</label>
                    <input v-model="employeeForm.address.barangay" @blur="vGeneral.address.barangay.$touch()"
                      type="text" id="barangay"
                      class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
                    <span v-if="vGeneral.address.barangay.$error" class="text-red-500 text-sm">Barangay is
                      required</span>
                  </div>
                  <div>
                    <label for="municipality" class="block text-sm font-medium text-gray-700">Municipality</label>
                    <input v-model="employeeForm.address.municipality" @blur="vGeneral.address.municipality.$touch()"
                      type="text" id="municipality"
                      class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
                    <span v-if="vGeneral.address.municipality.$error" class="text-red-500 text-sm">Municipality is
                      required</span>
                  </div>
                  <div>
                    <label for="province" class="block text-sm font-medium text-gray-700">Province</label>
                    <input v-model="employeeForm.address.province" @blur="vGeneral.address.province.$touch()"
                      type="text" id="province"
                      class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
                    <span v-if="vGeneral.address.province.$error" class="text-red-500 text-sm">Province is
                      required</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Employee Specifications Column -->
            <div class="space-y-6">
              <div>
                <label for="profileImage" class="block text-sm font-medium text-gray-700">Profile Image</label>
                <div class="mt-2">
                  <img v-if="imagePreview" :src="imagePreview" alt="Current profile image"
                    class="w-32 h-32 object-cover rounded-full mb-2" />
                  <input type="file" id="profileImage" @change="onFileChange" class="mt-1 block w-full" />
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">Role</label>
                <div class="mt-2 space-y-2">
                  <label class="inline-flex items-center">
                    <input type="radio" v-model="employeeForm.role" value="manager" class="form-radio" />
                    <span class="ml-2">Manager</span>
                  </label>
                  <label class="inline-flex items-center">
                    <input type="radio" v-model="employeeForm.role" value="stock_manager" class="form-radio" />
                    <span class="ml-2">Stock Manager</span>
                  </label>
                  <label class="inline-flex items-center">
                    <input type="radio" v-model="employeeForm.role" value="driver" class="form-radio" />
                    <span class="ml-2">Driver</span>
                  </label>
                </div>
                <span v-if="vGeneral.role.$error" class="text-red-500 text-sm">Role is required</span>
              </div>

              <div>
                <label for="salary" class="block text-sm font-medium text-gray-700">Salary</label>
                <input v-model.number="employeeForm.salary" @blur="vGeneral.salary.$touch()" type="number" id="salary"
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
            </div>
          </div>

          <!-- Submit Button with Loading -->
          <div class="mt-8">
            <button type="submit"
              class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              :disabled="loading">
              <span v-if="!loading">Update Employee</span>
              <span v-if="loading" class="flex items-center">
                <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none"
                  viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
                Updating...
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive, watch } from 'vue';
import { useVuelidate } from '@vuelidate/core';
import { required, email, minValue } from '@vuelidate/validators';
import { useEmployeeStore } from '@/stores/employeeStore';
import { useRoute, useRouter } from 'vue-router';
import { getStorage, ref as storageRef, getDownloadURL } from 'firebase/storage';

const employeeStore = useEmployeeStore();
const route = useRoute();
const router = useRouter();

const employeeForm = reactive({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  address: {
    street: '',
    barangay: '',
    municipality: '',
    province: '',
  },
  role: '',
  salary: 0,
  branchName: '',
  profileImageUrl: '',
});

const selectedImage = ref(null);
const branches = ref([]);
const loading = ref(false);
const generalError = ref('');

const rules = {
  firstName: { required },
  lastName: { required },
  email: { required, email },
  phone: { required },
  address: {
    street: { required },
    barangay: { required },
    municipality: { required },
    province: { required },
  },
  role: { required },
  salary: { required, minValue: minValue(1) },
  branchName: { required },
};

const vGeneral = useVuelidate(rules, employeeForm);

const imagePreview = ref('');

const convertToFirebaseUrl = async (cloudStorageUrl) => {
  if (!cloudStorageUrl) return '';
  const storage = getStorage();
  const fileRef = storageRef(storage, cloudStorageUrl);
  try {
    const downloadUrl = await getDownloadURL(fileRef);
    return downloadUrl;
  } catch (error) {
    console.error('Error getting download URL:', error);
    return '';
  }
};

onMounted(async () => {
  const employeeId = route.params.id;
  try {
    const employee = await employeeStore.fetchEmployee(employeeId);
    Object.assign(employeeForm, employee);
    if (employeeForm.profileImageUrl) {
      imagePreview.value = await convertToFirebaseUrl(employeeForm.profileImageUrl);
    }
    branches.value = await employeeStore.fetchActiveBranches();
  } catch (error) {
    console.error('Error fetching employee data:', error);
    generalError.value = 'Failed to load employee data. Please try again.';
  }
});

const onFileChange = (event) => {
  const file = event.target.files[0];
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];

  if (file && !allowedTypes.includes(file.type)) {
    generalError.value = 'File must be a JPEG, JPG, or PNG image';
    selectedImage.value = null;
    imagePreview.value = '';
  } else {
    generalError.value = '';
    selectedImage.value = file;
    imagePreview.value = URL.createObjectURL(file);
  }
};

watch(selectedImage, (newImage) => {
  if (newImage) {
    imagePreview.value = URL.createObjectURL(newImage);
  }
});

const submitEmployeeData = async () => {
  const isValid = await vGeneral.value.$validate();

  if (!isValid) {
    console.log('Form validation failed:', vGeneral.value.$errors);
    generalError.value = 'Please correct the errors before submitting.';
    return;
  }

  loading.value = true;

  try {
    await employeeStore.updateEmployee(route.params.id, employeeForm, selectedImage.value);
    router.push({ name: 'AdminDashboardEmployees' });
  } catch (error) {
    console.error('Error updating employee:', error);
    generalError.value = 'An error occurred while updating. Please try again.';
  } finally {
    loading.value = false;
  }
};
</script>