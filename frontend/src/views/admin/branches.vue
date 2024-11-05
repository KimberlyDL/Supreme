<template>
  <div class="p-6 bg-gray-100 min-h-screen">
    <h2 class="text-2xl font-semibold text-gray-700 mb-6">Branch Management</h2>

    <div class="flex flex-col lg:flex-row gap-6">
      <!-- Main content area -->
      <div class="flex-1">
        <!-- Add Branch Button -->
        <button @click="isModalOpen = true"
          class="mb-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-300 focus:outline-none focus:ring-4 focus:ring-indigo-300">
          + Add New Branch
        </button>

        <!-- Branch Table -->
        <div class="overflow-x-auto bg-white rounded-lg shadow">
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
              <tr v-if="isLoading">
                <td colspan="5" class="py-4 px-6 text-center">
                  <div class="flex justify-center items-center">
                    <svg class="animate-spin h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none"
                      viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z">
                      </path>
                    </svg>
                  </div>
                </td>
              </tr>
              <tr v-else v-for="branch in branchStore.branches" :key="branch.id"
                class="border-b hover:bg-gray-100 cursor-pointer" @click="selectBranch(branch)">
                <td class="py-3 px-6">{{ branch.name }}</td>
                <td class="py-3 px-6">
                  {{ branch.location.street }}, {{ branch.location.barangay }},
                  {{ branch.location.municipality }}, {{ branch.location.province }}
                </td>
                <td class="py-3 px-6">{{ branch.manager || 'N/A' }}</td>
                <td class="py-3 px-6">
                  <span :class="{
                    'bg-green-200 text-green-700': branch.isActive,
                    'bg-red-200 text-red-700': !branch.isActive,
                  }" class="px-2 py-1 rounded-full text-xs font-semibold">
                    {{ branch.isActive ? 'Active' : 'Inactive' }}
                  </span>
                </td>
                <td class="py-3 px-6 text-center">
                  <button @click.stop="openEditModal(branch)"
                    class="text-indigo-600 hover:text-indigo-800 mr-2 transition-colors duration-300">
                    Edit
                  </button>
                  <button @click.stop="openStatusModal(branch)" :class="{
                    'text-red-600 hover:text-red-800': branch.isActive,
                    'text-green-600 hover:text-green-800': !branch.isActive
                  }" class="transition-colors duration-300">
                    {{ branch.isActive ? 'Deactivate' : 'Activate' }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Sidebar for branch details -->
      <div v-if="selectedBranch" class="lg:w-1/3 bg-white rounded-lg shadow p-6 lg:sticky lg:top-6 lg:self-start">
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
          <span :class="{
            'text-green-700': selectedBranch.isActive,
            'text-red-700': !selectedBranch.isActive,
          }">
            {{ selectedBranch.isActive ? 'Active' : 'Inactive' }}
          </span>
        </div>
      </div>
    </div>

    <!-- Add Branch Modal -->
    <div v-if="isModalOpen" class="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
      <div class="bg-white rounded-lg w-full max-w-md p-6 relative">
        <button @click="closeAddModal" class="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
          &times;
        </button>
        <h3 class="text-lg font-semibold text-gray-700 mb-4">Add New Branch</h3>

        <form @submit.prevent="submitBranch">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Branch Name</label>
              <input v-model="newBranch.name" type="text" required
                class="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
              <span v-if="v$.newBranch.name.$error" class="text-red-500 text-sm">
                Branch name is required
              </span>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Address</label>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <input v-model="newBranch.location.street" type="text" placeholder="Street" required
                    class="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                  <span v-if="v$.newBranch.location.street.$error" class="text-red-500 text-sm">
                    Street is required
                  </span>
                </div>
                <div>
                  <input v-model="newBranch.location.barangay" type="text" placeholder="Barangay"
                    class="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                  <span v-if="v$.newBranch.location.barangay.$error" class="text-red-500 text-sm">
                    Barangay is required
                  </span>
                </div>
                <div>
                  <input v-model="newBranch.location.municipality" type="text" placeholder="Municipality" required
                    class="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                  <span v-if="v$.newBranch.location.municipality.$error" class="text-red-500 text-sm">
                    Municipality is required
                  </span>
                </div>
                <div>
                  <input v-model="newBranch.location.province" type="text" placeholder="Province" required
                    class="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                  <span v-if="v$.newBranch.location.province.$error" class="text-red-500 text-sm">
                    Province is required
                  </span>
                </div>
              </div>
            </div>

            <div class="flex justify-end gap-4">
              <button type="button" @click="closeAddModal"
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors duration-300">
                Cancel
              </button>
              <button type="submit" :disabled="isSubmitting"
                class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50 transition-colors duration-300 focus:outline-none focus:ring-4 focus:ring-indigo-300">
                <span v-if="!isSubmitting">Add Branch</span>
                <span v-else class="flex items-center">
                  <svg class="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none"
                    viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                  </svg>
                  Adding...
                </span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>

    <!-- Edit Branch Modal -->
    <div v-if="isEditModalOpen" class="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
      <div class="bg-white rounded-lg w-full max-w-md p-6 relative">
        <button @click="closeEditModal" class="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
          &times;
        </button>
        <h3 class="text-lg font-semibold text-gray-700 mb-4">Edit Branch</h3>

        <form v-if="editingBranch" @submit.prevent="submitEditBranch">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Branch Name</label>
              <input v-model="editingBranch.name" type="text" required
                class="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
              <span v-if="v$.editingBranch.name.$error" class="text-red-500 text-sm">
                Branch name is required
              </span>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Address</label>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <input v-model="editingBranch.location.street" type="text" placeholder="Street" required
                    class="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                  <span v-if="v$.editingBranch.location.street.$error" class="text-red-500 text-sm">
                    Street is required
                  </span>
                </div>
                <div>
                  <input v-model="editingBranch.location.barangay" type="text" placeholder="Barangay" required
                    class="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                  <span v-if="v$.editingBranch.location.barangay.$error" class="text-red-500 text-sm">
                    Barangay is required
                  </span>
                </div>
                <div>
                  <input v-model="editingBranch.location.municipality" type="text" placeholder="Municipality" required
                    class="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                  <span v-if="v$.editingBranch.location.municipality.$error" class="text-red-500  text-sm">
                    Municipality is required
                  </span>
                </div>
                <div>
                  <input v-model="editingBranch.location.province" type="text" placeholder="Province" required
                    class="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                  <span v-if="v$.editingBranch.location.province.$error" class="text-red-500 text-sm">
                    Province is required
                  </span>
                </div>
              </div>
            </div>

            <div class="flex justify-end gap-4">
              <button type="button" @click="closeEditModal"
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors duration-300">
                Cancel
              </button>
              <button type="submit" :disabled="isSubmitting"
                class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50 transition-colors duration-300 focus:outline-none focus:ring-4 focus:ring-indigo-300">
                <span v-if="!isSubmitting">Save Changes</span>
                <span v-else class="flex items-center">
                  <svg class="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none"
                    viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                  </svg>
                  Saving...
                </span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>

    <!-- Status Change Confirmation Modal -->
    <div v-if="isStatusModalOpen" class="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
      <div class="bg-white rounded-lg p-6 max-w-md">
        <h3 class="text-lg font-semibold text-gray-700 mb-4">Confirm Status Change</h3>
        <p class="text-gray-600 mb-6">
          Are you sure you want to {{ selectedBranch?.isActive ? 'deactivate' : 'activate' }} this branch?
        </p>
        <div class="flex justify-end gap-4">
          <button @click="isStatusModalOpen = false"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors duration-300">
            Cancel
          </button>
          <button @click="confirmStatusChange" :disabled="isSubmitting"
            class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50 transition-colors duration-300 focus:outline-none focus:ring-4 focus:ring-indigo-300">
            <span v-if="!isSubmitting">Confirm</span>
            <span v-else class="flex items-center">
              <svg class="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none"
                viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
              </svg>
              Updating...
            </span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useBranchStore } from '@/stores/branchStore';
