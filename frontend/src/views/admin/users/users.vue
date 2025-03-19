<template>
    <div class="px-4 py-6">
      <h1 class="text-2xl font-semibold text-gray-900 sm:text-3xl dark:text-white">User Management</h1>
      
      <div class="mt-6">
        <div class="sm:hidden">
          <label for="user-type" class="sr-only">Select user type</label>
          <select id="user-type" name="user-type" class="block w-full rounded-md border-gray-300 focus:border-primary-500 focus:ring-primary-500" v-model="activeTab">
            <option value="customers">Customers</option>
            <option value="managers">Managers</option>
            <option value="drivers">Drivers</option>
          </select>
        </div>
        <div class="hidden sm:block">
          <nav class="flex space-x-4" aria-label="Tabs">
            <button 
              v-for="tab in tabs" 
              :key="tab.name"
              @click="activeTab = tab.value"
              :class="[ 
                activeTab === tab.value 
                  ? 'bg-primary-100 text-primary-700' 
                  : 'text-gray-500 hover:text-gray-700', 
                'px-3 py-2 font-medium text-sm rounded-md'
              ]"
            >
              {{ tab.name }}
            </button>
          </nav>
        </div>
      </div>
  
      <div class="mt-6">
        <div class="overflow-x-auto rounded-lg border border-gray-200 shadow-md">
          <table class="w-full border-collapse bg-white text-left text-sm text-gray-500">
            <thead class="bg-gray-50">
              <tr>
                <th scope="col" class="px-6 py-4 font-medium text-gray-900">Name</th>
                <th scope="col" class="px-6 py-4 font-medium text-gray-900">Email</th>
                <th scope="col" class="px-6 py-4 font-medium text-gray-900">Role</th>
                <th scope="col" class="px-6 py-4 font-medium text-gray-900">Status</th>
                <th scope="col" class="px-6 py-4 font-medium text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 border-t border-gray-100">
              <tr v-for="user in filteredUsers" :key="user.id" class="hover:bg-gray-50">
                <td class="px-6 py-4 font-medium text-gray-900">{{ user.name }}</td>
                <td class="px-6 py-4">{{ user.email }}</td>
                <td class="px-6 py-4">{{ user.role }}</td>
                <td class="px-6 py-4">
                  <span :class="[
                    user.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700',
                    'inline-flex rounded-full px-2 text-xs font-semibold leading-5'
                  ]">
                    {{ user.status }}
                  </span>
                </td>
                <td class="px-6 py-4">
                  <div class="flex gap-2">
                    <button class="text-blue-600 hover:text-blue-900">Edit</button>
                    <button class="text-red-600 hover:text-red-900">Delete</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue'
  
  const activeTab = ref('customers')
  
  const tabs = [
    { name: 'Customers', value: 'customers' },
    { name: 'Managers', value: 'managers' },
    { name: 'Drivers', value: 'drivers' },
  ]
  
  const users = [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Customer', status: 'Active' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'Manager', status: 'Active' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'Driver', status: 'Inactive' },
  ]
  
  const filteredUsers = computed(() => {
    return users.filter(user => user.role.toLowerCase() === activeTab.value.slice(0, -1).toLowerCase())
  })
  </script>
  