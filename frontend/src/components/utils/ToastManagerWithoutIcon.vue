<template>
    <div class="toast-container space-y-4">
        <Toast v-for="(toast, index) in toasts" :key="toast.id" :message="toast.message" :bgColor="toast.bgColor"
            :iconBgColor="toast.iconBgColor" :closeButtonColor="toast.closeButtonColor" :iconLabel="toast.iconLabel"
            :duration="toast.duration" @close="removeToast(index)">
            <!-- Pass custom icon through slot if provided -->
            <template #icon v-if="toast.icon">
                <component :is="toast.icon" />
            </template>
        </Toast>
    </div>
</template>

<script setup>
import { ref } from "vue";
import Toast from "@components/utils/ToastManager.vue";

const toasts = ref([]);

const addToast = (toast) => {
    const toastId = Date.now(); // Generate a unique ID for each toast
    toasts.value.push({ id: toastId, ...toast });
};

const removeToast = (index) => {
    toasts.value.splice(index, 1);
};

// Expose `addToast` to be used in other components or globally
export { addToast };
</script>

<style scoped>
.toast-container {
    position: fixed;
    top: 1rem;
    right: 1rem;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
}
</style>