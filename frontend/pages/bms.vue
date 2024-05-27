<script setup>
    import { io } from "https://cdn.socket.io/4.7.5/socket.io.esm.min.js";

    // Data & Error Refs for direct HTML access
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
    // Stream to receive backend data
    const socket = io('http://localhost:3000', {  reconnectionDelayMax: 10000,});
    socket.on('data', (content) => {
        data.value = content;
    });
    socket.on('error', (content) => {
        console.error("SOCKET ERROR: " + content);
        error.value = content;
    });
    // Data for chart renders
    let chartDataObj = {
        labels: [ '1s', '0.5s', 'Now'],
        datasets: [
          {
            label: 'Voltage',
            backgroundColor: 'rgb(0,0,128)',
            borderColor: '#f87979',
            color: '#ffffff',
            fill: {
                target: 'origin',
                above: 'rgba(255, 0, 0,0.3)',   // Area will be red above the origin
            },
            tension: 0.1,
            pointStyle: false,
            data: [40, 20, 12],
          },
        ]
    };
    
    
</script>
<template>
    <div v-if="JSON.stringify(error)!='{}'">
        Error: {{ JSON.stringify(error) }}
    </div>
    <div class="w-full h-full flex justify-center items-center flex-wrap gap-3">
        <h1></h1> 
        <div v-for="item in data" class="w-32 h-32 bg-gray-600 rounded-lg flex justify-center items-center">
            <div v-if="Array.isArray(item)">
                Up for {{ item[0] }} hours, {{ item[1] }} minutes, {{ item[2] }} seconds.
            </div>
            <div v-else>{{ item }}</div>
        </div>
        <div class="w-32 h-32 bg-gray-600 rounded-lg flex justify-center items-center">
            <BarChart :chartData="chartDataObj" />
        </div>
        
    </div>
</template>
