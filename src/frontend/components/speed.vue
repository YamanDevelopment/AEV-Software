<script setup>
    // import { io } from "socket.io-client";
    // import { io } from "socket.io";

    let speedToggle = ref(0);
    let speedColor = ref({
        r: '249',
        g: '251',
        b: '253'
    })
    let speed = ref(0)

    function getColorForSpeed(speed) {
        // colors to interpolate between
        const green = { r: 144, g: 238, b: 144 };      
        const yellow = { r: 255, g: 165, b: 0 };       
        const red = { r: 227, g: 87, b: 77 };            

        // (we can change this once we know how fast it can go lol)
        const maxSpeed = 40;

        // ill be honest the rest of this function is AI generated fanciness to interpolate what color it should return dependent on the speed
        speed = Math.max(0, Math.min(speed, maxSpeed));
        let color;
        if (speed <= maxSpeed / 2) {
            // Interpolate between green and yellow
            let t = speed / (maxSpeed / 2);
            color = {
                r: Math.round(green.r + t * (yellow.r - green.r)),
                g: Math.round(green.g + t * (yellow.g - green.g)),
                b: Math.round(green.b + t * (yellow.b - green.b))
            };
        } else {
            // Interpolate between yellow and red
            let t = (speed - (maxSpeed / 2)) / (maxSpeed / 2);
            color = {
                r: Math.round(yellow.r + t * (red.r - yellow.r)),
                g: Math.round(yellow.g + t * (red.g - yellow.g)),
                b: Math.round(yellow.b + t * (red.b - yellow.b))
            };
        }

        return color;
    }

    // Stream to receive backend data (Speed in this case)

    /* PROPER WS IMPLEMENTATION */
    const socket = new WebSocket("ws://localhost:3001");
    // Message Handler
    socket.onmessage = (event) => {
        // Update Speed data
        const split = (event.data).split("|");
        if (split[0] === "gps-data") {
            speed.value = (JSON.parse(split[1])).speed;
            speedColor.value = getColorForSpeed(Number(speed.value));
        }   
    }

    /* RESTAPI IMPLEMENTATION */
    async function getGPSData(route) {
        const response = await $fetch(`http://localhost:3001${route}`, {
            method: 'GET'
        })
        if(route == '/gps/data'){
            speed.value = JSON.parse(response);
            speedColor.value = getColorForSpeed(Number(speed.value));
        }
    }
    
    /* SOCKETIO IMPLEMENTATION */
    /*
    const socket = io('ws://localhost:3001', {  reconnectionDelayMax: 10000,});
    socket.on('message', content => {        
        // Update All data
        const split = content.split("|");
        if (split[0] === "gps-data") {
            speed.value = (JSON.parse(split[1])).speed;
            speedColor.value = getColorForSpeed(Number(speed.value));
        }
    });
    socket.on('error', content => {
        console.error("SOCKET ERROR: " + content);
        error.value = content;
    });
    */

    /* BROKEN WS IMPLEMENTATION */
    /*
    ws.on("error", console.error);

    ws.on("open", function open() {
        setInterval(() => {
            ws.send("gps-data");
            console.log("Requested GPS data from server");
        }, 500);
    });

    ws.on("message", function message(GPSData) {
        console.log("GPS Data Recieved: " + data);
        const split = GPSData.split("|");
        if (split[0] === "gps-data") {
            data.value = JSON.parse(split[1]);
        }
    });

    ws.addEventListener("message", (event) => {
        console.log("Message from server ", event.data);
    });
    */

    onMounted(() => {
        /* TEST DATA, COMMENT WHEN TESTING ACTUAL CAR */    
        /*
        setInterval(() => {
            // ALL THIS WILL BE UPDATED WITH SERIALPORT UPDATE THIS IS STATIC FOR NOW WITH INTERVAL TEST CASE
            if(speed.value >= 40){
                speed.value = 0;
                if(speed.value == 0){
                    speedToggle.value = 0;
                    speedColor.value = getColorForSpeed(speed.value);
                }
                else{
                    speedToggle.value = 20;
                    speedColor.value = getColorForSpeed(speed.value);
                }
            }
            else{
                speed.value += 1;
                if(speed.value == 0){
                    speedToggle.value = 0;
                    speedColor.value = getColorForSpeed(speed.value);
                }
                else{
                    speedToggle.value = 20;
                    speedColor.value = getColorForSpeed(speed.value);
                }
            }
        }, 300);
        */
        setInterval(() => {
            /* SOCKETIO IMPLEMENTATION */
            // socket.send("gps-data");
            // socket.emit("gps-data", "gps-data");
            
            /* WS IMPLEMENTATION */
            socket.send("gps-data");

            /* RESTAPI IMPLEMENTATION - (Make single button to restart BMS and log its status to console when pressed if we use this implementation) */
            // getGPSData('/gps/data');
        }, 550);
    });
</script>

<template>
    <!--Sadly due to Raspberry PI/ARM issues, we had to make the car a static image and video as opposed to a live 3D render :( -->
    <div class="flex flex-col h-screen justify-between items-center bg-[#f9fafe] overflow-hidden">
        <div class="w-screen flex justify-center h-[30vh]">
            <div class="w-[25vw] max-w-[200px] h-[15vh] top-16 bg-[rgba(0,0,0,0.5)] rounded-xl border-4 flex justify-center items-center text-5xl sm:text-7xl font-bold text-white absolute" :style="`border-color: rgb(${speedColor.r}, ${speedColor.g}, ${speedColor.b})`">
                {{ speed }}
            </div>
        </div>
        <div v-if="speed <= 0" class="translate-x-[1px] max-w-[1150px]">
            <img src="/car.png" alt="" />
        </div> 
        <div v-else class="max-w-[1150px]">
            <video src="/car.mp4" autoplay loop></video>
        </div>
    </div>
    <!--This was the 3D render code before we had to pivot implementations-->
    <!--
     <div>
        <div v-if="speed <= 0">
            <carScene :speedToggle="speedToggle" />
        </div> 
        <div v-else>
            <carScene :speedToggle="speedToggle" />
        </div>
        <div class="w-screen flex justify-center">
            <div class="w-[25vw] max-w-[200px] h-[15vh] top-16 bg-[rgba(0,0,0,0.5)] rounded-xl border-4 flex justify-center items-center text-5xl sm:text-7xl font-bold text-white absolute" :style="`border-color: rgb(${speedColor.r}, ${speedColor.g}, ${speedColor.b})`">
                {{ speed }}
            </div>
            <img src="/alsetLogo.png" alt="Alset Logo" class="absolute bottom-3 w-[100px]">
        </div>
    </div> 
    -->
</template> 
