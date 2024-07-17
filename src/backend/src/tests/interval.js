// Code to test if an interval will full-stop the function when the function clears the interval
// ok so it doesn't, sick
let i = 0;
const intervalID = setInterval(() => {
  	console.log('Interval is running, stopping it');
	i++;
	if (i > 3) {
		clearInterval(intervalID);
		console.log('Interval stopped');
	}
	console.log('After i check');

}, 1000);