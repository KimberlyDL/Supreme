<template>
    <div class="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 py-12 px-4 sm:px-6 lg:px-8">
        <div class="max-w-4xl mx-auto">
            <!-- Header -->
            <div class="text-center mb-12">
                <h1 class="text-4xl font-bold text-text-base-50 mb-4">Contact Us</h1>
                <p class="text-lg text-text-base-300 max-w-2xl mx-auto">
                    Get in touch with us. We'd love to hear from you and help with any questions you may have.
                </p>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <!-- Contact Information -->
                <div class="bg-white rounded-2xl shadow-xl p-8">
                    <h2 class="text-2xl font-bold text-text-base-50 mb-6">Get In Touch</h2>

                    <div v-if="contactStore.loading" class="flex justify-center py-8">
                        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                    </div>

                    <div v-else class="space-y-6">
                        <!-- Phone -->
                        <div class="flex items-start space-x-4">
                            <div class="flex-shrink-0">
                                <div class="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                                    <Phone class="w-6 h-6 text-primary-600" />
                                </div>
                            </div>
                            <div>
                                <h3 class="text-lg font-semibold text-text-base-50">Phone</h3>
                                <p class="text-text-base-300">{{ contactStore.contactInfo.phone || 'Not available' }}
                                </p>
                            </div>
                        </div>

                        <!-- Email -->
                        <div class="flex items-start space-x-4">
                            <div class="flex-shrink-0">
                                <div class="w-12 h-12 bg-secondary-100 rounded-lg flex items-center justify-center">
                                    <Mail class="w-6 h-6 text-secondary-600" />
                                </div>
                            </div>
                            <div>
                                <h3 class="text-lg font-semibold text-text-base-50">Email</h3>
                                <p class="text-text-base-300">{{ contactStore.contactInfo.email || 'Not available' }}
                                </p>
                            </div>
                        </div>

                        <!-- Address -->
                        <div class="flex items-start space-x-4">
                            <div class="flex-shrink-0">
                                <div class="w-12 h-12 bg-accent-100 rounded-lg flex items-center justify-center">
                                    <MapPin class="w-6 h-6 text-accent-600" />
                                </div>
                            </div>
                            <div>
                                <h3 class="text-lg font-semibold text-text-base-50">Address</h3>
                                <p class="text-text-base-300">{{ contactStore.contactInfo.address || 'Not available' }}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Contact Form -->
                <div class="bg-white rounded-2xl shadow-xl p-8">
                    <h2 class="text-2xl font-bold text-text-base-50 mb-6">Send Message</h2>

                    <form @submit.prevent="submitForm" class="space-y-6">
                        <!-- <div>
                            <label for="name" class="block text-sm font-medium text-text-base-200 mb-2">Name</label>
                            <input type="text" id="name" v-model="form.name" required
                                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                                placeholder="Your name" />
                        </div>

                        <div>
                            <label for="email" class="block text-sm font-medium text-text-base-200 mb-2">Email</label>
                            <input type="email" id="email" v-model="form.email" required
                                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                                placeholder="your@email.com" />
                        </div>

                        <div>
                            <label for="subject"
                                class="block text-sm font-medium text-text-base-200 mb-2">Subject</label>
                            <input type="text" id="subject" v-model="form.subject" required
                                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                                placeholder="Message subject" />
                        </div>

                        <div>
                            <label for="message"
                                class="block text-sm font-medium text-text-base-200 mb-2">Message</label>
                            <textarea id="message" v-model="form.message" required rows="5"
                                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors resize-none"
                                placeholder="Your message..."></textarea>
                        </div> -->

                        <div>
                            <span v-if="formError" class="text-red-500 text-sm">
                                {{ formError }}
                            </span>
                        </div>
                        <!-- Name -->
                        <div>
                            <label for="name" class="block text-sm font-medium text-text-base-200 mb-2">Name</label>
                            <input type="text" id="name" v-model="form.name"
                                class="w-full px-4 py-3 border rounded-lg focus:ring-2 transition-colors" :class="{
                                    'border-red-500': v$.name.$error,
                                    'border-gray-300': !v$.name.$error
                                }" placeholder="Your name" />
                            <span v-if="v$.name.$error" class="text-red-500 text-sm">
                                Name is required.
                            </span>
                        </div>

                        <!-- Email -->
                        <div>
                            <label for="email" class="block text-sm font-medium text-text-base-200 mb-2">Email</label>
                            <input type="email" id="email" v-model="form.email"
                                class="w-full px-4 py-3 border rounded-lg focus:ring-2 transition-colors" :class="{
                                    'border-red-500': v$.email.$error,
                                    'border-gray-300': !v$.email.$error
                                }" placeholder="your@email.com" />
                            <span v-if="v$.email.$error" class="text-red-500 text-sm">
                                {{ v$.email.email.$response === false ? 'Invalid email format' : 'Email is required.' }}
                            </span>
                        </div>

                        <!-- Subject -->
                        <div>
                            <label for="subject"
                                class="block text-sm font-medium text-text-base-200 mb-2">Subject</label>
                            <input type="text" id="subject" v-model="form.subject"
                                class="w-full px-4 py-3 border rounded-lg focus:ring-2 transition-colors" :class="{
                                    'border-red-500': v$.subject.$error,
                                    'border-gray-300': !v$.subject.$error
                                }" placeholder="Message subject" />
                            <span v-if="v$.subject.$error" class="text-red-500 text-sm">
                                Subject is required.
                            </span>
                        </div>

                        <!-- Message -->
                        <div>
                            <label for="message"
                                class="block text-sm font-medium text-text-base-200 mb-2">Message</label>
                            <textarea id="message" v-model="form.message" rows="5"
                                class="w-full px-4 py-3 border rounded-lg focus:ring-2 transition-colors resize-none"
                                :class="{
                                    'border-red-500': v$.message.$error,
                                    'border-gray-300': !v$.message.$error
                                }" placeholder="Your message..."></textarea>
                            <span v-if="v$.message.$error" class="text-red-500 text-sm">
                                {{ v$.message.minLength.$response === false ?
                                    'Message should be at least 10 characters.' : 'Message is required.' }}
                            </span>
                        </div>


                        <button type="submit" :disabled="submitting"
                            class="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                            <span v-if="submitting" class="flex items-center justify-center">
                                <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Sending...
                            </span>
                            <span v-else>Send Message</span>
                        </button>
                    </form>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { Phone, Mail, MapPin } from 'lucide-vue-next'
