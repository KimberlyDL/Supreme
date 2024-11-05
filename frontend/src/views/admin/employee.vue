<!-- frontend\src\views\admin\employee.vue -->
<template>
    <div class="flex items-center justify-center min-h-screen bg-gray-100">
        <div class="w-full max-w-4xl bg-white rounded-lg shadow-md p-6 space-y-6">
            <h2 class="text-2xl font-bold text-center">Create Employee</h2>

            <div v-if="generalError" class="text-red-500 text-center mb-4">{{ generalError }}</div>

            <form @submit.prevent="submitEmployeeData">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <!-- General Information Column -->
                    <div class="space-y-4">
                        <!-- First Name Field -->
                        <div>
                            <label for="firstName" class="block font-bold">First Name</label>
                            <input v-model="employeeForm.firstName" @blur="vGeneral.firstName.$touch()" type="text"
                                id="firstName" placeholder="First Name" class="form-input w-full" />
                            <span v-if="vGeneral.firstName.$error" class="text-red-500 text-sm">First name is
                                required</span>
                        </div>

                        <!-- Last Name Field -->
                        <div>
                            <label for="lastName" class="block font-bold">Last Name</label>
                            <input v-model="employeeForm.lastName" @blur="vGeneral.lastName.$touch()" type="text"
                                id="lastName" placeholder="Last Name" class="form-input w-full" />
                            <span v-if="vGeneral.lastName.$error" class="text-red-500 text-sm">Last name is
                                required</span>
                        </div>

                        <!-- Email Field -->
                        <div>
                            <label for="email" class="block font-bold">Email</label>
                            <input v-model="employeeForm.email" @blur="vGeneral.email.$touch()" type="email" id="email"
                                placeholder="Email" class="form-input w-full" />
                            <span v-if="vGeneral.email.$error" class="text-red-500 text-sm">Valid email is
                                required</span>
                        </div>

                        <!-- Phone Field -->
                        <div>
                            <label for="phone" class="block font-bold">Phone</label>
                            <input v-model="employeeForm.phone" @blur="vGeneral.phone.$touch()" type="tel" id="phone"
                                placeholder="Phone" class="form-input w-full" />
                            <span v-if="vGeneral.phone.$error" class="text-red-500 text-sm">Phone number is required and
                                must be valid</span>
                        </div>

                        <!-- Address Section -->
                        <div class="space-y-4">
                            <label class="block font-bold">Address</label>

                            <div>
                                <input v-model="employeeForm.street" @blur="vGeneral.street.$touch()" type="text"
                                    placeholder="Street" class="form-input w-full" />
                                <span v-if="vGeneral.street.$error" class="text-red-500 text-sm">Street is
                                    required</span>
                            </div>

                            <div>
                                <input v-model="employeeForm.barangay" @blur="vGeneral.barangay.$touch()" type="text"
                                    placeholder="Barangay" class="form-input w-full" />
                                <span v-if="vGeneral.barangay.$error" class="text-red-500 text-sm">Barangay is
                                    required</span>
                            </div>

                            <div>
                                <input v-model="employeeForm.municipality" @blur="vGeneral.municipality.$touch()"
                                    type="text" placeholder="Municipality" class="form-input w-full" />
                                <span v-if="vGeneral.municipality.$error" class="text-red-500 text-sm">Municipality is
                                    required</span>
                            </div>

                            <div>
                                <input v-model="employeeForm.province" @blur="vGeneral.province.$touch()" type="text"
                                    placeholder="Province" class="form-input w-full" />
                                <span v-if="vGeneral.province.$error" class="text-red-500 text-sm">Province is required</span>
                            </div>
                        </div>
                    </div>

                    <!-- Employee Specifications Column -->
                    <div class="space-y-4">
                        <!-- Profile Image Upload -->
                        <div>
                            <label for="profileImage" class="block font-bold">Profile Image</label>
                            <input type="file" id="profileImage" @change="onFileChange" class="form-input w-full" />
                        </div>

                        <!-- Role Selection -->
                        <div>
                            <label class="block font-bold">Role</label>
                            <div class="space-y-2">
                                <label>
                                    <input type="radio" v-model="employeeForm.role" value="manager" /> Manager
                                </label>
                                <label>
                                    <input type="radio" v-model="employeeForm.role" value="stock_manager" /> Stock
                                    Manager
                                </label>
                                <label>
                                    <input type="radio" v-model="employeeForm.role" value="driver" /> Driver
                                </label>
                            </div>
                            <span v-if="vGeneral.role.$error" class="text-red-500 text-sm">Role is required</span>
                        </div>
                        
                        <!-- Salary Field -->
                        <div>
                            <label for="salary" class="block font-bold">Salary</label>
                            <input v-model="employeeForm.salary" @blur="vGeneral.salary.$touch()" type="number" minlength="1"
                                id="salary" placeholder="Salary" class="form-input w-full" />
                            <span v-if="vGeneral.salary.$error" class="text-red-500 text-sm">Salary is required</span>
                        </div>

                        <!-- Branch Selection (fetched from Firestore) -->
                        <div>
                            <label for="branch" class="block font-bold">Branch</label>
                            <select v-model="employeeForm.branchName" @blur="vGeneral.branchName.$touch()" id="branch"
                                class="form-input w-full">
                                <!-- v-for to loop through branches and display the branch name -->
                                <option v-for="branch in branches" :key="branch.uid" :value="branch.name">
                                    {{ branch.name }}
                                </option>
                            </select>
                            <span v-if="vGeneral.branchName.$error" class="text-red-500 text-sm">Branch is
                                required</span>
                        </div>


                        <!-- Password Fields -->
                        <div>
                            <label for="password" class="block font-bold">Password</label>
                            <input v-model="employeeForm.password" @blur="vGeneral.password.$touch()" type="password"
                                id="password" placeholder="Password" class="form-input w-full" />
                            <span v-if="vGeneral.password.$error" class="text-red-500 text-sm">Minimum of 6
                                characters</span>
                        </div>

                        <div>
                            <label for="confirmPassword" class="block font-bold">Confirm Password</label>
                            <input v-model="employeeForm.confirmPassword" @blur="vGeneral.confirmPassword.$touch()"
                                type="password" id="confirmPassword" placeholder="Confirm Password"
                                class="form-input w-full" />
                            <span v-if="vGeneral.confirmPassword.$error" class="text-red-500 text-sm">Passwords must
                                match</span>
                        </div>
                    </div>
                </div>

                <!-- Submit Button with Loading -->
                <div class="relative mt-6">
                    <button type="submit"
                        class="w-full py-2 px-4 bg-indigo-600 text-white font-bold rounded-lg shadow-md transition-transform transform hover:scale-105 active:scale-95 active:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-300"
                        :disabled="vGeneral.$invalid || loading">
                        <span v-if="!loading">Save Information</span>
                        <span v-if="loading" class="flex justify-center items-center">
                            <svg class="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg"
                                fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                    stroke-width="4"></circle>
                                <path class="opacity-75" fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
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
import axios from 'axios';
import { ref } from 'vue';
import { useVuelidate } from '@vuelidate/core';
import { required, minLength, minValue } from '@vuelidate/validators';
import { useEmployeeStore } from '@/stores/employeeStore';

