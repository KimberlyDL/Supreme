<template>
    <div class="bg-white rounded-lg shadow-md p-6">
        <div class="flex items-center justify-between mb-6">
            <h2 class="text-2xl font-bold text-text-base-50">Contact Information Management</h2>
            <button @click="isEditing = !isEditing" :class="[
                'px-4 py-2 rounded-lg font-medium transition-colors',
                isEditing
                    ? 'bg-gray-500 hover:bg-gray-600 text-white'
                    : 'bg-primary-600 hover:bg-primary-700 text-white'
            ]">
                <Edit class="w-4 h-4 inline mr-2" />
                {{ isEditing ? 'Cancel' : 'Edit' }}
            </button>
        </div>

        <form @submit.prevent="saveContactInfo" class="space-y-6">
            <!-- Phone -->
            <div>
                <label for="phone" class="block text-sm font-medium text-text-base-200 mb-2">Phone Number</label>
                <input type="tel" id="phone" v-model="formData.phone" :disabled="!isEditing"
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="Enter phone number" />
            </div>

            <!-- Email -->
            <div>
                <label for="email" class="block text-sm font-medium text-text-base-200 mb-2">Email Address</label>
                <input type="email" id="email" v-model="formData.email" :disabled="!isEditing"
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="Enter email address" />
            </div>

            <!-- Address -->
            <div>
                <label for="address" class="block text-sm font-medium text-text-base-200 mb-2">Address</label>
                <textarea id="address" v-model="formData.address" :disabled="!isEditing" rows="3"
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed resize-none"
                    placeholder="Enter full address"></textarea>
            </div>

            <!-- Save Button -->
            <div v-if="isEditing" class="flex justify-end space-x-4">
                <button type="button" @click="resetForm"
                    class="px-6 py-2 border border-gray-300 text-text-base-300 rounded-lg hover:bg-gray-50 transition-colors">
                    Reset
                </button>
                <button type="submit" :disabled="contactStore.loading"
                    class="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    <span v-if="contactStore.loading" class="flex items-center">
                        <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Saving...
                    </span>
                    <span v-else>Save Changes</span>
                </button>
            </div>
        </form>
    </div>
</template>

<script setup>
import { ref, reactive, watch, onMounted } from 'vue'
import { Edit } from 'lucide-vue-next'
import { useContactStore } from '@/stores/contactStore'

const contactStore = useContactStore()
const isEditing = ref(false)

const formData = reactive({
    phone: '',
    email: '',
    address: ''
})

const resetForm = () => {
    formData.phone = contactStore.contactInfo.phone || ''
    formData.email = contactStore.contactInfo.email || ''
    formData.address = contactStore.contactInfo.address || ''
}

const saveContactInfo = async () => {
    const result = await contactStore.updateContactInfo(formData)
    if (result.success) {
        isEditing.value = false
        alert('Contact information updated successfully!')
    } else {
        alert('Failed to update contact information. Please try again.')
    }
}

// Watch for changes in store data
watch(() => contactStore.contactInfo, resetForm, { deep: true })

onMounted(() => {
    contactStore.fetchContactInfo()
})
</script>