import { useContactStore } from '@/stores/contactStore'
import useVuelidate from '@vuelidate/core'
import { required, email as emailRule, minLength, maxLength  } from '@vuelidate/validators'

const contactStore = useContactStore()
const submitting = ref(false)
const formError = ref('');

const form = ref({
    name: '',
    email: '',
    subject: '',
    message: ''
})

onMounted(() => {
    contactStore.fetchContactInfo()
})

const rules = computed(() => ({
    name: { required },
    email: { required, email: emailRule },
    subject: { required, maxLength: maxLength(100) },
    message: { required, minLength: minLength(10) }
}))

const v$ = useVuelidate(rules, form)


const submitForm = async () => {
    v$.value.$touch()
    if (v$.value.$invalid) return

    submitting.value = true
    try {
        await contactStore.sendEmail({ ...form.value })

        // Reset form
        form.value = {
            name: '',
            email: '',
            subject: '',
            message: ''
        }
        v$.value.$reset()
    } catch (error) {
        console.error('Error sending message:', error)

        const formErr = error.message;

        if (error.formError) {
            formError.value = formErr;
        }
    } finally {
        submitting.value = false
    }
}

// const submitForm = async () => {
//     submitting.value = true
//     try {

//         // Reset form
//         form.value = {
//             name: '',
//             email: '',
//             subject: '',
//             message: ''
//         }

//         await contactStore.sendEmail(form.value);

//         // alert('Message sent successfully!')
//     } catch (error) {
//         console.error('Error sending message:', error)
//     } finally {
//         submitting.value = false
//     }
// }
</script>
