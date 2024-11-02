<template>
    <div>
        <!-- Overlay Background -->
        <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 z-40"></div>

        <!-- Notification Modal Component with Transition -->
        <Transition name="zoom-fade">
            <div v-if="showModal" class="fixed inset-0 flex items-center justify-center z-50">
                <NotificationModal 
                    :visible="showModal" 
                    :title="title" 
                    :message="message" 
                    :theme="theme"
                    @close="showModal = false" 
                />
            </div>
        </Transition>
    </div>
</template>

<script setup>
import { ref, defineProps, defineExpose } from "vue";
import NotificationModal from "@components/utils/notification/components/NotifModal.vue";

// Define props for title, message, and theme to customize the modal content
const props = defineProps({
    title: { type: String, default: "Notification" },
    message: { type: String, required: true },
    theme: { type: String, default: "default" }, // Add theme prop for dynamic colors
});

const showModal = ref(false);

// Method to open the modal programmatically
const openModal = () => {
    showModal.value = true;
};

// Expose `openModal` to be called externally
defineExpose({ openModal });
</script>

<style scoped>
/* Define the transition styles */
.zoom-fade-enter-active,
.zoom-fade-leave-active {
    transition: all 0.3s ease;
}

.zoom-fade-enter-from,
.zoom-fade-leave-to {
    opacity: 0;
    transform: scale(0.9);
}

.zoom-fade-enter-to,
.zoom-fade-leave-from {
    opacity: 1;
    transform: scale(1);
}
</style>
