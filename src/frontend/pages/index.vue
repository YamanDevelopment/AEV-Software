<script setup>
// Stripped for DEMO purposes

    let swapped = ref(0);
    function swap() {
        swapped.value++;
        console.log(swapped.value);
    }
</script>

<template>
    <div class="w-screen h-screen flex bg-[#f9fafe] overflow-hidden">
        <button @click="swap()" class="absolute top-5 left-5 bg-gray-200 rounded shadow-md w-24 h-16 flex items-center justify-center">SWAP</button>
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

