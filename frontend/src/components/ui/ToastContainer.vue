<!-- frontend\src\components\ui\ToastContainer.vue -->
<template>
    <teleport to="#toast-root">
        <div class="fixed top-6 right-6 z-[99999] w-80 pointer-events-none">
            <transition-group name="toast" tag="div" class="relative">
                <div v-for="toast in toastStore.toasts" :key="toast.id"
                    class="pointer-events-auto flex items-center px-4 py-2 w-full text-sm rounded-md shadow-lg relative mb-3"
                    :class="toastClass(toast.type)" role="alert">
                    <component :is="iconMap[toast.type]" class="w-5 h-5 mr-3 flex-shrink-0" />
                    <span class="flex-1">{{ toast.message }}</span>
                    <button @click="toastStore.removeToast(toast.id)" type="button"
                        class="ml-3 inline-flex items-center justify-center w-6 h-6 text-base hover:opacity-75 focus:outline-none">
                        &times;
                    </button>
                </div>
            </transition-group>
        </div>
    </teleport>
</template>

<script setup>
import { useToastStore } from '@/stores/toastStore'
import { CheckCircle, AlertTriangle, Info, XCircle } from 'lucide-vue-next'

const toastStore = useToastStore()

const toastClass = (type) => {
    switch (type) {
        case 'success': return 'bg-success-500 text-white'
        case 'error': return 'bg-danger-500 text-white'
        case 'warning': return 'bg-warning-500 text-white'
        case 'info': return 'bg-info-500 text-white'
        default: return 'bg-gray-800 text-white'
    }
}

const iconMap = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertTriangle,
    info: Info,
}
</script>

<style scoped>
.toast-move,
.toast-enter-active,
.toast-leave-active {
    transition: all 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
    opacity: 0;
    transform: translateY(12px);
}

/* 🪄 This enables FLIP animation */
.toast-leave-active {
    position: absolute;
    width: 100%;
}
</style>