import { useAuthStore } from '@/stores/authStore';
import useVuelidate from '@vuelidate/core';
import { required } from '@vuelidate/validators';

const branchStore = useBranchStore();
const authStore = useAuthStore();

// Loading and submitting states
const isLoading = ref(true);
const isSubmitting = ref(false);

// Modal states
const isModalOpen = ref(false);
const isEditModalOpen = ref(false);
const isStatusModalOpen = ref(false);

// Form data
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

const editingBranch = ref(null);
const selectedBranch = ref(null);

// Validation rules
const rules = {
  newBranch: {
    name: { required },
    location: {
      street: { required },
      barangay: { required },
      municipality: { required },
      province: { required }
    }
  },
  editingBranch: {
    name: { required },
    location: {
      street: { required },
      barangay: { required },
      municipality: { required },
      province: { required }
    }
  }
};

const v$ = useVuelidate(rules, { newBranch, editingBranch });

// Methods for add branch
const submitBranch = async () => {
  const isValid = await v$.value.newBranch.$validate();
  if (!isValid) return;

  try {
    isSubmitting.value = true;
    await branchStore.addBranch({
      name: newBranch.value.name,
      location: newBranch.value.location,
      isActive: newBranch.value.isActive,
    });
    resetForm();
    isModalOpen.value = false;
  } catch (error) {
    console.error('Error creating branch:', error);
    alert('Failed to create branch.');
  } finally {
    isSubmitting.value = false;
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
  v$.value.newBranch.$reset();
};

const closeAddModal = () => {
  isModalOpen.value = false;
  resetForm();
};

// Methods for edit branch
const openEditModal = (branch) => {
  editingBranch.value = JSON.parse(JSON.stringify(branch)); // Deep copy
  isEditModalOpen.value = true;
  v$.value.editingBranch.$reset();
};

const closeEditModal = () => {
  editingBranch.value = null;
  isEditModalOpen.value = false;
  v$.value.editingBranch.$reset();
};

const submitEditBranch = async () => {
  const isValid = await v$.value.editingBranch.$validate();
  if (!isValid) return;

  try {
    isSubmitting.value = true;
    await branchStore.editBranch(editingBranch.value.id, {
      name: editingBranch.value.name,
      location: editingBranch.value.location,
      isActive: editingBranch.value.isActive
    });
    closeEditModal();
  } catch (error) {
    console.error('Error updating branch:', error);
    alert('Failed to update branch.');
  } finally {
    isSubmitting.value = false;
  }
};

// Methods for status change
const openStatusModal = (branch) => {
  selectedBranch.value = branch;
  isStatusModalOpen.value = true;
};

const confirmStatusChange = async () => {
  try {
    isSubmitting.value = true;
    await branchStore.toggleBranchStatus(
      selectedBranch.value.id,
      !selectedBranch.value.isActive
    );
    isStatusModalOpen.value = false;
    selectedBranch.value = null;
  } catch (error) {
    console.error('Error updating branch status:', error);
    alert('Failed to update branch status.');
  } finally {
    isSubmitting.value = false;
  }
};

// Method to select a branch for sidebar display
const selectBranch = (branch) => {
  selectedBranch.value = branch;
};

onMounted(async () => {
  try {
    isLoading.value = true;
    await branchStore.fetchBranchesRealtime();
  } finally {
    isLoading.value = false;
  }
});
</script>

<style scoped>
@media (max-width: 1023px) {
  .lg\:sticky {
    position: static;
  }
}
</style>
