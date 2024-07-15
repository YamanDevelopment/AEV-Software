<template>
    <div class="max-w-md max-h-[50vh] mx-auto p-4">
        <div class="text-center text-5xl font-bold mb-4 h-[10%]">
            {{ formatTime(elapsed) }}
        </div>
        <div class="flex justify-center h-[10%]">
            <button @click="startStop" :class="startStopClass">
                {{ startStopText }}
            </button>
            <button
                @click="reset"
                class="ml-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 focus:outline-none"
            >
                Reset
            </button>
            <button
                @click="lap"
                class="ml-2 px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 focus:outline-none"
            >
                Lap
            </button>
        </div>
        <div class="py-4 h-[73%]">
            <h3 class="text-lg font-bold mb-2 text-center">Laps</h3>
            <ul v-if="laps.length > 0" class="flex flex-col justify-start items-start flex-wrap gap-x-[15px] content-start max-h-full max-w-full overflow-x-scroll overflow-y-hidden">
                <li v-for="(lap, index) in lapTimes" :key="index" class="text-center h-auto w-auto">
                    <p :class="lap.colorClass">
                        <span class="font-semibold">Lap {{ index + 1 }}:</span> {{ formatTime(lap.time) }}
                    </p>
                </li>
            </ul>
        </div>
    </div>
</template>

<script>
// idk socket thing
let socket;
if (window.location.hostname != "localhost") {
    socket = new WebSocket(`ws://${window.location.hostname}:3001`);
} else {
    socket = new WebSocket("ws://localhost:3001");
}

export default {
    data() {
        return {
            elapsed: 0,
            running: false,
            startTime: 0,
            laps: [],
            intervalId: null,
        };
    },
    computed: {
        startStopText() {
            return this.running ? 'Stop' : 'Start';
        },
        startStopClass() {
            return this.running
                ? 'px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 focus:outline-none'
                : 'px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 focus:outline-none';
        },
        lapTimes() {
            return this.laps.map((lap, index) => {
                const previousLap = index > 0 ? this.laps[index - 1] : 0;
                const lapTime = lap - previousLap;
                const previousLapTime = index > 1 ? this.laps[index - 1] - this.laps[index - 2] : lapTime;
                const colorClass = lapTime < previousLapTime ? 'text-green-500' : 'text-red-500';
                return { time: lapTime, colorClass };
            });
        },
    },
    methods: {
        formatTime(ms) {
            const date = new Date(ms);
            const hours = String(date.getUTCHours()).padStart(2, '0');
            const minutes = String(date.getUTCMinutes()).padStart(2, '0');
            const seconds = String(date.getUTCSeconds()).padStart(2, '0');
            const milliseconds = String(date.getUTCMilliseconds()).padStart(3, '0');
            return `${hours}:${minutes}:${seconds}:${milliseconds}`;
        },
        startStop() {
            if (this.running) {
                this.laps.push(this.elapsed);
                socket.send("lap-stop");
                clearInterval(this.intervalId);
                this.running = false;
            } else {
                this.reset();
                this.laps = [];
                socket.send("lap-start");
                this.startTime = Date.now() - this.elapsed;
                this.intervalId = setInterval(() => {
                    this.elapsed = Date.now() - this.startTime;
                }, 10);
                this.running = true;
            }
        },
        reset() {
            clearInterval(this.intervalId);
            this.elapsed = 0;
            this.running = false;
            this.laps = [];
        },
        lap() {
            socket.send("lap-lap");
            if (this.running) {
                this.laps.push(this.elapsed);
            }
        },
    },
};
</script>
