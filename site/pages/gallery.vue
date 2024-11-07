<script setup>
    const showImageModal = ref(false);
    const selectedImage = ref();

    const openImageModal = (imageSrc) => {
        selectedImage.value = imageSrc;
        showImageModal.value = true;
    };
    const closeImageModal = () => {
        showImageModal.value = false;
    };

    const images = ref([]);

    onMounted(async () => {
        try {
            const response = await fetch('/api/getImages');
            const data = await response.json();
            console.log('Fetched images:', data.images);
            if (data.images) {
                images.value = data.images;
            } else {
                console.error('No images returned');
            }
        } catch (error) {
            console.error('Failed to load images', error);
        }
    });
</script>

<template>
    <demoNav :enableNote="false" :openNote="openImageModal" class="fixed top-1/3 left-5 z-[9999]" />
    <div class="w-screen flex flex-col gap-16 items-center justify-center py-24 px-8 bg-gray-100">
        <div class="flex flex-col gap-3 md:w-[1500px]">
            <h1 class="text-4xl">AEV Alset Solar Cybersedan 2024 Highlights</h1>
            <p class="text-2xl max-w-[1000px]">These are some pictures from my camera roll for memories and so anyone can see the dashboard interface in use. Images might take a minute to load.</p>
        </div>
        <div v-if="images.length" class="masonry max-w-[1500px]">
            <imageModal 
                :show="showImageModal"
                :imageSrc="selectedImage" 
                @close="closeImageModal"
            />
            <div v-for="(url, index) in images" :key="index" class="bg-gray-200 shadow-lg">
                <img @click="openImageModal(url)" :src="url" :alt="'Image ' + index" class="w-full mb-4 hover:scale-105 transition-all" />
            </div>
        </div>
        <p v-else class="text-center text-gray-600">No images found</p>
    </div>
</template>


<style>
    .masonry{
        columns: 300px
    }
</style>