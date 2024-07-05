import WebSocket from 'ws';
import Logger from '../logger.cjs';
import config from '../config.js';
const logger = new Logger(config);
const ws = new WebSocket('ws://localhost:3001');

ws.on('error', console.error);

ws.on('open', function open() {
	// Prompt the user for input (take it on new line)
	process.stdin.on('data', function(data) {
		ws.send(data.toString().trim());
	});
});

ws.on('message', function message(data) {
	logger.log(`${data}`);
});
