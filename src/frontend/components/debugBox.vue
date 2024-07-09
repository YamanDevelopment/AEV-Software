<script setup>
    // let protocol 
    // let intervalTime
    // console.log(props.protocol)
    const props = defineProps(['protocol', 'intervalTime'])
    const messages = ref([props.protocol]);

    let socket;
	if (window.location.hostname != "localhost") {
		socket = new WebSocket("ws://10.8.0.5:3001");
	} else {
		socket = new WebSocket("ws://localhost:3001");
	}
    socket.onopen = (event) => {
        socket.send(props.protocol);
    };

    // Message Handler
    socket.onmessage = (event) => {
        // Update All data
        console.log(event.data)
        messages.value.push(event.data);
    }
    // onMounted(() => {
    //     setTimeout(() => {
            
    //     }, 5000);
    // });
</script>

<template>
    <div id="rawDataContainer" class="w-full h-full px-12 flex flex-col gap-3 overflow-scroll border-4 border-black rounded-xl">
        <p v-for="message in messages">
            {{ message }}
        </p>
    </div>
</template>

<script>
    export default {
        props: {
            protocol: {
                type: String
            },
            intervalTime: {
                type: Number
            }
        }
    }
</script>