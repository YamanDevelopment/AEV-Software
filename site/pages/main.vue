<script setup>
    // Logic Stripped for DEMO purposes
    
    useSeoMeta({
        title: 'AEV Software - Solar Car Dashboard DEMO',
        ogTitle: 'AEV Software - Solar Car Dashboard DEMO',
        description: 'This is the software demo for the Alset Solar Cybersedan dashboard system which includes details, images, simulations, and more.',
        ogDescription: 'This is the software demo for the Alset Solar Cybersedan dashboard system which includes details, images, simulations, and more.',
        ogImage: 'https://private-user-images.githubusercontent.com/109718204/354929556-48044884-80c2-424a-8b2b-e2ced255b7f2.png?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3MzA2OTgyMjIsIm5iZiI6MTczMDY5NzkyMiwicGF0aCI6Ii8xMDk3MTgyMDQvMzU0OTI5NTU2LTQ4MDQ0ODg0LTgwYzItNDI0YS04YjJiLWUyY2VkMjU1YjdmMi5wbmc_WC1BbXotQWxnb3JpdGhtPUFXUzQtSE1BQy1TSEEyNTYmWC1BbXotQ3JlZGVudGlhbD1BS0lBVkNPRFlMU0E1M1BRSzRaQSUyRjIwMjQxMTA0JTJGdXMtZWFzdC0xJTJGczMlMkZhd3M0X3JlcXVlc3QmWC1BbXotRGF0ZT0yMDI0MTEwNFQwNTI1MjJaJlgtQW16LUV4cGlyZXM9MzAwJlgtQW16LVNpZ25hdHVyZT0zNTAzNmEyZmU1ODQyZThkN2E0MTgwNjc4NGJlMTY4YjA1ODA0OWNlZGRkZDE0NDdiZmQxOTdhNzE5YmQwZTRmJlgtQW16LVNpZ25lZEhlYWRlcnM9aG9zdCJ9.3AMQc6Dgp8PZ9mQT6FuSgpezhMnI1-Z8LkbKqDqBL8s',
    });

    let swapped = ref(0);
    function swap() {
        swapped.value++;
        console.log(swapped.value);
    }

    const showModal = ref(true)
    const openModal = () => {
        showModal.value = true
    }
    const closeModal = () => {
        showModal.value = false
    }

    let description=`
        What you're seeing here is a simulation of the dashboards main homepage. On the left side is our Tesla inspired design to work as a live speedometer. It displays the cars speed on top, and at the bottom is a 3D render of the car on a racetrack which goes faster or slower on the track depending on its actual speed.
        ㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤ
        On the top right is typically where you'd see the live rear view camera feed on the actual car, but since we can't access that in the demo, I just put a video which was taken during the race showing off how we viewed and interacted with the cars system/telemetry both live and remotely (the car was in the pits at the time of recording).
        ㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤ
        On the bottom right we have 2 sections. The left one is our live BMS (Battery Management System) telemetry system which displays critical info for the drivers spotter and pits to watch closely. The data displayed includes the battery packs voltage, amp draw, uptime, mean voltage per cell, etc. as well as live graphs of the voltage and current for better decision making.
        ㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤ
        The right one is interchangeable for the purpose of this demo. First, you'll see our original custom soundboard which was used for the cars custom horn system before we ended up replacing it with different software. But, if you hit the "Stopwatch" button at the top left of the screen, it'll change to what we actually used during the race which was a simple stopwatch system so we could keep track of our laps and see if we gained or lost time during each lap. The lap data was also connected to our backend which we used to store all our cars telemetry for future use.
        ㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤ ㅤ ㅤ 
        I also just quickly want to mention how these simulations aren't the only thing we had on the actual cars dashboard. Since it was running Hyprland on a Raspberry Pi 5, we also had extra software loaded on including a custom bar for navigation, soundux for our custom horn system, a tmux debug terminal, and more.
    `;

</script>

<template>
    <demoNav :openNote="openModal" class="absolute top-1/3 left-5 z-[9999]" />
    <demoModal
        :show="showModal"
        :title="'Main Page Simulation'"
        :description="description"
        :sideImage="'/greatcarpic.jpg'"
        @close="closeModal"
    />
    <div class="w-screen h-screen flex bg-[#f9fafe] overflow-hidden">
        <button @click="swap()" class="absolute top-5 left-5 bg-gray-200 rounded shadow-md w-24 h-16 flex items-center justify-center">
            <span v-if="(swapped % 2) == 0">Stopwatch</span>
            <span v-if="(swapped % 2) == 1">Soundboard</span>
        </button>
        <speed class="w-[45%] h-full" />
        <div class="flex flex-col w-[55%]">
            <rearCamera class="w-full h-[50%] overflow-hidden p-3" />
            <div class="flex w-full h-[50%]">
                <bms class="h-full w-[50%]" />
                <sounds v-if="(swapped % 2) == 0" class="h-full w-[50%]" />
				<stopwatch v-if="(swapped % 2) == 1" class="h-full w-[50%]" />
            </div>
        </div>
    </div>
</template>

