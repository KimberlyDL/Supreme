<template>
    <div class="p-6 max-w-md w-full bg-white rounded-lg">
        <h3 class="text-xl font-semibold text-tBase-100 mb-4">Confirm Status Change</h3>

        <p class="text-tBase-100 mb-6">
            Are you sure you want to {{ action }} the branch "{{ branch.name }}"?
        </p>

        <div class="flex justify-end gap-4">
            <button @click="modal.events?.onCancel(), modal.close()"
                class="px-4 py-2 text-sm font-medium text-tBase-100 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors duration-300">
                Cancel
            </button>
            <button @click="confirmStatusChange" :disabled="isSubmitting" :class="{
                'bg-red-500 hover:bg-red-600': action === 'deactivate',
                'bg-green-500 hover:bg-green-600': action === 'activate'
            }"
                class="px-4 py-2 text-sm font-medium text-white rounded-md disabled:opacity-50 transition-colors duration-300 focus:outline-none focus:ring-4 focus:ring-primary-300">
                <span v-if="!isSubmitting">Confirm</span>
                <span v-else class="flex items-center">
                    <LoaderIcon class="animate-spin h-4 w-4 mr-2" />
                    Processing...
                </span>
            </button>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { useBranchStore } from '@/stores/branchStore';
import { useModalStore } from '@/stores/modalStore';
import { LoaderIcon } from 'lucide-vue-next';

const props = defineProps({
    branch: {
        type: Object,
        required: true
    },
    action: {
        type: String,
        required: true,
        validator: (value) => ['activate', 'deactivate'].includes(value)
    },
});

const branchStore = useBranchStore();
const modal = useModalStore();
const isSubmitting = ref(false);

const confirmStatusChange = async () => {
    try {
        isSubmitting.value = true;
        await branchStore.toggleBranchStatus(
            props.branch.id,
            props.branch.isActive
        );

        if (modal.events?.onSuccess) {
            modal.events?.onSuccess();
        }

        modal.close();
    } finally {
        isSubmitting.value = false;
    }
};
</script>