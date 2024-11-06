<!-- frontend\src\views\admin\branches.vue -->
<template>
  <div class="p-6 bg-gray-100 min-h-screen flex flex-col lg:flex-row gap-6">
    <div class="flex-1">
      <h2 class="text-2xl font-semibold text-gray-700 mb-6">Branch Management</h2>

      <!-- Add Branch Button -->
      <button @click="isModalOpen = true" class="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
        + Add New Branch
      </button>

      <!-- Branch Table -->
      <div class="overflow-x-auto bg-white rounded-sm shadow">
        <table class="min-w-full bg-white">
          <thead class="bg-gray-200 text-gray-600 uppercase text-sm">
            <tr>
              <th class="py-3 px-6 text-left">Branch Name</th>
              <th class="py-3 px-6 text-left">Address</th>
              <th class="py-3 px-6 text-left">Manager</th>
              <th class="py-3 px-6 text-left">Status</th>
              <th class="py-3 px-6 text-center">Actions</th>
            </tr>
          </thead>
          <tbody class="text-gray-700 text-sm">
            <tr
              v-for="branch in branchStore.branches"
              :key="branch.id"
              class="border-b hover:bg-gray-100 cursor-pointer"
              @click="selectBranch(branch)"
            >
              <td class="py-3 px-6">{{ branch.name }}</td>
              <td class="py-3 px-6">
                {{ branch.location.street }}, {{ branch.location.barangay }},
                {{ branch.location.municipality }}, {{ branch.location.province }}
              </td>
              <td class="py-3 px-6">{{ branch.manager || 'N/A' }}</td>
              <td class="py-3 px-6">
                <span
                  :class="{
                    'bg-green-200 text-green-700': branch.isActive,
                    'bg-red-200 text-red-700': !branch.isActive,
                  }"
                  class="px-2 py-1 rounded-full text-xs font-semibold"
                >
                  {{ branch.isActive ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td class="py-3 px-6 text-center">
                <button class="text-blue-500 hover:text-blue-700">Edit</button>
                <button class="text-red-500 hover:text-red-700 ml-4">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Add Branch Modal (unchanged) -->
      <div v-if="isModalOpen" class="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
        <div class="bg-white rounded-lg w-1/3 p-6 relative">
          <button @click="isModalOpen = false" class="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
            &times;
          </button>
          <h3 class="text-lg font-semibold text-gray-700 mb-4">Add New Branch</h3>

          <form @submit.prevent="submitBranch">
            <!-- Form contents remain the same -->
          </form>
        </div>
      </div>
    </div>

    <!-- Sidebar for branch details -->
    <div
      class="lg:w-1/3 bg-white rounded-lg shadow p-6"
      :class="{ 'lg:mt-0 mt-6': selectedBranch }"
      v-if="selectedBranch"
    >
      <h3 class="text-xl font-semibold text-gray-700 mb-4">Branch Details</h3>
      <div class="text-gray-600 mb-4">
        <strong>Branch Name:</strong> {{ selectedBranch.name }}
      </div>
      <div class="text-gray-600 mb-4">
        <strong>Address:</strong>
        {{ selectedBranch.location.street }}, {{ selectedBranch.location.barangay }},
        {{ selectedBranch.location.municipality }}, {{ selectedBranch.location.province }}
      </div>
      <div class="text-gray-600 mb-4">
        <strong>Manager:</strong> {{ selectedBranch.manager || 'N/A' }}
      </div>
      <div class="text-gray-600">
        <strong>Status:</strong>
        <span
          :class="{
            'text-green-700': selectedBranch.isActive,
            'text-red-700': !selectedBranch.isActive,
          }"
        >
          {{ selectedBranch.isActive ? 'Active' : 'Inactive' }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useBranchStore } from '@/stores/branchStore';
import { useAuthStore } from '@/stores/authStore';
import axios from 'axios';

const branchStore = useBranchStore();
const authStore = useAuthStore();
const apiUrl = import.meta.env.VITE_API_BASE_URL;

const isModalOpen = ref(false);

const newBranch = ref({
  name: '',
  location: {
    street: '',
    barangay: '',
    municipality: '',
    province: ''
  },
  isActive: true
});

const submitBranch = async () => {
  try {

    // console.log('Branch data before sending:', newBranch.value);

    // Call branchStore action to add branch to backend
    await branchStore.addBranch({
      name: newBranch.value.name,
      location: newBranch.value.location,
      isActive: newBranch.value.isActive,
    });

    // Reset form and close modal
    resetForm();
    isModalOpen.value = false;
  } catch (error) {
    console.error('Error creating branch:', error);
    alert('Failed to create branch.');
  }
};

const resetForm = () => {
  newBranch.value = {
    name: '',
    location: {
      street: '',
      barangay: '',
      municipality: '',
      province: ''
    },
    isActive: true
  };
};

onMounted(() => {
    branchStore.fetchBranchesRealtime();
});
</script>

<style scoped>
/* Optional styling */
</style>