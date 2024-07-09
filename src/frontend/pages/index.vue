<script setup>
	let socket;
	if (window.location.hostname != "localhost") {
		socket = new WebSocket(`ws://${window.location.hostname}:3001`);
	} else {
		socket = new WebSocket("ws://localhost:3001");
	}
	try {
		socket.onopen = (event) => {
			socket.send("vpn-start");
		};
	} catch (error) {
		console.log(`Error starting VPN (prob bc its already started): ${error}`);
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

