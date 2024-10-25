<template>
    <div>
      <form @submit.prevent="createBranch">
        <input v-model="branchStore.branchData.name" placeholder="Branch Name">
        <input v-model="branchStore.branchData.location.street" placeholder="Street">
        <input v-model="branchStore.branchData.location.barangay" placeholder="Barangay">
        <input v-model="branchStore.branchData.location.city" placeholder="City">
        <input v-model="branchStore.branchData.location.municipality" placeholder="Municipality">
        <input v-model="branchStore.branchData.contact" placeholder="Contact Number">
        <input v-model="branchStore.branchData.manager" placeholder="Manager Name">
        <button type="submit">Create Branch</button>
      </form>
    </div>
  </template>
  
  <script>
  import { useBranchStore } from '@/stores/branchStore';
  
  export default {
    setup() {
      const branchStore = useBranchStore();
  
      const createBranch = () => {
        branchStore.addBranch();
      };
  
      return {
        branchStore,
        createBranch
      };
    }
  }
  </script>