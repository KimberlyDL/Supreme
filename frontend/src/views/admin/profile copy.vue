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
            <img class="mb-4 rounded-lg w-28 h-28 sm:mb-0 xl:mb-4 2xl:mb-0" src="@assets/images/Kim1by1id.jpg"
              alt="Profile picture">
            <div>
              <h3 class="mb-1 text-xl font-bold text-gray-900 dark:text-white">Profile picture</h3>
              <div class="mb-4 text-sm text-gray-500 dark:text-gray-400">
                JPG, GIF or PNG. Max size of 800K
              </div>
              <div class="flex items-center space-x-4">
                <input type="file" @change="uploadPicture" class="hidden" ref="pictureInput" />
                <button type="button" @click="selectPicture"
                  class="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white rounded-lg bg-black hover:bg-gray-800 focus:ring-4 focus:ring-gray-300 dark:bg-black dark:hover:bg-gray-800 dark:focus:ring-gray-800">
                  <svg class="w-4 h-4 mr-2 -ml-1" fill="currentColor" viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M5.5 13a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 13H11V9.413l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13H5.5z">
                    </path>
                    <path d="M9 13h2v5a1 1 0 11-2 0v-5z"></path>
                  </svg>
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

        <!-- Language & Time -->
        <div
          class="p-4 mt-6 bg-white border border-gray-200 rounded-lg shadow-sm dark:border-gray-700 sm:p-6 dark:bg-gray-800">
          <h3 class="mb-4 text-xl font-semibold dark:text-white">Language & Time</h3>
          <div class="mb-4">
            <label for="settings-language" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Select
              language</label>
            <select id="settings-language" v-model="form.language"
              class="bg-gray-50 border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500">
              <option>English (US)</option>
              <option>Italiano</option>
              <option>Français (France)</option>
              <option>正體字</option>
              <option>Español (España)</option>
              <option>Deutsch</option>
              <option>Português (Brasil)</option>
            </select>
          </div>
          <div class="mb-6">
            <label for="settings-timezone" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Time
              Zone</label>
            <select id="settings-timezone" v-model="form.timezone"
              class="bg-gray-50 border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500">
              <option>GMT+0 Greenwich Mean Time (GMT)</option>
              <option>GMT+1 Central European Time (CET)</option>
              <option>GMT+2 Eastern European Time (EET)</option>
              <option>GMT+3 Moscow Time (MSK)</option>
              <option>GMT+5 Pakistan Standard Time (PKT)</option>
              <option>GMT+8 China Standard Time (CST)</option>
              <option>GMT+10 Eastern Australia Standard Time (AEST)</option>
            </select>
          </div>
          <div>
            <button @click="submitForm"
              class="text-white bg-black hover:bg-gray-800 focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-black dark:hover:bg-gray-800 dark:focus:ring-gray-800">Save
              all</button>
          </div>
        </div>
      </div>

      <!-- Right column -->
      <div class="xl:col-span-2">
        <!-- General Information -->
        <div
          class="p-4 mb-4 bg-white border border-gray-200 rounded-lg shadow-sm dark:border-gray-700 sm:p-6 dark:bg-gray-800">
          <h3 class="mb-4 text-xl font-semibold dark:text-white">General information</h3>
          <form @submit.prevent="submitForm">
            <div class="grid grid-cols-6 gap-6">
              <div class="col-span-6 sm:col-span-3">
                <label for="first-name" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">First
                  Name</label>
                <input v-model="form.firstName" type="text" id="first-name"
                  class="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                  placeholder="Bonnie" required>
              </div>
              <div class="col-span-6 sm:col-span-3">
                <label for="last-name" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Last
                  Name</label>
                <input v-model="form.lastName" type="text" id="last-name"
                  class="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                  placeholder="Green" required>
              </div>
              <div class="col-span-6 sm:col-span-3">
                <label for="email" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Email</label>
                <input v-model="form.email" type="email" id="email"
                  class="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                  placeholder="example@company.com" required>
              </div>
              <div class="col-span-6 sm:col-span-3">
                <label for="phone-number" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Phone
                  Number</label>
                <input v-model="form.phone" type="tel" id="phone-number"
                  class="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                  placeholder="e.g. 1234567890" required @input="validatePhoneNumber">
              </div>
              <div class="col-span-6 sm:col-span-3">
                <label for="birthday"
                  class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Birthday</label>
                <input v-model="form.birthday" type="date" id="birthday"
                  class="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                  required>
              </div>
              <div class="col-span-6 sm:col-span-3">
                <label for="organization"
                  class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Organization</label>
                <input v-model="form.organization" type="text" id="organization"
                  class="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                  placeholder="Company Name" required>
              </div>
              <div class="col-span-6 sm:col-full">
                <button
                  class="text-white bg-black hover:bg-gray-800 focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-black dark:hover:bg-gray-800 dark:focus:ring-gray-800"
                  type="submit">Save all</button>
              </div>
            </div>
          </form>
        </div>

        <!-- Password Information -->
        <div
          class="p-4 mb-4 bg-white border border-gray-200 rounded-lg shadow-sm dark:border-gray-700 sm:p-6 dark:bg-gray-800">
          <h3 class="mb-4 text-xl font-semibold dark:text-white">Password information</h3>
          <form @submit.prevent="submitPassword">
            <div class="grid grid-cols-6 gap-6">
              <div class="col-span-6 sm:col-span-3">
                <label for="current-password"
                  class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Current password</label>
                <input v-model="form.currentPassword" type="password" id="current-password"
                  class="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                  placeholder="••••••••" required>
              </div>
              <div class="col-span-6 sm:col-span-3">
                <label for="new-password" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">New
                  password</label>
                <input v-model="form.newPassword" type="password" id="new-password"
                  class="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                  placeholder="••••••••" required>
              </div>
              <div class="col-span-6 sm:col-span-3">
                <label for="confirm-password"
                  class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Confirm password</label>
                <input v-model="form.confirmPassword" type="password" id="confirm-password"
                  class="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                  placeholder="••••••••" required>
              </div>
              <div class="col-span-6 sm:col-full">
                <button
                  class="text-white bg-black hover:bg-gray-800 focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-black dark:hover:bg-gray-800 dark:focus:ring-gray-800"
                  type="submit">Change password</button>
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

const form = ref({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  birthday: '',
  organization: '',
  language: 'English (US)',
  timezone: 'GMT+0 Greenwich Mean Time (GMT)',
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})



const submitForm = () => {
  // Handle form submission
  console.log('Form submitted:', form.value)
}

const submitPassword = () => {
  if (form.value.newPassword === form.value.confirmPassword) {
    // Handle password update
    console.log('Password updated')
  } else {
    console.error('Passwords do not match')
  }
}

const selectPicture = () => {
  document.querySelector('input[type="file"]').click()
}

const uploadPicture = (event) => {
  const file = event.target.files[0]
  if (file) {
    console.log('File uploaded:', file)
  }
}

const deletePicture = () => {
  console.log('Picture deleted')
}
</script>