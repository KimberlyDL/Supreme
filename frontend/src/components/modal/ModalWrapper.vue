<!-- frontend\src\components\modal\ModalWrapper.vue -->

<template>
  <Teleport to="#modal">
    <div v-if="modal.show" class="modal-overlay" @click="handleBackdropClick">
      <div class="modal-content" @click.stop>
        <component :is="modal.component" v-bind="modal.props" v-on="modal.events" />
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { useModalStore } from "@/stores/modalStore";
import { useRouter, useRoute } from "vue-router";
import { onMounted, onUnmounted, ref } from 'vue';

const modal = useModalStore();
const router = useRouter();
const route = useRoute();

const originalOverflow = ref(null);

onMounted(() => {
  originalOverflow.value = document.body.style.overflow;
  if (modal.show) {
    document.body.style.overflow = 'hidden';
  }
});

onUnmounted(() => {
  if (originalOverflow.value !== null) {
    document.body.style.overflow = originalOverflow.value;
  }
});

// Get the base path without the modal part
const getBasePath = (path) => {
  return path.split('/modal/')[0];
};

// Handle backdrop click to close modal and navigate back
const handleBackdropClick = () => {
  // Check if we're in a modal route
  // if (route.path.includes('/modal/')) {
  //   // Navigate back to the base path
  //   router.replace(getBasePath(route.path));
  // }

  if(modal.events?.onCancel){
    modal.events?.onCancel();
  }
  modal.close();
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 50;
}

.modal-content {
  background: white;
  padding: 20px;
  border-radius: 8px;
  max-width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}
</style>















<!-- <template>
  <Teleport to="#modal">
    <div v-if="modal.show" class="modal-overlay">
      <div class="modal-content">
        <component :is="modal.component" v-bind="modal.props" v-on="modal.events" />
      </div>
    </div>
  </Teleport>
</template> -->



<!-- <script setup>
import { useModalStore } from "@/stores/modalStore";
import { useRouter, useRoute } from "vue-router";
import { onMounted, onUnmounted } from 'vue';

const modal = useModalStore();
const router = useRouter();
const route = useRoute();

let originalOverflow;

onMounted(() => {
  originalOverflow = document.body.style.overflow;
  document.body.style.overflow = 'hidden';
});

onUnmounted(() => {
  document.body.style.overflow = originalOverflow;
});

// Handle backdrop click to close modal and navigate back
const handleBackdropClick = () => {
  // Check if we're in a modal route
  if (route.path.includes('/modal/')) {
    // Navigate back to the base route
    router.replace('/administrator/branch');
  }

  // Close the modal
  modal.close();
};

</script> -->

<!-- <style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  background: white;
  padding: 20px;
  border-radius: 8px;
  /* min-width: 300px; */
}

/* .modal-close {
    margin-top: 10px;
    background: red;
    color: white;
    padding: 5px 10px;
    border: none;
    cursor: pointer;
  } */
</style> -->