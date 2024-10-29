<template>
    <div class="px-4 py-6">
        <!-- Header -->
        <h1 class="text-2xl font-semibold text-gray-900 sm:text-3xl dark:text-white">Employee Management</h1>

        <!-- Branch Filter and Export Buttons -->
        <div class="mt-6 flex justify-between items-center">
            <!-- Branch Filter -->
            <div>
                <label for="branch-filter" class="sr-only">Filter by Branch</label>
                <select id="branch-filter" v-model="selectedBranch"
                    class="block w-60 rounded-md border-gray-300 focus:border-primary-500 focus:ring-primary-500">
                    <option value="all">All Branches</option>
                    <option v-for="branch in branches" :key="branch.uid" :value="branch.name">{{ branch.name }}</option>
                </select>
            </div>

            <!-- Export Buttons -->
            <div class="flex space-x-4">
                <button @click="exportToPDF" class="bg-indigo-600 text-white px-4 py-2 rounded-md">Export as
                    PDF</button>
                <button @click="exportToExcel" class="bg-green-600 text-white px-4 py-2 rounded-md">Export as
                    Excel</button>
            </div>
        </div>

        <!-- Loading Spinner -->
        <div v-if="loading" class="flex justify-center mt-6">
            <svg class="animate-spin h-10 w-10 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none"
                viewBox="0 0 24 24" stroke="currentColor">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
            </svg>
        </div>

        <!-- Employee Table -->
        <div v-if="!loading" class="mt-6">
            <div class="overflow-x-auto rounded-lg border border-gray-200 shadow-md">
                <table class="w-full border-collapse bg-white text-left text-sm text-gray-500">
                    <thead class="bg-gray-50">
                        <tr>
                            <th scope="col" class="px-6 py-4 font-medium text-gray-900">Name</th>
                            <th scope="col" class="px-6 py-4 font-medium text-gray-900">Email</th>
                            <th scope="col" class="px-6 py-4 font-medium text-gray-900">Role</th>
                            <th scope="col" class="px-6 py-4 font-medium text-gray-900">Branch</th>
                            <th scope="col" class="px-6 py-4 font-medium text-gray-900">Status</th>
                            <th scope="col" class="px-6 py-4 font-medium text-gray-900">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100 border-t border-gray-100">
                        <tr v-for="user in paginatedUsers" :key="user.id" class="hover:bg-gray-50">
                            <td class="px-6 py-4 font-medium text-gray-900">{{ user.name }}</td>
                            <td class="px-6 py-4">{{ user.email }}</td>
                            <td class="px-6 py-4">{{ user.role }}</td>
                            <td class="px-6 py-4">{{ user.branchName }}</td>
                            <td class="px-6 py-4">
                                <span
                                    :class="[user.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700', 'inline-flex rounded-full px-2 text-xs font-semibold leading-5']">
                                    {{ user.status }}
                                </span>
                            </td>
                            <td class="px-6 py-4">
                                <div class="flex gap-2">
                                    <button @click="viewEmployee(user)"
                                        class="text-blue-600 hover:text-blue-900">View</button>
                                    <button @click="editEmployee(user)"
                                        class="text-blue-600 hover:text-blue-900">Edit</button>
                                    <button @click="fireEmployee(user)"
                                        class="text-red-600 hover:text-red-900">Fire</button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>

                <!-- Pagination -->
                <div class="flex justify-end mt-4 px-6 py-4">
                    <button @click="previousPage" :disabled="currentPage === 1"
                        class="mr-2 px-3 py-1 bg-gray-300 rounded-md">Previous</button>
                    <button @click="nextPage" :disabled="currentPage === totalPages"
                        class="px-3 py-1 bg-gray-300 rounded-md">Next</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useEmployeeStore } from '@/stores/employeeStore'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

// Employee Store
const employeeStore = useEmployeeStore()
const loading = ref(true)
const branches = ref([]) // Holds branch data

// Active tab for filtering by role
const activeTab = ref('managers')

// Branch filter
const selectedBranch = ref('all')

// Pagination state
const currentPage = ref(1)
const itemsPerPage = 5
const totalPages = ref(0)

// Fetch employees and branches when the component is mounted
onMounted(async () => {
    await employeeStore.fetchEmployees()
    console.log(employeeStore.employees);
    
    await fetchBranches() // Fetch active branches
    loading.value = false
})

// Fetch active branches from Firestore
const fetchBranches = async () => {
    branches.value = await employeeStore.fetchActiveBranches();
}

// Get filtered and paginated users
const filteredUsers = computed(() => {

    let filtered = employeeStore.employees;

    // Filter by branch if a specific branch is selected
    if (selectedBranch.value !== 'all') {
        filtered = filtered.filter(user => user.branchName === selectedBranch.value);
    }

    // Filter by active tab (role)
    return filtered.filter(user => user.role.toLowerCase() === activeTab.value.slice(0, -1).toLowerCase())
})

// Paginated users based on the current page
const paginatedUsers = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    totalPages.value = Math.ceil(filteredUsers.value.length / itemsPerPage);
    return filteredUsers.value.slice(start, end);
})

// Pagination methods
const previousPage = () => {
    if (currentPage.value > 1) currentPage.value--;
}

const nextPage = () => {
    if (currentPage.value < totalPages.value) currentPage.value++;
}

// Export Employees to PDF
const exportToPDF = () => {
    const doc = new jsPDF()
    autoTable(doc, {
        head: [['Name', 'Email', 'Role', 'Branch', 'Status']],
        body: filteredUsers.value.map(user => [
            user.name, user.email, user.role, user.branchName, user.status
        ]),
    })
    doc.save('employees.pdf')
}

// Export Employees to Excel using exceljs
const exportToExcel = async () => {
    const ExcelJS = await import('exceljs') // Lazy-load the library to reduce bundle size
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Employees')

    // Add headers to the worksheet
    worksheet.columns = [
        { header: 'Name', key: 'name', width: 30 },
        { header: 'Email', key: 'email', width: 30 },
        { header: 'Role', key: 'role', width: 20 },
        { header: 'Branch', key: 'branchName', width: 30 },
        { header: 'Status', key: 'status', width: 15 },
    ]

    // Add data rows
    filteredUsers.value.forEach((user) => {
        worksheet.addRow({
            name: user.name,
            email: user.email,
            role: user.role,
            branchName: user.branchName,
            status: user.status,
        })
    })

    // Generate and download the Excel file
    const buffer = await workbook.xlsx.writeBuffer()
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'employees.xlsx'
    link.click()
}

// Action buttons
const viewEmployee = (user) => {
    // Logic for viewing employee
    console.log('Viewing:', user)
}

const editEmployee = (user) => {
    // Logic for editing employee
    console.log('Editing:', user)
}

const fireEmployee = (user) => {
    // Logic for firing employee
    console.log('Firing:', user)
}

// Sample tab data for filtering
const tabs = [
    { name: 'Stock Manager', value: 'stock_manager' },
    { name: 'Managers', value: 'managers' },
    { name: 'Drivers', value: 'drivers' },
]
</script>
