<template>
    <!-- This is an invisible component that just handles modal routing -->
</template>

<script setup>
import { watch, onMounted, onUnmounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useModalStore } from '@/stores/modalStore';
import { useAuthStore } from '@/stores/authStore';
import { useBranchStore } from '@/stores/branchStore';

// Import modal components
import AddBranchModal from '@/components/modal/AddBranchForm.vue';
import EditBranchModal from '@/components/modal/EditBranchForm.vue';
import StatusConfirmModal from '@/components/modal/ChangeBranchStatus.vue';
import DeleteBranchModal from '@/components/modal/DeleteBranch.vue';

const route = useRoute();
const router = useRouter();
const modalStore = useModalStore();
const authStore = useAuthStore();
const branchStore = useBranchStore();

// Map of modal types to components
const modalComponents = {
    // Branch modals
    'addBranch': AddBranchModal,
    'editBranch': EditBranchModal,
    'toggleBranchStatus': StatusConfirmModal,
    'deleteBranch': DeleteBranchModal,

    // You can add other feature modals here
    // 'addOrder': AddOrderModal,
    // 'editOrder': EditOrderModal,
    // etc.
};

// Authorization checks for different modal types
const authorizationChecks = {
    // Branch modals
    'addBranch': () => authStore.user.role === 'owner',
    'editBranch': () => ['owner', 'manager', 'assistant_manager'].includes(authStore.user.role),
    'toggleBranchStatus': () => ['owner', 'manager'].includes(authStore.user.role),
    'deleteBranch': () => authStore.user.role === 'owner',

    // You can add other feature authorization checks here
};

// Get the base path without the modal part
const getBasePath = (path) => {
    return path.split('/modal/')[0];
};

// Function to handle opening a modal based on route parameters
const handleModalRoute = async () => {
    const modalType = route.params.modalType;
    const itemId = route.params.id;
    const basePath = getBasePath(route.path);

    // Close any open modal first
    if (modalStore.show) {
        modalStore.close();
    }

    // If we have a modal type in the URL, try to open it
    if (modalType && modalComponents[modalType]) {
        // Check authorization
        if (!authorizationChecks[modalType]()) {
            console.error(`Unauthorized access to ${modalType} modal`);
            // Redirect back to the base path without the modal
            router.replace(basePath);
            return;
        }

        // Prepare props based on modal type and item ID
        let modalProps = {};

        if (itemId && ['editBranch', 'toggleBranchStatus', 'deleteBranch'].includes(modalType)) {
            // Make sure the store has data before trying to find the item
            if (!branchStore.fetchedbranches || branchStore.fetchedbranches.length === 0) {
                try {
                    // If we're refreshing the page, we might need to fetch data first
                    await branchStore.fetchBranchesRealtime();
                } catch (error) {
                    console.error('Error fetching branches:', error);
                    router.replace(basePath);
                    return;
                }
            }

            // Get the branch from the store
            const branch = branchStore.fetchedbranches.find(b => b.id === itemId);

            if (!branch) {
                console.error(`Branch with ID ${itemId} not found`);
                router.replace(basePath);
                return;
            }

            modalProps = {
                branch,
                // For toggle status, add the action prop
                ...(modalType === 'toggleBranchStatus' ? { action: branch.isActive ? 'deactivate' : 'activate' } : {})
            };
        }

        // Open the modal
        modalStore.open(modalComponents[modalType], modalProps, {
            onSuccess: () => {
                // On success, navigate back to the base path
                router.replace(basePath);
            },
            onCancel: () => {
                // On cancel, navigate back to the base path
                router.replace(basePath);
            }
        });
    }
};

// Watch for route changes to handle modal opening/closing
watch(
    () => route.fullPath,
    () => {
        handleModalRoute();
    }
);

// Important: Handle the initial route on component mount
onMounted(() => {
    // Check if we're on a modal route when the component mounts
    if (route.params.modalType) {
        handleModalRoute();
    }
});

// Handle modal closing when the component is unmounted
onUnmounted(() => {
    if (modalStore.show) {
        modalStore.close();
    }
});
</script>