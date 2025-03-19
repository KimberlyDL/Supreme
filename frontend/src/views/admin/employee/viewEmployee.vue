<!-- frontend\src\views\admin\employee\viewEmployee.vue -->
<template>
    <div class="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div class="relative py-3 sm:max-w-xl md:max-w-2xl lg:max-w-4xl xl:max-w-6xl mx-auto">
        <div class="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
          <h2 class="text-2xl font-bold text-center mb-8">Employee Details</h2>
  
          <div v-if="loading" class="text-center">Loading...</div>
          <!-- <div v-if="employeeStore.loading" class="text-center">Loading...</div> -->
          <div v-else-if="error" class="text-red-500 text-center mb-4">{{ error }}</div>
          <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-4">
              <img v-if="employee.profileImageUrl" :src="employee.profileImageUrl" alt="Employee profile" class="w-32 h-32 object-cover rounded-full mb-2" />
              <p><strong>Name:</strong> {{ employee.firstName }} {{ employee.lastName }}</p>
              <p><strong>Email:</strong> {{ employee.email }}</p>
              <p><strong>Phone:</strong> {{ employee.phone }}</p>
              <p><strong>Role:</strong> {{ employee.role }}</p>
              <p><strong>Salary:</strong> {{ employee.salary }}</p>
              <p><strong>Branch:</strong> {{ employee.branchName }}</p>
            </div>
            <div class="space-y-4">
              <h3 class="font-bold">Address</h3>
              <p>{{ employee.address.street }}</p>
              <p>{{ employee.address.barangay }}</p>
              <p>{{ employee.address.municipality }}</p>
              <p>{{ employee.address.province }}</p>
            </div>
          </div>
  
          <div class="mt-8 flex justify-end space-x-4">
            <button @click="editEmployee" class="py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600">Edit</button>
            <button v-if="employee.isActive" @click="deactivateEmployee" class="py-2 px-4 bg-yellow-500 text-white rounded-md hover:bg-yellow-600">Deactivate</button>
            <button v-else @click="activateEmployee" class="py-2 px-4 bg-green-500 text-white rounded-md hover:bg-green-600">Activate</button>
            <button @click="deleteEmployee" class="py-2 px-4 bg-red-500 text-white rounded-md hover:bg-red-600">Delete</button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import { useEmployeeStore } from '@/stores/employeeStore';
  import { useRoute, useRouter } from 'vue-router';
  
  const employeeStore = useEmployeeStore();
  const route = useRoute();
  const router = useRouter();
  
  const employee = ref({});
  const loading = ref(true);
  const error = ref(null);
  
  onMounted(async () => {
    const employeeId = route.params.id;
    try {
      employee.value = await employeeStore.fetchEmployee(employeeId);
    } catch (err) {
      error.value = 'Failed to load employee data. Please try again.';
    } 
    finally {
      loading.value = employeeStore.loading;
    }
  });
  
  const editEmployee = () => {
    router.push({ name: 'AdminDashboardEditEmployee', params: { id: employee.value.id } });
  };
  
  const deactivateEmployee = async () => {
    if (confirm('Are you sure you want to deactivate this employee?')) {
      try {
        await employeeStore.updateEmployee(employee.value.id, { ...employee.value, isActive: false });
        employee.value.isActive = false;
      } catch (err) {
        error.value = 'Failed to deactivate employee. Please try again.';
      }
    }
  };
  
  const activateEmployee = async () => {
    try {
      await employeeStore.updateEmployee(employee.value.id, { ...employee.value, isActive: true });
      employee.value.isActive = true;
    } catch (err) {
      error.value = 'Failed to activate employee. Please try again.';
    }
  };
  
  const deleteEmployee = async () => {
    if (confirm('Are you sure you want to delete this employee? This action cannot be undone.')) {
      try {
        await employeeStore.deleteEmployee(employee.value.id);
        router.push({ name: 'AdminDashboardEmployees' });
      } catch (err) {
        error.value = 'Failed to delete employee. Please try again.';
      }
    }
  };
  </script>