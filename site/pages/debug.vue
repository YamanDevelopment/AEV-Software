<script setup>
    // Logic Stripped for DEMO purposes

    const showModal = ref(true)
    const openModal = () => {
        showModal.value = true
    }
    const closeModal = () => {
        showModal.value = false
    }

    let description=`
        This page is arguably one of the coolest when it comes to functionality, although it's not one anyone hoped to be using during the race... Also again, since this is a demo and not connected to the actual car, none of these buttons do anything on your end.
        ㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤ
        Basically what this page allowed us to do during the race was remotely debug and reset any systems if necessary DURING the race while the car was on the track live. Since we used a VPN (hosted by my homelab - shoutout ZachLTech servers), we were able to connect to the cars computer from anywhere in the world in real time, as well as all the services and systems it was managing (i.e. the BMS, GPS, UI, VPN, etc.).
        ㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤ
        As you can see, there are 2 boxes taking up most of the screen. Since the separate BMS system we were interfacing with via serialport was VERY finicky at times, we made those 2 boxes to show both the BMS alerts and all BMS data returned directly from the BMS itself (whereas normally it's parsed into JSON by our backend).
        ㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤ
        The buttons on top are mostly self explanatory—if something went wrong with the system in the car, they would radio to the pits and we could just restart certain components and fix the problem remotely WHILE the system was active with the click of a button.
        ㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤ
        Now, the "Sent Data to Google Sheets" button is where it gets interesting. All of the data coming from the BMS over time into our backend we actually ended up storing in order to view later (parsed of course). But after hours of racing, the data was an insanely large json file, so what we did to view how exactly the car was behaving during certain portions of the race was have the parsed JSON be sent directly to a google sheet. This allowed us to view all battery, speed, and location data that occurred throughout the entire race. Although we didn't get to use it in this way, in theory we could have used the pinpoint location data and amp draw data alongside speed as well to pinpoint exactly what areas of the track made the car struggle or lose speed in order to optimize our technical racing strategy and better help the driver.
    `;
</script>

<template>
    <demoNav :openNote="openModal" class="absolute top-1/3 left-5 z-[9999]" />
    <demoModal
        :show="showModal"
        :title="'Remote System Debug Page'"
        :description="description"
        :sideImage="'/pits.jpg'"
        @close="closeModal"
    />
    <div class="flex flex-col gap-5 w-screen h-screen items-center justify-center">
        <div class="flex gap-4 justify-center items-center w-full">
            <button @click="" class="text-3xl font-semibold ml-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 focus:outline-none">
                Send Data to Google Sheets
            </button>
            <button @click="" class="text-3xl font-semibold ml-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 focus:outline-none">
                Restart BMS
            </button>
            <button @click="" class="text-3xl font-semibold ml-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 focus:outline-none">
                Restart GPS
            </button>
            <button @click="" class="text-3xl font-semibold ml-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 focus:outline-none">
                Restart VPN
            </button>
            <button @click="" class="text-3xl font-semibold ml-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 focus:outline-none">
                Restart Bar
            </button>
        </div>
        <div class="flex gap-4 justify-center items-center w-full h-[90%] px-16">
            <debugBox :timeInterval="600" :protocol="'bms-alerts'" />
            <debugBox :timeInterval="650" :protocol="'bms-debug'" />
        </div>
    </div>
</template>