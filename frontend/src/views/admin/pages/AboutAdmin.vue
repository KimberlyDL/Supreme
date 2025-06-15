<template>
    <div class="space-y-6">
        <!-- Header -->
        <div class="bg-white rounded-lg shadow-md p-6">
            <div class="flex items-center justify-between mb-4">
                <h2 class="text-2xl font-bold text-text-base-50">About Us Management</h2>
                <button @click="showCreateModal = true"
                    class="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors">
                    <Plus class="w-4 h-4 inline mr-2" />
                    Add New Tab
                </button>
            </div>
            <p class="text-text-base-300">Manage the content and tabs for your About Us page.</p>
        </div>

        <!-- Tabs List -->
        <div class="bg-white rounded-lg shadow-md p-6">
            <h3 class="text-lg font-semibold text-text-base-50 mb-4">Current Tabs</h3>

            <div v-if="aboutStore.loading" class="flex justify-center py-8">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
            </div>

            <div v-else-if="aboutStore.tabs.length === 0" class="text-center py-8">
                <FileText class="w-12 h-12 text-text-base-400 mx-auto mb-4" />
                <p class="text-text-base-400">No tabs created yet. Add your first tab to get started.</p>
            </div>

            <div v-else class="space-y-4">
                <div v-for="(tab, index) in aboutStore.tabs" :key="tab.id"
                    class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center space-x-4">
                            <div class="flex items-center space-x-2">
                                <button @click="moveTab(index, -1)" :disabled="index === 0"
                                    class="p-1 text-text-base-400 hover:text-text-base-200 disabled:opacity-50 disabled:cursor-not-allowed">
                                    <ChevronUp class="w-4 h-4" />
                                </button>
                                <button @click="moveTab(index, 1)" :disabled="index === aboutStore.tabs.length - 1"
                                    class="p-1 text-text-base-400 hover:text-text-base-200 disabled:opacity-50 disabled:cursor-not-allowed">
                                    <ChevronDown class="w-4 h-4" />
                                </button>
                            </div>
                            <div>
                                <h4 class="font-semibold text-text-base-50">{{ tab.title }}</h4>
                                <p class="text-sm text-text-base-400">
                                    {{ tab.images?.length || 0 }} images, {{ tab.videos?.length || 0 }} videos
                                </p>
                            </div>
                        </div>
                        <div class="flex items-center space-x-2">
                            <button @click="editTab(tab)"
                                class="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                                <Edit class="w-4 h-4" />
                            </button>
                            <button @click="deleteTab(tab.id)"
                                class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                <Trash2 class="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Create/Edit Modal -->
        <div v-if="showCreateModal || editingTab"
            class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div class="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div class="p-6 border-b border-gray-200">
                    <h3 class="text-xl font-semibold text-text-base-50">
                        {{ editingTab ? 'Edit Tab' : 'Create New Tab' }}
                    </h3>
                </div>

                <form @submit.prevent="saveTab" class="p-6 space-y-6">
                    <!-- Tab Title -->
                    <div>
                        <label for="tabTitle" class="block text-sm font-medium text-text-base-200 mb-2">Tab
                            Title</label>
                        <input type="text" id="tabTitle" v-model="tabForm.title" required
                            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                            placeholder="Enter tab title" />
                    </div>

                    <!-- Content -->
                    <div>
                        <label for="tabContent"
                            class="block text-sm font-medium text-text-base-200 mb-2">Content</label>
                        <textarea id="tabContent" v-model="tabForm.content" rows="10"
                            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors resize-none"
                            placeholder="Enter HTML content (you can use HTML tags for formatting)"></textarea>
                        <p class="text-xs text-text-base-400 mt-1">
                            You can use HTML tags like &lt;h2&gt;, &lt;p&gt;, &lt;strong&gt;, &lt;em&gt;, &lt;ul&gt;,
                            &lt;li&gt; for formatting.
                        </p>
                    </div>

                    <!-- Images Section -->
                    <div>
                        <div class="flex items-center justify-between mb-4">
                            <label class="block text-sm font-medium text-text-base-200">Images</label>
                            <button type="button" @click="addImage"
                                class="px-3 py-1 bg-secondary-600 hover:bg-secondary-700 text-white text-sm rounded-lg transition-colors">
                                <Plus class="w-4 h-4 inline mr-1" />
                                Add Image
                            </button>
                        </div>
                        <div class="space-y-4">
                            <div v-for="(image, index) in tabForm.images" :key="index"
                                class="border border-gray-200 rounded-lg p-4">
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label class="block text-sm font-medium text-text-base-300 mb-1">Image
                                            URL</label>
                                        <input type="url" v-model="image.url"
                                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                                            placeholder="https://example.com/image.jpg" />
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-text-base-300 mb-1">Alt
                                            Text</label>
                                        <input type="text" v-model="image.alt"
                                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                                            placeholder="Image description" />
                                    </div>
                                </div>
                                <div class="mt-4">
                                    <label class="block text-sm font-medium text-text-base-300 mb-1">Caption
                                        (optional)</label>
                                    <input type="text" v-model="image.caption"
                                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                                        placeholder="Image caption" />
                                </div>
                                <div class="mt-4 flex justify-end">
                                    <button type="button" @click="removeImage(index)"
                                        class="px-3 py-1 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                        <Trash2 class="w-4 h-4 inline mr-1" />
                                        Remove
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Videos Section -->
                    <div>
                        <div class="flex items-center justify-between mb-4">
                            <label class="block text-sm font-medium text-text-base-200">Videos</label>
                            <button type="button" @click="addVideo"
                                class="px-3 py-1 bg-accent-600 hover:bg-accent-700 text-white text-sm rounded-lg transition-colors">
                                <Plus class="w-4 h-4 inline mr-1" />
                                Add Video
                            </button>
                        </div>
                        <div class="space-y-4">
                            <div v-for="(video, index) in tabForm.videos" :key="index"
                                class="border border-gray-200 rounded-lg p-4">
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label class="block text-sm font-medium text-text-base-300 mb-1">Video
                                            URL</label>
                                        <input type="url" v-model="video.url"
                                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                                            placeholder="https://youtube.com/watch?v=..." />
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-text-base-300 mb-1">Title</label>
                                        <input type="text" v-model="video.title"
                                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                                            placeholder="Video title" />
                                    </div>
                                </div>
                                <div class="mt-4">
                                    <label class="block text-sm font-medium text-text-base-300 mb-1">Description
                                        (optional)</label>
                                    <textarea v-model="video.description" rows="2"
                                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors resize-none"
                                        placeholder="Video description"></textarea>
                                </div>
                                <div class="mt-4 flex justify-end">
                                    <button type="button" @click="removeVideo(index)"
                                        class="px-3 py-1 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                        <Trash2 class="w-4 h-4 inline mr-1" />
                                        Remove
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Modal Actions -->
                    <div class="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                        <button type="button" @click="closeModal"
                            class="px-6 py-2 border border-gray-300 text-text-base-300 rounded-lg hover:bg-gray-50 transition-colors">
                            Cancel
                        </button>
                        <button type="submit" :disabled="aboutStore.loading"
                            class="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                            <span v-if="aboutStore.loading" class="flex items-center">
                                <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Saving...
                            </span>
                            <span v-else>{{ editingTab ? 'Update Tab' : 'Create Tab' }}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { Plus, Edit, Trash2, FileText, ChevronUp, ChevronDown } from 'lucide-vue-next'
