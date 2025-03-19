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
    events.value = modalEvents;
    show.value = true;
  }

  function close() {
    show.value = false;
  }

  return { show, component, props, events, open, close };
});
