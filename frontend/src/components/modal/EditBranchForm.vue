<template>
    <div class="p-6 max-w-md w-full bg-white rounded-lg">
        <h3 class="text-xl font-semibold text-tBase-100 mb-6">Edit Branch</h3>

        <form @submit.prevent="submitEditBranch">
            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-tBase-100">Branch Name</label>
                    <input v-model="branchData.name" type="text"
                        class="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500" />
                    <span v-if="v$.branchData.name.$error" class="text-red-500 text-sm">
                        {{ v$.branchData.name.$errors[0].$message }}
                    </span>
                </div>

                <div>
                    <label class="block text-sm font-medium text-tBase-100">Address</label>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <input v-model="branchData.location.street" type="text" placeholder="Street"
                                class="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500" />
                            <span v-if="v$.branchData.location.street.$error" class="text-red-500 text-sm">
                                {{ v$.branchData.location.street.$errors[0].$message }}
                            </span>
                        </div>
                        <div>
                            <input v-model="branchData.location.barangay" type="text" placeholder="Barangay"
                                class="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500" />
                            <span v-if="v$.branchData.location.barangay.$error" class="text-red-500 text-sm">
                                {{ v$.branchData.location.barangay.$errors[0].$message }}
                            </span>
                        </div>
                        <div>
                            <input v-model="branchData.location.municipality" type="text" placeholder="Municipality"
                                class="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500" />
                            <span v-if="v$.branchData.location.municipality.$error" class="text-red-500 text-sm">
                                {{ v$.branchData.location.municipality.$errors[0].$message }}
                            </span>
                        </div>
                        <div>
                            <input v-model="branchData.location.province" type="text" placeholder="Province"
                                class="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500" />
                            <span v-if="v$.branchData.location.province.$error" class="text-red-500 text-sm">
                                {{ v$.branchData.location.province.$errors[0].$message }}
                            </span>
                        </div>
                    </div>
                </div>

                <div class="flex justify-end gap-4 mt-6">
                    <button type="button" @click="modal.close()"
                        class="px-4 py-2 text-sm font-medium text-tBase-100 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors duration-300">
                        Cancel
                    </button>
                    <button type="submit" :disabled="isSubmitting"
                        class="px-4 py-2 text-sm font-medium text-white bg-primary-500 rounded-md hover:bg-primary-600 disabled:opacity-50 transition-colors duration-300 focus:outline-none focus:ring-4 focus:ring-primary-300">
                        <span v-if="!isSubmitting">Save Changes</span>
                        <span v-else class="flex items-center">
                            <LoaderIcon class="animate-spin h-4 w-4 mr-2" />
                            Saving...
                        </span>
                    </button>
                </div>
            </div>
        </form>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { useBranchStore } from '@/stores/branchStore';
import { useModalStore } from '@/stores/modalStore';
import useVuelidate from '@vuelidate/core';
import { required, minLength, maxLength, helpers } from '@vuelidate/validators';
import { LoaderIcon } from 'lucide-vue-next';

const props = defineProps({
    branch: {
        type: Object,
        required: true
    },
    onSuccess: Function
});

const branchStore = useBranchStore();
const modal = useModalStore();

// Form data - create a deep copy of the branch
const branchData = ref({
    name: props.branch.name,
    location: {
        street: props.branch.location?.street || '',
        barangay: props.branch.location?.barangay || '',
        municipality: props.branch.location?.municipality || '',
        province: props.branch.location?.province || ''
    },
});

const isSubmitting = ref(false);

// Custom validators
const nameNotTaken = (value) => {
    if (!value) return true;
    // Allow the current branch to keep its name
    if (value.toLowerCase() === props.branch.name.toLowerCase()) return true;

    const existingNames = branchStore.fetchedbranches
        .filter(branch => branch.id !== props.branch.id)
        .map(branch => branch.name.toLowerCase());

    return !existingNames.includes(value.toLowerCase());
};

// Validation rules
const rules = {
    branchData: {
        name: {
            required: helpers.withMessage('Branch name is required', required),
            minLength: helpers.withMessage('Branch name must be at least 3 characters', minLength(3)),
            maxLength: helpers.withMessage('Branch name cannot exceed 50 characters', maxLength(50)),
            nameNotTaken: helpers.withMessage('This branch name is already taken', nameNotTaken)
        },
        location: {
            street: {
                required: helpers.withMessage('Street is required', required),
                minLength: helpers.withMessage('Street must be at least 3 characters', minLength(3))
            },
            barangay: {
                required: helpers.withMessage('Barangay is required', required),
                minLength: helpers.withMessage('Barangay must be at least 3 characters', minLength(3))
            },
            municipality: {
                required: helpers.withMessage('Municipality is required', required),
                minLength: helpers.withMessage('Municipality must be at least 3 characters', minLength(3))
            },
            province: {
                required: helpers.withMessage('Province is required', required),
                minLength: helpers.withMessage('Province must be at least 3 characters', minLength(3))
            }
        }
    }
};

const v$ = useVuelidate(rules, { branchData });

// Submit method
const submitEditBranch = async () => {
    const isValid = await v$.value.$validate();
    if (!isValid) return;

    try {
        isSubmitting.value = true;
        await branchStore.editBranch(props.branch.id, {
            name: branchData.value.name,
            location: branchData.value.location,
        });

        if (props.onSuccess) {
            props.onSuccess();
        }

        modal.close();
    } catch (error) {
        console.error('Error updating branch:', error);
        alert('Failed to update branch: ' + (error.response?.data?.message || error.message));
    } finally {
        isSubmitting.value = false;
    }
};
</script>