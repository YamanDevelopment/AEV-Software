<script setup>

    useSeoMeta({
        title: 'AEV Software - Solar Car Dashboard DEMO',
        ogTitle: 'AEV Software - Solar Car Dashboard DEMO',
        description: 'This is the software demo for the Alset Solar Cybersedan dashboard system which includes details, images, simulations, and more.',
        ogDescription: 'This is the software demo for the Alset Solar Cybersedan dashboard system which includes details, images, simulations, and more.',
        ogImage: 'https://private-user-images.githubusercontent.com/109718204/354929556-48044884-80c2-424a-8b2b-e2ced255b7f2.png?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3MzA2OTgyMjIsIm5iZiI6MTczMDY5NzkyMiwicGF0aCI6Ii8xMDk3MTgyMDQvMzU0OTI5NTU2LTQ4MDQ0ODg0LTgwYzItNDI0YS04YjJiLWUyY2VkMjU1YjdmMi5wbmc_WC1BbXotQWxnb3JpdGhtPUFXUzQtSE1BQy1TSEEyNTYmWC1BbXotQ3JlZGVudGlhbD1BS0lBVkNPRFlMU0E1M1BRSzRaQSUyRjIwMjQxMTA0JTJGdXMtZWFzdC0xJTJGczMlMkZhd3M0X3JlcXVlc3QmWC1BbXotRGF0ZT0yMDI0MTEwNFQwNTI1MjJaJlgtQW16LUV4cGlyZXM9MzAwJlgtQW16LVNpZ25hdHVyZT0zNTAzNmEyZmU1ODQyZThkN2E0MTgwNjc4NGJlMTY4YjA1ODA0OWNlZGRkZDE0NDdiZmQxOTdhNzE5YmQwZTRmJlgtQW16LVNpZ25lZEhlYWRlcnM9aG9zdCJ9.3AMQc6Dgp8PZ9mQT6FuSgpezhMnI1-Z8LkbKqDqBL8s',
    });

    const showModal = ref(true)
    const openModal = () => {
        showModal.value = true
    }
    const closeModal = () => {
        showModal.value = false
    }

    let description=`
        So sadly this page can't have as much of a cool simulation as the main page since it doesn't have access to the cars actual cameras. But in lieu of this, you'll see an old video from when we were still developing the dashboard before our race and it demonstrates how the cameras page worked (although at the time, the rear and side cameras weren't mounted so the feed in the demo isn't what it typically looks like)
        ㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤ
        Layout wise though, as you see in the video, the top half of the page is the rear camera feed while the bottom left and right sections are the left and right blindspot camera feeds. When any of them are tapped on the dashboard touchscreen, it would grow to be fullscreen for a better view until tapped again.
    `;
</script>

<template>
    <demoNav :enableNote="true" :openNote="openModal" class="absolute top-1/3 left-5 z-[9999]" />
    <demoModal
        :show="showModal"
        :title="'Rear and Side Cameras'"
        :description="description"
        :sideImage="'/cameras.jpg'"
        @close="closeModal"
    />
    <div class="flex flex-col justify-between items-center bg-[#f9fafe]">
        <img class="absolute opacity-40 w-[250px] z-[9999] top-4" src="/alsetSideLogo.png" alt="">
        <div class="flex w-full absolute bottom-0 justify-between">
            <img class="opacity-40 w-[150px] z-[9999] top-4" src="/blindSpot.png" alt="">
            <img class="opacity-40 w-[150px] z-[9999] top-4" style="transform: scale(-1, 1);" src="/blindSpot.png" alt="">
        </div>
        <div class="w-screen h-screen flex justify-center items-center">
            <video class="rounded-lg w-[75vw]" src="/camerademo.mp4" muted autoplay controls loop></video>
        </div>
    </div>
</template>
  
<script>
    export default {
        data() {
            return {
                videoDevices: [],
                fullScreen: null,
            };
        },
        async mounted() {
            await this.getVideoDevices();
            if (this.videoDevices.length > 0) {
                this.videoDevices.forEach((device, index) => {
                    this.startStream(device.deviceId, index);
                });
            }
        },
        methods: {
            async getVideoDevices() {
                try {
                    const devices = await navigator.mediaDevices.enumerateDevices();
                    this.videoDevices = devices.filter(device => device.kind === 'videoinput').slice(0, 3); // Get the first 3 cameras
                } catch (err) {
                    console.error('Error accessing video devices: ', err);
                }
            },
            async startStream(deviceId, index) {
                try {
                    const videoElement = this.$refs[`videoElement${index}`];
                    if (videoElement) {
                    const stream = await navigator.mediaDevices.getUserMedia({
                        video: { deviceId: { exact: deviceId } }
                    });
                    videoElement.srcObject = stream;
                    }
                } catch (err) {
                    console.error('Error accessing the camera: ', err);
                }
            },
            toggleFullScreen(index) {
                this.fullScreen = this.fullScreen === index ? null : index;
            }
        }
    }
</script>

<style scoped>
    .full-screen {
        @apply absolute w-full h-full z-50;
    }
</style>
