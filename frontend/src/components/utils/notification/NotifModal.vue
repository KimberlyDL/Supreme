<template>
    <div>
        <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 z-40"></div>

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
import { ref} from "vue";
import NotificationModal from "@components/utils/notification/components/NotifModal.vue";

const props = defineProps({
    title: { type: String, default: "Notification" },
    message: { type: String, required: true },
    theme: { type: String, default: "default" },
});

const showModal = ref(false);

const openModal = () => {
    showModal.value = true;
};

defineExpose({ openModal });
</script>

<style scoped>
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
