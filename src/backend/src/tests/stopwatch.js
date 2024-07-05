import Stopwatch from 'statman-stopwatch';

// start stopwatch, wait 1 second, split, wait 1 second, stop

const stopwatch = new Stopwatch();
stopwatch.start();
setTimeout(() => {
	stopwatch.split();
	console.log('Split:', stopwatch.read(3, 's'));
	stopwatch.unsplit();
}, 1000);
setTimeout(() => {
	stopwatch.stop();
	console.log('Total:', stopwatch.read(3, 's'));
	stopwatch.restart();
	// stopwatch.split();
	// console.log('Split:', stopwatch.read(3, 's'));
}, 2000);
setTimeout(() => {
	console.log('Total:', stopwatch.read(3, 's'));
}, 3000);
