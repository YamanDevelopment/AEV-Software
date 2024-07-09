<script setup>
	let socket;
	if (window.location.hostname != "localhost") {
		socket = new WebSocket("ws://10.8.0.5:3001");
	} else {
		socket = new WebSocket("ws://localhost:3001");
	}
	socket.onopen = (event) => {
		socket.send("vpn-start");
	}
</script>

<template>
    <div class="w-screen h-screen flex bg-[#f9fafe] overflow-hidden">
        <speed class="w-[45%] h-full" />
        <div class="flex flex-col w-[55%]">
            <rearCamera class="w-full h-[50%] overflow-hidden p-3" />
            <div class="flex w-full h-[50%]">
                <bms class="h-full w-[50%]" />
                <!-- <sounds class="h-full w-[50%]" /> -->
				<stopwatch class="h-full w-[50%]" />
            </div>
        </div>
    </div>
</template>

