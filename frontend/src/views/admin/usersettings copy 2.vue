<template>
    <div class="px-4 py-6">
        <h1 class="text-2xl font-semibold text-gray-900 sm:text-3xl dark:text-white">User Settings</h1>

        <div class="grid grid-cols-1 gap-6 mt-6 xl:grid-cols-3">
            <!-- Left column -->
            <div class="xl:col-span-1">
                <!-- Profile Picture -->
                <div
                    class="p-4 bg-white border border-gray-200 rounded-lg shadow-sm dark:border-gray-700 sm:p-6 dark:bg-gray-800">
                    <div class="items-center sm:flex xl:block 2xl:flex sm:space-x-4 xl:space-x-0 2xl:space-x-4">
                        <img class="mb-4 rounded-lg w-28 h-28 sm:mb-0 xl:mb-4 2xl:mb-0" :src="imagePreview"
                            alt="Profile picture">
                        <div>
                            <h3 class="mb-1 text-xl font-bold text-gray-900 dark:text-white">Profile picture</h3>
                            <div class="mb-4 text-sm text-gray-500 dark:text-gray-400">
                                JPG, GIF or PNG. Max size of 800K
                            </div>
                            <div class="flex items-center space-x-4">
                                <input type="file" @change="uploadPicture" class="hidden" ref="pictureInput"
                                    accept="image/*" />
                                <button type="button" @click="selectPicture"
                                    class="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white rounded-lg bg-black hover:bg-gray-800 focus:ring-4 focus:ring-gray-300 dark:bg-black dark:hover:bg-gray-800 dark:focus:ring-gray-800">
                                    Upload picture
                                </button>
                                <button type="button" @click="deletePicture"
                                    class="py-2 px-3 text-sm font-medium text-white focus:outline-none bg-black rounded-lg border border-gray-200 hover:bg-gray-800 hover:text-white focus:z-10 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700">
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Right column -->
            <div class="xl:col-span-2">
                <!-- General Information Form -->
                <div
                    class="p-4 mb-4 bg-white border border-gray-200 rounded-lg shadow-sm dark:border-gray-700 sm:p-6 dark:bg-gray-800">
                    <h3 class="mb-4 text-xl font-semibold dark:text-white">General Information</h3>
                    <form @submit.prevent="submitGeneralInfo">
                        <div class="grid grid-cols-6 gap-6">
                            <!-- Name Fields -->
                            <div class="col-span-6 sm:col-span-3">
                                <label for="first-name"
                                    class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">First
                                    Name</label>
                                <input v-model="form.firstName" type="text" id="first-name"
                                    class="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                    placeholder="Bonnie" required>
                            </div>
                            <div class="col-span-6 sm:col-span-3">
                                <label for="last-name"
                                    class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Last
                                    Name</label>
                                <input v-model="form.lastName" type="text" id="last-name"
                                    class="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                    placeholder="Green" required>
                            </div>
                            <div class="col-span-6 sm:col-span-3">
                                <label for="phone-number"
                                    class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Phone
                                    Number</label>
                                <input v-model="form.phone" type="tel" id="phone-number"
                                    class="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                    placeholder="e.g. +(12)3456 789" required pattern="[0-9]{10}">
                            </div>
                            <div class="col-span-6">
                                <hr class="my-4 border-gray-200 dark:border-gray-700" />
                            </div>

                            <!-- Address Fields -->
                            <div class="col-span-6 sm:col-span-3">
                                <label for="street"
                                    class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Street</label>
                                <input v-model="form.street" type="text" id="street"
                                    class="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                    placeholder="123 Street" required>
                            </div>
                            <div class="col-span-6 sm:col-span-3">
                                <label for="barangay"
                                    class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Barangay</label>
                                <input v-model="form.barangay" type="text" id="barangay"
                                    class="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                    placeholder="Barangay Name" required>
                            </div>
                            <div class="col-span-6 sm:col-span-3">
                                <label for="city"
                                    class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">City</label>
                                <input v-model="form.city" type="text" id="city"
                                    class="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                    placeholder="City Name" required>
                            </div>
                            <div class="col-span-6 sm:col-span-3">
                                <label for="municipality"
                                    class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Municipality</label>
                                <input v-model="form.municipality" type="text" id="municipality"
                                    class="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                    placeholder="Municipality" required>
                            </div>

                            <div class="col-span-6 sm:col-full">
                                <button
                                    class="text-white bg-black hover:bg-gray-800 focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-black dark:hover:bg-gray-800 dark:focus:ring-gray-800"
                                    type="submit">Save General Information</button>
                            </div>
                        </div>
                    </form>
                </div>

                <!-- Password Information Form -->
                <div
                    class="p-4 mb-4 bg-white border border-gray-200 rounded-lg shadow-sm dark:border-gray-700 sm:p-6 dark:bg-gray-800">
                    <h3 class="mb-4 text-xl font-semibold dark:text-white">Password Information</h3>
                    <form @submit.prevent="submitPassword">
                        <div class="grid grid-cols-6 gap-6">
                            <div class="col-span-6 sm:col-span-3">
                                <label for="current-password"
                                    class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Current
                                    password</label>
                                <input v-model="form.currentPassword" type="password" id="current-password"
                                    class="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                    placeholder="••••••••" required>
                            </div>
                            <div class="col-span-6 sm:col-span-3">
                                <label for="new-password"
                                    class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">New
                                    password</label>
                                <input v-model="form.newPassword" type="password" id="new-password"
                                    class="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                    placeholder="••••••••" required>
                            </div>
                            <div class="col-span-6 sm:col-span-3">
                                <label for="confirm-password"
                                    class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Confirm
                                    password</label>
                                <input v-model="form.confirmPassword" type="password" id="confirm-password"
                                    class="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                    placeholder="••••••••" required>
                            </div>
                            <div class="col-span-6 sm:col-full">
                                <button
                                    class="text-white bg-black hover:bg-gray-800 focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-black dark:hover:bg-gray-800 dark:focus:ring-gray-800"
                                    type="submit">Change Password</button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { useVuelidate } from '@vuelidate/core'
