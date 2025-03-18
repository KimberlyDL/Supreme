<!-- frontend\src\components\modal\ModalWrapper.vue -->

<template>
    <Teleport to="#modal">
      <div v-if="modal.show" class="modal-overlay">
        <div class="modal-content">
          <component 
            :is="modal.component" 
            v-bind="modal.props" 
            v-on="modal.events" 
          />
          <!-- <button @click="modal.close" class="modal-close">Close</button> -->
        </div>
      </div>
    </Teleport>
  </template>
  
  <script setup>
  import { useModalStore } from "@/stores/modalStore";
  
  const modal = useModalStore();
  </script>
  
  <style scoped>
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
  </style>
  