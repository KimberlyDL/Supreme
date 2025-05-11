<template>
    <div class="mb-6">
        <label for="branch-selector" class="block text-sm font-medium text-gray-700 mb-1">
            Select Branch
        </label>
        <select id="branch-selector" v-model="selectedBranchId" @change="selectBranch"
            class="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500">
            <option value="" disabled>Select a branch</option>
            <option v-for="branch in branches" :key="branch.id" :value="branch.id">
                {{ branch.name }}
            </option>
        </select>
    </div>
</template>
<script setup>
import { ref, watch } from "vue"

const props = defineProps({
    branches: {
        type: Array,
        required: true,
    },
    modelValue: {
        type: String,
        default: "",
    },
})

const emit = defineEmits(["update:modelValue"])

const selectedBranchId = ref(props.modelValue)

function selectBranch() {
    emit("update:modelValue", selectedBranchId.value)
}

watch(
    () => props.modelValue,
    (newValue) => {
        selectedBranchId.value = newValue
    },
)
</script>
