const totalTime = 3123692.655;
let seconds = totalTime;
let hours = Math.floor(seconds / 3600);
let minutes = Math.floor((seconds % 3600) / 60);
seconds = seconds % 60;

// If the seconds and/or minutes are less than 10, add a leading zero
if (seconds < 10) {
	seconds = `0${seconds}`;
}
if (minutes < 10) {
	minutes = `0${minutes}`;
}

console.log(`${hours}:${minutes}:${seconds.toFixed(3)}`);