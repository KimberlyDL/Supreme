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
              class="border-b hover:bg-gray-100"
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
                <button 
                  @click.stop="openEditModal(branch)"
                  class="text-blue-500 hover:text-blue-700 mr-2"
                >
                  Edit
                </button>
                <button 
                  @click.stop="openStatusModal(branch)"
                  :class="{
                    'text-red-500 hover:text-red-700': branch.isActive,
                    'text-green-500 hover:text-green-700': !branch.isActive
                  }"
                >
                  {{ branch.isActive ? 'Deactivate' : 'Activate' }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Add Branch Modal -->
      <div v-if="isModalOpen" class="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
        <div class="bg-white rounded-lg w-1/3 p-6 relative">
          <button @click="isModalOpen = false" class="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
            &times;
          </button>
          <h3 class="text-lg font-semibold text-gray-700 mb-4">Add New Branch</h3>

          <form @submit.prevent="submitBranch">
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">Branch Name</label>
                <input
                  v-model="newBranch.name"
                  type="text"
                  required
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">Street</label>
                <input
                  v-model="newBranch.location.street"
                  type="text"
                  required
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">Barangay</label>
                <input
                  v-model="newBranch.location.barangay"
                  type="text"
                  required
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">Municipality</label>
                <input
                  v-model="newBranch.location.municipality"
                  type="text"
                  required
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">Province</label>
                <input
                  v-model="newBranch.location.province"
                  type="text"
                  required
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div class="flex justify-end gap-4">
                <button
                  type="button"
                  @click="isModalOpen = false"
                  class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  Add Branch
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      <!-- Edit Branch Modal -->
      <div v-if="isEditModalOpen" class="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
        <div class="bg-white rounded-lg w-1/3 p-6 relative">
          <button @click="closeEditModal" class="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
            &times;
          </button>
          <h3 class="text-lg font-semibold text-gray-700 mb-4">Edit Branch</h3>

          <form v-if="editingBranch" @submit.prevent="submitEditBranch">
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">Branch Name</label>
                <input
                  v-model="editingBranch.name"
                  type="text"
                  required
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">Street</label>
                <input
                  v-model="editingBranch.location.street"
                  type="text"
                  required
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">Barangay</label>
                <input
                  v-model="editingBranch.location.barangay"
                  type="text"
                  required
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">Municipality</label>
                <input
                  v-model="editingBranch.location.municipality"
                  type="text"
                  required
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">Province</label>
                <input
                  v-model="editingBranch.location.province"
                  type="text"
                  required
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div class="flex justify-end gap-4">
                <button
                  type="button"
                  @click="closeEditModal"
                  class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  Save Changes
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
            <button
              @click="isStatusModalOpen = false"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              @click="confirmStatusChange"
              class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useBranchStore } from '@/stores/branchStore';
import { useAuthStore } from '@/stores/authStore';

const branchStore = useBranchStore();
const authStore = useAuthStore();

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

// Methods for add branch
const submitBranch = async () => {
  try {
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

// Methods for edit branch
const openEditModal = (branch) => {
  editingBranch.value = JSON.parse(JSON.stringify(branch)); // Deep copy
  isEditModalOpen.value = true;
};

const closeEditModal = () => {
  editingBranch.value = null;
  isEditModalOpen.value = false;
};

const submitEditBranch = async () => {
  try {
    await branchStore.editBranch(editingBranch.value.id, {
      name: editingBranch.value.name,
      location: editingBranch.value.location,
      isActive: editingBranch.value.isActive
    });
    closeEditModal();
  } catch (error) {
    console.error('Error updating branch:', error);
    alert('Failed to update branch.');
  }
};

// Methods for status change
const openStatusModal = (branch) => {
  selectedBranch.value = branch;
  isStatusModalOpen.value = true;
};

const confirmStatusChange = async () => {
  try {
    await branchStore.toggleBranchStatus(
      selectedBranch.value.id,
      selectedBranch.value.isActive
    );
    isStatusModalOpen.value = false;
    selectedBranch.value = null;
  } catch (error) {
    console.error('Error updating branch status:', error);
    alert('Failed to update branch status.');
  }
};

onMounted(() => {
  branchStore.fetchBranchesRealtime();
});
</script>