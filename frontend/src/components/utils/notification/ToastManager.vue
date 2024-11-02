<!-- frontend\src\components\utils\ToastManager.vue -->
<template>
    <div class="toast-container space-y-4">
        <transition-group name="toast" tag="div" class="space-y-4">
            <Toast
                v-for="(toast, index) in toasts"
                :key="toast.id"
                :message="toast.message"
                :type="toast.type"
                :bgColor="toast.bgColor"
                :iconBgColor="toast.iconBgColor"
                :closeButtonColor="toast.closeButtonColor"
                :iconLabel="toast.iconLabel"
                :duration="toast.duration"
                @close="removeToast(index)"
            >
                <!-- Pass custom icon through slot if provided -->
                <template #icon>
                    <component :is="toast.icon" />
                </template>
            </Toast>
        </transition-group>
    </div>
</template>

<script setup>
import { ref, markRaw } from "vue";
import Toast from "@components/utils/notification/components/Toast.vue";
import SuccessIconComponent from '@components/utils/icons/SuccessIcon.vue';
import ErrorIconComponent from '@components/utils/icons/ErrorIcon.vue';

const toasts = ref([]);

const SuccessIcon = markRaw(SuccessIconComponent);
const ErrorIcon = markRaw(ErrorIconComponent);

// Modify `addToast` to set the icon within `ToastManager`
const addToast = (toast) => {
    const toastId = Date.now(); // Generate a unique ID for each toast
    let iconComponent;

    // Assign different icons based on conditions or default
    if (toast.type === "success") {
        iconComponent = SuccessIcon;
    } else if (toast.type === "error") {
        iconComponent = ErrorIcon;
    } else {
        iconComponent = null; // Default to no icon or any other default icon
    }

    toasts.value.push({
        id: toastId,
        icon: iconComponent,
        type: toast.type, // Set the icon based on the type
        ...toast,
    });
};

const removeToast = (index) => {
    toasts.value.splice(index, 1);
};

// Export `addToast` to use globally
defineExpose({ addToast });
</script>

<style scoped>
/* .toast-container {
    position: fixed;
    top: 1rem;
    right: 1rem;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
} */

.toast-container {
    position: fixed;
    bottom: 1rem;
    right: 1rem;
    display: flex;
    flex-direction: column-reverse; /* Reverse to stack new toasts at the bottom */
    align-items: flex-end;
}

.toast-enter-active, .toast-leave-active {
    transition: all 0.5s ease;
}

.toast-enter-from {
    opacity: 0;
    transform: translateX(100%); /* Slide in from the right */
}

.toast-enter-to {
    opacity: 1;
    transform: translateX(0);
}

.toast-leave-active {
    opacity: 1;
    transition: opacity 0.5s ease, transform 0.5s ease;
}

.toast-leave-to {
    opacity: 0;
    transform: scale(1.1); /* Slightly zoom out on fade-out */
}

.toast-move {
    transition: transform 0.5s ease;
}
</style>
