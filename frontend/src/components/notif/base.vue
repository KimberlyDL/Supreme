<!-- frontend\src\components\utils\notification\BasicNotif\base.vue -->
<template>
    <div v-if="visible" :class="[
        'flex items-center w-full max-w-xs py-2 px-4 rounded-sm shadow-lg transition-opacity duration-500 border',
        bgColor, borderColor
    ]" role="alert">
        <!-- Icon Slot -->

        <div :class="['inline-flex items-center justify-center flex-shrink-0 w-8 h-8']">
            <slot name="icon">
                <component :is="icon || Info" :stroke="iconColor" class="w-6 h-6" />
            </slot>
        </div>

        <div class="ms-3 me-3 text-tBase-100 text-sm font-inter font-normal">{{ message }}</div>

        <button type="button"
            class="ml-auto -mx-1.5 -my-1.5 rounded-lg focus:ring-2 focus:ring-primary p-1.5 inline-flex items-center justify-center h-6 w-6"
            :class="closeButtonClass" @click="closeToast" aria-label="Close">
            <span class="sr-only">Close</span>
            <svg class="w-2 h-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
            </svg>
        </button>

    </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { Info } from "lucide-vue-next";

const props = defineProps({
    message: { type: String, default: "" },
    duration: { type: Number, default: 5000 },
    type: { type: String, default: "info" },
    bgColor: { type: String, default: "bg-bgPrimary text-tBase-100" },
    closeButtonClass: { type: String, default: "text-tBase-100 hover:text-tBase-50" },
    icon: { type: Object, default: null }
});

const emit = defineEmits(["close"]);
const visible = ref(true);

const borderColor = computed(() => {
    switch (props.type) {
        case "success":
            return "border-success-500";
        case "danger":
            return "border-danger-500";
        case "warning":
            return "border-warning-500";
        case "info":
            return "border-info-500";
        default:
            return "border-bgPrimary-700";
    }
});

const iconColor = computed(() => {
    switch (props.type) {
        case "success":
            return "#28a745"; // Green
        case "danger":
            return "#dc3545"; // Red
        case "warning":
            return "#ffc107"; // Yellow
        case "info":
            return "#17a2b8"; // Blue
        default:
            return "#6c757d"; // Gray
    }
});

const closeToast = () => {
    visible.value = false;
    emit("close");
};

onMounted(() => {
    setTimeout(() => {
        closeToast();
    }, props.duration);
});

</script>

<style scoped>
.notification {
    opacity: 1;
    transition: opacity 0.5s ease;
}
</style>