import { useAboutStore } from '@/stores/aboutStore'

const aboutStore = useAboutStore()
onMounted(() => {
    aboutStore.fetchAboutTabs()
})
const showCreateModal = ref(false)
const editingTab = ref(null)

const tabForm = reactive({
    title: '',
    content: '',
    images: [],
    videos: []
})

const resetForm = () => {
    tabForm.title = ''
    tabForm.content = ''
    tabForm.images = []
    tabForm.videos = []
}

const editTab = (tab) => {
    editingTab.value = tab
    tabForm.title = tab.title
    tabForm.content = tab.content
    tabForm.images = [...(tab.images || [])]
    tabForm.videos = [...(tab.videos || [])]
}

const closeModal = () => {
    showCreateModal.value = false
    editingTab.value = null
    resetForm()
}

const addImage = () => {
    tabForm.images.push({
        url: '',
        alt: '',
        caption: ''
    })
}

const removeImage = (index) => {
    tabForm.images.splice(index, 1)
}

const addVideo = () => {
    tabForm.videos.push({
        url: '',
        title: '',
        description: ''
    })
}

const removeVideo = (index) => {
    tabForm.videos.splice(index, 1)
}

const saveTab = async () => {
    const tabData = {
        title: tabForm.title,
        content: tabForm.content,
        images: tabForm.images.filter(img => img.url),
        videos: tabForm.videos.filter(vid => vid.url)
    }

    let result
    if (editingTab.value) {
        result = await aboutStore.updateTab(editingTab.value.id, tabData)
    } else {
        result = await aboutStore.createTab(tabData)
    }

    if (result.success) {
        closeModal()
        alert(result.message)
    } else {
        alert(result.message)
    }
}

const deleteTab = async (tabId) => {
    if (confirm('Are you sure you want to delete this tab? This action cannot be undone.')) {
        const result = await aboutStore.deleteTab(tabId)
        if (result.success) {
            alert(result.message)
        } else {
            alert(result.message)
        }
    }
}

const moveTab = async (currentIndex, direction) => {
    const newIndex = currentIndex + direction
    if (newIndex < 0 || newIndex >= aboutStore.tabs.length) return

    const tabs = [...aboutStore.tabs]
    const [movedTab] = tabs.splice(currentIndex, 1)
    tabs.splice(newIndex, 0, movedTab)

    const result = await aboutStore.reorderTabs(tabs)
    if (!result.success) {
        alert(result.message)
    }
}

</script>