import { required, helpers, sameAs } from '@vuelidate/validators'
import { useAuthStore as useAuthFirebaseStore } from '@stores/authStore';
import router from '@router';

// General Information Form
const generalForm = ref({
  firstName: '',
  lastName: '',
  phone: '',
  street: '',
  barangay: '',
  city: '',
  municipality: ''
})

// Validation rules for general information
const generalRules = {
  firstName: { required },
  lastName: { required },
  phone: { 
    required, 
    phone: helpers.regex('phone', /^\d+$/), // Only numbers allowed
    minLength: helpers.withMessage('Phone number must be at least 10 digits', minLength(10)), // Minimum length of 10 digits
    maxLength: helpers.withMessage('Phone number cannot exceed 15 digits', maxLength(15)) // Maximum length of 15 digits
  },
  street: { required },
  barangay: { required },
  city: { required },
  municipality: { required }
}

// Password Form
const passwordForm = ref({
  newPassword: '',
  confirmPassword: ''
})

// Validation rules for password change
const passwordRules = {
  newPassword: { required },
  confirmPassword: { required, sameAsPassword: sameAs(passwordForm.value.newPassword) }
}

// Validation instances
const vGeneral = useVuelidate(generalRules, generalForm)
const vPassword = useVuelidate(passwordRules, passwordForm)

const imagePreview = ref('')

// Submit handler for general information
const submitGeneralInfo = () => {
  vGeneral.value.$touch()

  if (v$.value.$invalid) {
        return;
    }

 else {
    console.error('General information validation failed')
  }
}

// Submit handler for password change
const submitPassword = () => {
  vPassword.value.$touch()
  if (!vPassword.value.$invalid) {
    if (passwordForm.value.newPassword === passwordForm.value.confirmPassword) {
      console.log('Password updated')
    } else {
      console.error('Passwords do not match')
    }
  } else {
    console.error('Password validation failed')
  }
}

</script>