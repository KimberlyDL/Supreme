<!-- frontend\src\layouts\full\vertical-sidebar\NavGroup\index.vue -->
<script setup>
const props = defineProps({ item: Object });
</script>

<template>
    <v-list-subheader color="darkText" class="smallCap text-capitalize text-subtitle-2 mt-5 font-weight-bold mini-text">{{ props.item.header}}</v-list-subheader>
</template>
