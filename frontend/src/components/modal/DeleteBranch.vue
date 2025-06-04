<template>
  <div class="p-6 max-w-md w-full bg-white rounded-lg">
    <h3 class="text-xl font-semibold text-red-600 mb-4">Delete Branch</h3>

    <div class="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
      <div class="flex">
        <AlertTriangleIcon class="h-5 w-5 text-red-500 mr-2" />
        <div>
          <p class="text-sm text-red-700">
            Warning: This action cannot be undone. This will permanently delete the branch.
          </p>
        </div>
      </div>
    </div>

    <p class="text-tBase-100 mb-6">
      To confirm, please type <strong>{{ confirmationText }}</strong> below:
    </p>

    <div class="mb-6">
      <input v-model="userConfirmation" type="text" placeholder="Type confirmation text here"
        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500" />
    </div>

    <div class="flex justify-end gap-4">
      <button @click="modal.events?.onCancel(), modal.close()"
        class="px-4 py-2 text-sm font-medium text-tBase-100 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors duration-300">
        Cancel
      </button>
      <button @click="confirmDelete" :disabled="userConfirmation !== confirmationText || isSubmitting"
        class="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors duration-300 focus:outline-none focus:ring-4 focus:ring-red-300">
        <span v-if="!isSubmitting">Delete Branch</span>
        <span v-else class="flex items-center">
          <LoaderIcon class="animate-spin h-4 w-4 mr-2" />
          Deleting...
        </span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useBranchStore } from '@/stores/branchStore';
import { useAuthStore } from '@/stores/authStore';
import { useModalStore } from '@/stores/modalStore';
import { LoaderIcon, AlertTriangleIcon } from 'lucide-vue-next';
import { auth } from '@/services/firebase';
import { getIdToken } from 'firebase/auth';
import axios from 'axios';

const props = defineProps({
  branch: {
    type: Object,
    required: true
  },
});

const authStore = useAuthStore();
const branchStore = useBranchStore();
const modal = useModalStore();
const isSubmitting = ref(false);
const userConfirmation = ref('');
const apiUrl = import.meta.env.VITE_API_BASE_URL;

// Check if user is owner
if (authStore.user.role !== 'owner') {
  modal.close();
  alert('Only owners can delete branches');
}

// Create a confirmation text based on branch name
const confirmationText = computed(() => `delete-${props.branch.name.toLowerCase()}`);

// Delete branch method
const deleteBranch = async () => {
  try {
    isSubmitting.value = true;

    // Call the API to delete the branch
    const idToken = await getIdToken(auth.currentUser);
    await branchStore.deleteBranch(props.branch.id);

    if (modal.events?.onSuccess) {
      modal.events?.onSuccess();
    }

    modal.close();
  } 
  finally {
    isSubmitting.value = false;
  }
};

const confirmDelete = async () => {
  if (userConfirmation.value !== confirmationText.value) {
    return;
  }

  await deleteBranch();
};
</script>