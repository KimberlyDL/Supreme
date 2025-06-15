<template>
    <div class="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 py-12 px-4 sm:px-6 lg:px-8">
        <div class="max-w-6xl mx-auto">
            <!-- Header -->
            <div class="text-center mb-12">
                <h1 class="text-4xl font-bold text-text-base-50 mb-4">About Us</h1>
                <p class="text-lg text-text-base-300 max-w-2xl mx-auto">
                    Learn more about our company, mission, and the people behind our success.
                </p>
            </div>

            <div v-if="aboutStore.loading" class="flex justify-center py-12">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
            </div>

            <div v-else-if="aboutStore.tabs.length === 0" class="text-center py-12">
                <div class="bg-white rounded-2xl shadow-xl p-12">
                    <FileText class="w-16 h-16 text-text-base-400 mx-auto mb-4" />
                    <h3 class="text-xl font-semibold text-text-base-200 mb-2">No Content Available</h3>
                    <p class="text-text-base-400">The about us content is being updated. Please check back later.</p>
                </div>
            </div>

            <div v-else class="bg-white rounded-2xl shadow-xl overflow-hidden">
                <!-- Tab Navigation -->
                <div class="border-b border-gray-200">
                    <nav class="flex space-x-8 px-6" aria-label="Tabs">
                        <button v-for="(tab, index) in aboutStore.tabs" :key="tab.id" @click="activeTab = index" :class="[
                            'py-4 px-1 border-b-2 font-medium text-sm transition-colors',
                            activeTab === index
                                ? 'border-primary-500 text-primary-600'
                                : 'border-transparent text-text-base-400 hover:text-text-base-200 hover:border-gray-300'
                        ]">
                            {{ tab.title }}
                        </button>
                    </nav>
                </div>

                <!-- Tab Content -->
                <div class="p-8">
                    <div v-if="currentTab" class="space-y-8">
                        <div v-html="currentTab.content" class="prose prose-lg max-w-none"></div>

                        <!-- Images -->
                        <div v-if="currentTab.images && currentTab.images.length > 0"
                            class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div v-for="image in currentTab.images" :key="image.id"
                                class="rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                                <img :src="image.url" :alt="image.alt || 'About us image'"
                                    class="w-full h-48 object-cover" />
                                <div v-if="image.caption" class="p-3 bg-gray-50">
                                    <p class="text-sm text-text-base-300">{{ image.caption }}</p>
                                </div>
                            </div>
                        </div>

                        <!-- Videos -->
                        <div v-if="currentTab.videos && currentTab.videos.length > 0" class="space-y-6">
                            <div v-for="video in currentTab.videos" :key="video.id"
                                class="bg-gray-100 rounded-lg overflow-hidden">
                                <div class="aspect-w-16 aspect-h-9">
                                    <iframe :src="getEmbedUrl(video.url)" :title="video.title || 'Video'"
                                        frameborder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowfullscreen class="w-full h-full"></iframe>
                                </div>
                                <div v-if="video.description" class="p-4">
                                    <p class="text-text-base-300">{{ video.description }}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { FileText } from 'lucide-vue-next'
import { useAboutStore } from '@/stores/aboutStore'

const aboutStore = useAboutStore()
onMounted(() => {
    aboutStore.fetchAboutTabs()
})
const activeTab = ref(0)

const currentTab = computed(() => {
    return aboutStore.tabs[activeTab.value] || null
})

const getEmbedUrl = (url) => {
    // Convert YouTube URLs to embed format
    if (url.includes('youtube.com/watch?v=')) {
        const videoId = url.split('v=')[1].split('&')[0]
        return `https://www.youtube.com/embed/${videoId}`
    } else if (url.includes('youtu.be/')) {
        const videoId = url.split('youtu.be/')[1].split('?')[0]
        return `https://www.youtube.com/embed/${videoId}`
    }
    // Add more video platform support as needed
    return url
}

</script>

<style scoped>
.prose {
    color: var(--color-text-base-200);
}

.prose h1,
.prose h2,
.prose h3,
.prose h4,
.prose h5,
.prose h6 {
    color: var(--color-text-base-50);
}

.prose a {
    color: var(--color-primary-600);
}

.prose a:hover {
    color: var(--color-primary-700);
}

.aspect-w-16 {
    position: relative;
    padding-bottom: 56.25%;
    /* 16:9 aspect ratio */
}

.aspect-h-9 iframe {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
}
</style>
