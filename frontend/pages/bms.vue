<script setup>
    import {io} from "https://cdn.socket.io/4.7.5/socket.io.esm.min.js";
    
    // let data = ref({
    //     "voltage": "91.92v",
    //     "cells": "30",
    //     "mean": "3.064v",
    //     "std dev": "0.126v",
    //     "alerts": "pack in LVC",
    //     "current": "-0.2A",
    //     "SOC": "4%",
    //     "uptime": "0 hour(s), 2 minute(s), 15 second(s)"
    // });
    // let error = ref({});
    const socket = io('http://localhost:3000', {  reconnectionDelayMax: 10000,});
    socket.on('data', (content) => {
        data.value = content;
    });
    socket.on('error', (content) => {
        console.error("SOCKET ERROR: " + err);
        error = content;
    });
    
    // export default {
    //     data() {
    //         return {
    //             data: data,
    //             error: error
    //         }
    //     }
    // }
    
</script>
<template>
    <div v-if="error!={}">
        Error: {{ JSON.stringify(error) }}
    </div>
    <div>
        Data: {{ JSON.stringify(data) }}
    </div>
</template>