const apiUrl = import.meta.env.VITE_API_BASE_URL;

// Employee store
const employeeStore = useEmployeeStore();

// Form data
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

// File data for the image
const selectedImage = ref(null);

// File input handler with validation
const onFileChange = (event) => {
    const file = event.target.files[0];
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];

    if (file && !allowedTypes.includes(file.type)) {
        generalError.value = 'File must be a JPEG, JPG, or PNG image';
        selectedImage.value = null; // Reset file selection if invalid
    } else {
        generalError.value = ''; // Clear the error if valid
        selectedImage.value = file;
    }
};

// Validation rules
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

// Vuelidate instance for validation
const vGeneral = useVuelidate(generalRules, employeeForm);

// Fetch branches from Firestore
const branches = ref([]);
const fetchBranches = async () => {
    branches.value = await employeeStore.fetchBranches();
};
fetchBranches();

// Form submission
const loading = ref(false);
const generalError = ref('');
const submitEmployeeData = async () => {
    vGeneral.value.$touch(); // Activate validation

    if (!selectedImage.value) {
        generalError.value = 'Profile image is required.';
        return;
    }

    if (vGeneral.value.$invalid) {
        generalError.value = 'Please correct the errors before submitting.';
        return;
    }

    loading.value = true;

    try {
        // Call store action to handle everything (upload image + create employee)
        await employeeStore.createEmployee(employeeForm.value, selectedImage.value);

    } catch (error) {
        generalError.value = 'An error occurred while saving. Please try again.';
        console.log(error);
    } finally {
        loading.value = false;
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