<script setup>
// Stripped for DEMO purposes
</script>

<template>
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