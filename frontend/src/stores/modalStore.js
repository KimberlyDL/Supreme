// frontend\src\stores\modalStore.js

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
        if (modalEvents.onSuccess) {
          modalEvents.onSuccess(...args);
        }
        close();
      },
      // Wrap the original onCancel to ensure modal closing
      onCancel: (...args) => {
        if (modalEvents.onCancel) {
          modalEvents.onCancel(...args);
        }
        close();
      },
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
