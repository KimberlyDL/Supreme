<!-- frontend\src\components\notif\BasicNotif.vue -->
<template>
    <div class="toast-container space-y-4">
        <transition-group name="toast" tag="div" class="space-y-4">
            <Toast v-for="(toast, index) in toasts"
                :key="toast.id"
                :message="toast.message"
                :type="toast.type"
                :bgColor="toast.bgColor"
                :closeButtonClass="toast.closeButtonColor"
                :duration="toast.duration"
                @close="removeToast(index)">

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
import Toast from "@components/utils/notification/BasicNotif/base.vue";
import { CheckCircle, AlertTriangle, Info, XCircle } from "lucide-vue-next";

const toasts = ref([]);

// Map toast types to Lucide icons
const typeToIcon = {
  success: CheckCircle,
  danger: XCircle,
  warning: AlertTriangle,
  info: Info,
};
 
const addToast = (toast) => {
  toasts.value.push({
    id: Date.now(),
    type: toast.type,
    icon: typeToIcon[toast.type] || Info,
    ...toast,
  });
};

const removeToast = (index) => {
    toasts.value.splice(index, 1);
};

defineExpose({ addToast });
</script>

<style scoped>

.toast-container {
    position: fixed;
    bottom: 1rem;
    right: 1rem;
    display: flex;
    flex-direction: column-reverse;
    /* Reverse to stack new toasts at the bottom */
    align-items: flex-end;
}

.toast-item {
    position: relative;
}

.toast-move,
.toast-enter-active,
.toast-leave-active {
    transition: all 0.5s ease;
}

.toast-enter-from {
    opacity: 0;
    transform: translateX(100%);
}

.toast-enter-to {
    opacity: 1;
    transform: translateX(0);
}

.toast-leave-active {
    position: absolute;
    opacity: 1;
    transition: opacity 0.5s ease, transform 0.5s ease;
}

.toast-leave-to {
    opacity: 0;
    transform: scale(1.1);
    /* Slightly zoom out on fade-out */
}
</style>
