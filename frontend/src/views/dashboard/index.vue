<template>
    <Layout>
      <h1 class="text-2xl font-semibold text-gray-900">Dashboard</h1>
      <div class="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <!-- Add your dashboard content here -->
        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <!-- Add an icon here -->
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Total Users</dt>
                  <dd class="text-lg font-medium text-gray-900">10,000</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        <!-- Add more dashboard widgets here -->
      </div>
    </Layout>
  </template>
  
  <script setup>
  import Layout from '../components/Layout.vue'
  </script>