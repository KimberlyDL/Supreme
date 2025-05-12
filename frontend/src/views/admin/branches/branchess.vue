<template>
  <div class="p-6 bg-bgPrimary-0 min-h-screen">
    <h2 class="text-2xl font-semibold text-tBase-100 mb-6">Branch Management</h2>

    <!-- Branch Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-medium text-tBase-100 mb-2">Total Branches</h3>
        <p class="text-3xl font-bold text-tBase-100">{{ branches.length }}</p>
      </div>
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-medium text-tBase-100 mb-2">Active Branches</h3>
        <p class="text-3xl font-bold text-primary-500">
          {{ branches.filter(b => b.isActive).length }}
        </p>
      </div>
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-medium text-tBase-100 mb-2">Inactive Branches</h3>
        <p class="text-3xl font-bold text-red-500">
          {{ branches.filter(b => !b.isActive).length }}
        </p>
      </div>
    </div>

    <div class="flex flex-col lg:flex-row gap-6">
      <!-- Main content area -->
      <div class="flex-1">
        <!-- Action Buttons -->
        <div class="flex justify-between mb-4">
          <button 
            v-if="isOwner" 
            @click="openAddBranchModal" 
            class="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors duration-300 focus:outline-none focus:ring-4 focus:ring-primary-300 flex items-center"
          >
            <PlusIcon class="w-5 h-5 mr-2" />
            Add New Branch
          </button>
          <div class="flex gap-2">
            <input 
              v-model="searchQuery" 
              type="text" 
              placeholder="Search branches..." 
              class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        <!-- Branch Table -->
        <div class="overflow-x-auto bg-white rounded-lg shadow">
          <table class="min-w-full bg-white">
            <thead class="bg-gray-200 text-tBase-100 uppercase text-sm">
              <tr>
                <th class="py-3 px-6 text-left">Branch Name</th>
                <th class="py-3 px-6 text-left">Address</th>
                <th class="py-3 px-6 text-left">Status</th>
                <th class="py-3 px-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody class="text-tBase-100 text-sm">
              <tr v-if="isLoading">
                <td colspan="5" class="py-4 px-6 text-center">
                  <div class="flex justify-center items-center">
                    <LoaderIcon class="animate-spin h-8 w-8 text-primary-500" />
                  </div>
                </td>
              </tr>
              <tr v-else-if="filteredBranches.length === 0">
                <td colspan="5" class="py-4 px-6 text-center text-gray-500">
                  No branches found
                </td>
              </tr>
              <tr v-else v-for="branch in filteredBranches" :key="branch.id"
                class="border-b hover:bg-gray-100 cursor-pointer" @click="selectBranch(branch)">
                <td class="py-3 px-6">{{ branch.name }}</td>
                <td class="py-3 px-6">
                  {{ formatAddress(branch.location) }}
                </td>
                <td class="py-3 px-6">
                  <span :class="{
                    'bg-green-200 text-green-700': branch.isActive,
                    'bg-red-200 text-red-700': !branch.isActive,
                  }" class="px-2 py-1 rounded-full text-xs font-semibold">
                    {{ branch.isActive ? 'Active' : 'Inactive' }}
                  </span>
                </td>
                <td class="py-3 px-6 text-center">
                  <div class="flex justify-center space-x-2">
                    <button @click.stop="openEditModal(branch)"
                      class="text-primary-500 hover:text-primary-700 transition-colors duration-300">
                      <PencilIcon class="w-5 h-5" />
                    </button>
                    <button @click.stop="openStatusModal(branch)" :class="{
                      'text-red-600 hover:text-red-800': branch.isActive,
                      'text-green-600 hover:text-green-800': !branch.isActive
                    }" class="transition-colors duration-300">
                      <PowerIcon class="w-5 h-5" />
                    </button>
                    <button 
                      v-if="isOwner"
                      @click.stop="openDeleteModal(branch)"
                      class="text-red-600 hover:text-red-800 transition-colors duration-300">
                      <TrashIcon class="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Sidebar for branch details -->
      <div v-if="selectedBranch" class="lg:w-1/3 bg-white rounded-lg shadow p-6 lg:sticky lg:top-6 lg:self-start">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-xl font-semibold text-tBase-100">Branch Details</h3>
          <button @click="selectedBranch = null" class="text-gray-500 hover:text-gray-700">
            <XIcon class="w-5 h-5" />
          </button>
        </div>
        
        <div class="space-y-4">
          <div class="text-tBase-100">
            <div class="text-sm text-gray-500">Branch Name</div>
            <div class="font-medium">{{ selectedBranch.name }}</div>
          </div>
          
          <div class="text-tBase-100">
            <div class="text-sm text-gray-500">Address</div>
            <div class="font-medium">{{ formatAddress(selectedBranch.location) }}</div>
          </div>
          
          <div class="text-tBase-100">
            <div class="text-sm text-gray-500">Created By</div>
            <div class="font-medium">{{ formatCreatedBy(selectedBranch.createdBy) }}</div>
          </div>
          
          <div class="text-tBase-100">
            <div class="text-sm text-gray-500">Status</div>
            <div :class="{
              'text-green-700 font-medium': selectedBranch.isActive,
              'text-red-700 font-medium': !selectedBranch.isActive,
            }">
              {{ selectedBranch.isActive ? 'Active' : 'Inactive' }}
            </div>
          </div>
          
          <div class="border-t pt-4 flex space-x-2">
            <button @click="openEditModal(selectedBranch)"
              class="px-3 py-1 bg-primary-500 text-white rounded hover:bg-primary-600 transition-colors duration-300 flex items-center">
              <PencilIcon class="w-4 h-4 mr-1" />
              Edit
            </button>
            <button @click="openStatusModal(selectedBranch)" :class="{
              'bg-red-500 hover:bg-red-600': selectedBranch.isActive,
              'bg-green-500 hover:bg-green-600': !selectedBranch.isActive
            }" class="px-3 py-1 text-white rounded transition-colors duration-300 flex items-center">
              <PowerIcon class="w-4 h-4 mr-1" />
              {{ selectedBranch.isActive ? 'Deactivate' : 'Activate' }}
            </button>
            <button 
              v-if="isOwner"
              @click="openDeleteModal(selectedBranch)"
              class="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors duration-300 flex items-center">
              <TrashIcon class="w-4 h-4 mr-1" />
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useBranchStore } from '@/stores/branchStore';
import { useAuthStore } from '@/stores/authStore';
import { useModalStore } from '@/stores/modalStore';
import { PlusIcon, PencilIcon, TrashIcon, PowerIcon, XIcon, LoaderIcon } from 'lucide-vue-next';
import AddBranchModal from '@components/modal/AddBranchForm.vue';
import EditBranchModal from '@components/modal/EditBranchForm.vue';
import StatusConfirmModal from '@components/modal/ChangeBranchStatus.vue';
import DeleteBranchModal from '@components/modal/DeleteBranch.vue';

