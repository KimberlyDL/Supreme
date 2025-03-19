<!-- frontend\src\layouts\full\vertical-sidebar\Icon.vue -->
<template>
  <v-sheet rounded="md" color="lightprimary" class="position-relative extrabox hide-menu mx-1 px-4 py-3">
      <div class="d-flex align-center">
          <div>
              <h6 class="text-h6 text-10 mb-3">Upgrade to pro</h6>
              <v-btn target="_blank" href="https://www.wrappixel.com/templates/materialm-vuejs-vuetify-admin-template/?ref=33" color="primary" class="px-5" flat>Buy Pro</v-btn>
          </div>
          <div class="">
              <img src="@/assets/images/backgrounds/upgrade.svg" height="100" width="100" class="px-2 ms-8" />
          </div>
      </div>
  </v-sheet>
</template>
<script setup>
const props = defineProps({ item: Object, level: Number });
</script>

<template>
  <template v-if="level > 0">
    <component
      :is="item"
      size="14"
      stroke-width="1.5"
      class="iconClass"
    ></component>
  </template>
  <template v-else>
    <component
      :is="item"
      size="20"
      stroke-width="1.5"
      class="iconClass"
    ></component>
  </template>
</template>
