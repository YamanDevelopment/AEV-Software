<script setup>

  const socket = new WebSocket("ws://10.8.0.5:3001");
  socket.onopen = (event) => {
    socket.send("vpn-start");
  }

  let showLaps = ref(false);
  let soundboardShown = ref(true);
  let stopwatchShown = ref(false);

  function swapComponent() {
    showLaps.value = !showLaps.value;
    console.log(showLaps.value);
    if (showLaps.value) {
      soundboardShown.value = false;
      stopwatchShown.value = true;
    } else {
      soundboardShown.value = true;
      stopwatchShown.value = false;
    }
  }
</script>

<template>
  <div class="w-screen h-screen flex bg-[#f9fafe] overflow-hidden">
    <button @click="swapComponent" class="h-20 w-20 bg-gray-200 text-black rounded shadow-md transition-transform absolute top-5 left-[40vw]">
      <p v-if="showLaps == false">Laps</p>
      <p v-if="showLaps == true">Sounds</p>
    </button>
    <speed class="w-[45%] h-full" />
    <div class="flex flex-col w-[55%]">
      <rearCamera class="w-full h-[50%] overflow-hidden p-3" />
      <div class="flex w-full h-[50%]">
        <bms class="h-full w-[50%]" />
        <sounds :class="{ hidden: !soundboardShown, block: soundboardShown }" class="h-full w-[50%]" />
        <stopwatch :class="{ hidden: !stopwatchShown, block: stopwatchShown }" class="h-full w-[50%]" />
      </div>
    </div>
  </div>
</template>