const route = useRoute();
const router = useRouter();
const branchStore = useBranchStore();
const authStore = useAuthStore();
const modalStore = useModalStore();

// State
const isLoading = ref(true);
const selectedBranch = ref(null);
const searchQuery = ref('');

// Computed properties
const isOwner = computed(() => authStore.user.role === 'owner');
const branches = computed(() => branchStore.fetchedbranches || []);

const filteredBranches = computed(() => {
  if (!searchQuery.value) return branches.value;
  
  const query = searchQuery.value.toLowerCase();
  return branches.value.filter(branch => 
    branch.name.toLowerCase().includes(query) || 
    formatAddress(branch.location).toLowerCase().includes(query)
  );
});

// Methods
const formatAddress = (location) => {
  if (!location) return 'N/A';
  return `${location.street}, ${location.barangay}, ${location.municipality}, ${location.province}`;
};

const formatCreatedBy = (user) => {
  if (!user) return 'N/A';
  return `${user.firstName} ${user.lastName}`;
};

const selectBranch = (branch) => {
  selectedBranch.value = branch;
};

// Modal handlers
const openAddBranchModal = () => {
  if (!isOwner.value) {
    alert('Only owners can create new branches');
    return;
  }
  
  modalStore.open(AddBranchModal, {}, {
    onSuccess: () => {
      // Refresh data if needed
    }
  });
};

const openEditModal = (branch) => {
  modalStore.open(EditBranchModal, { branch }, {
    onSuccess: () => {
      // Update selected branch if it was edited
      if (selectedBranch.value && selectedBranch.value.id === branch.id) {
        const updatedBranch = branches.value.find(b => b.id === branch.id);
        if (updatedBranch) {
          selectedBranch.value = updatedBranch;
        }
      }
    }
  });
};

const openStatusModal = (branch) => {
  modalStore.open(StatusConfirmModal, { 
    branch,
    action: branch.isActive ? 'deactivate' : 'activate'
  }, {
    onSuccess: () => {
      // Update selected branch if its status was changed
      if (selectedBranch.value && selectedBranch.value.id === branch.id) {
        const updatedBranch = branches.value.find(b => b.id === branch.id);
        if (updatedBranch) {
          selectedBranch.value = updatedBranch;
        }
      }
    }
  });
};

const openDeleteModal = (branch) => {
  if (!isOwner.value) {
    alert('Only owners can delete branches');
    return;
  }
  
  modalStore.open(DeleteBranchModal, { branch }, {
    onSuccess: () => {
      // Clear selected branch if it was deleted
      if (selectedBranch.value && selectedBranch.value.id === branch.id) {
        selectedBranch.value = null;
      }
    }
  });
};

// Lifecycle hooks
onMounted(async () => {
  try {
    isLoading.value = true;
    await branchStore.fetchBranchesRealtime();
  } finally {
    isLoading.value = false;
  }
});

onUnmounted(() => {
  branchStore.stopListening();
});
</script>

<style scoped>
@media (max-width: 1023px) {
  .lg\:sticky {
    position: static;
  }
}
</style>