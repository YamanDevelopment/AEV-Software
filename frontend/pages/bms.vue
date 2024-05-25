<script setup>
    import {io} from "https://cdn.socket.io/4.7.5/socket.io.esm.min.js";
    
    let data = ref({
        "voltage":"91.84v",
        "cells":"30(notlocked)",
        "mean":"3.062v",
        "stddev":"0.037v",
        "alerts":"notlocked",
        "current":"-0.2A",
        "SOC":"4%",
        "uptime":["0","34","26"]
    })
    let error = ref({});
    const socket = io('http://localhost:3000', {  reconnectionDelayMax: 10000,});
    socket.on('data', (content) => {
        data.value = content;
    });
    socket.on('error', (content) => {
        console.error("SOCKET ERROR: " + err);
        error = content;
    });
    
</script>
<template>
    <div v-if="JSON.stringify(error)!='{}'">
        Error: {{ JSON.stringify(error) }}
    </div>
    <div class="w-full h-full flex justify-center items-center flex-wrap gap-3">
        <h1></h1> 
        <div v-for="item in data" class="w-32 h-32 bg-gray-600 rounded-lg flex justify-center items-center">
            <div v-if="item == 'uptime'">uptime</div>
            <div v-else>{{ item }}</div>
        </div>
    </div>
</template>
