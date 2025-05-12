// frontend\src\stores\modalStore.js

// import { defineStore } from "pinia";
// import { ref, shallowRef } from "vue";

// export const useModalStore = defineStore("modal", () => {
//   const show = ref(false);
//   const component = shallowRef(null); // Use shallowRef to avoid reactivity overhead
//   const props = ref({});
//   const events = ref({});

//   function open(modalComponent, modalProps = {}, modalEvents = {}) {
//     component.value = modalComponent;
//     props.value = modalProps;
//     events.value = modalEvents;
//     show.value = true;
//   }

//   function close() {
//     show.value = false;
//   }

//   return { show, component, props, events, open, close };
// });


import { defineStore } from "pinia";
import { ref, shallowRef } from "vue";

export const useModalStore = defineStore("modal", () => {
  const show = ref(false);
  const component = shallowRef(null); // Use shallowRef to avoid reactivity overhead
  const props = ref({});
  const events = ref({});

  function open(modalComponent, modalProps = {}, modalEvents = {}) {
    component.value = modalComponent;
    props.value = modalProps;
    events.value = {
      ...modalEvents,
      
      // Wrap the original onSuccess to ensure modal closing
      onSuccess: (...args) => {
        close();
        if (modalEvents.onSuccess) {
          modalEvents.onSuccess(...args);
        }
      },
      // Wrap the original onCancel to ensure modal closing
      onCancel: (...args) => {
        close();
        if (modalEvents.onCancel) {
          modalEvents.onCancel(...args);
        }
      }
    };
    show.value = true;
  }

  function close() {
    show.value = false;
    // Small delay to allow for animations
    setTimeout(() => {
      component.value = null;
      props.value = {};
      events.value = {};
    }, 300);
  }

  return { show, component, props, events, open, close };
});