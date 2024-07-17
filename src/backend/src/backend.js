// Packages
import { SerialPort, DelimiterParser } from 'serialport';
import { Daemon, Listener } from 'node-gpsd';
import { WebSocketServer } from 'ws';
import express from 'express';
import fs from 'fs';
import child_process, { exec, execSync } from 'child_process';
import dns from 'dns';
import util from 'util';

import AEVLaps from './lap.js';

class AEVBackend {
	constructor(config, logger) {
		this.logger = logger;
		this.config = config;
		this.ports = {
			BMS: {
				enabled: false,
				port: null,
				parser: null,
				data: {
					voltage: '0v',
					cells: '0',
					mean: '0v',
					stddev: '0v',
					alerts: [],
					current: '0A',
					SOC: '0%',
					uptime: [ '0', '0', '0' ],
				},
				alerts: {
					parser: null,
					list: [],
				},
				debug: {
					parser: null,
					interval: false,
					waiting: false,
					noRes: 0,
				},
			},
			GPS: {
				enabled: false,
				daemon: null,
				listener: null,
				data: {
					speed: 0,
					lon: 0,
					lat: 0,
				},
			},
		};

		this.continue = {
			BMS: true,
			GPS: true,
		};

		this.api = null;
		this.wss = null;
		this.laps = new AEVLaps(this);
	}

	async start() {
		// this.logger.warn("Logger initialized in backend!");
		await this.initBMS();
		await this.initGPS();
		await this.initSocket();
		await this.initAPI();
	}

	async initBMS() {
		// Initialize serial port for BMS
		if (fs.existsSync(this.config.BMS.path)) {
			this.continue.BMS = 2;
			this.logger.debug('BMS serial port is being opened...');
			this.ports.BMS.enabled = true;
			this.ports.BMS.port = new SerialPort({
				path: this.config.BMS.path,
				baudRate: this.config.BMS.baudRate,
				autoOpen: false,
			});

			this.ports.BMS.parser = this.ports.BMS.port.pipe(new DelimiterParser({
				delimiter: 'sh',
			}));
			this.ports.BMS.alerts.parser = this.ports.BMS.port.pipe(new DelimiterParser({
				delimiter: '\n',
			}));

			// console.log(this.logger)
			this.ports.BMS.port.on('open', () => {
				// const logger = this.logger;
				this.logger.success('BMS serial port opened');
				this.continue.BMS = 3;
				this.ports.BMS.debug.noRes = 0;

				// check tests/old-bms-init.js for old code

				if (!this.ports.BMS.debug.interval) {
					this.ports.BMS.debug.interval = true;
					this.ports.BMS.debug.waiting = false;

					setInterval(async () => {
						if (this.continue.BMS !== 3) {
							if (this.continue.BMS === 0 && !this.ports.BMS.port.isOpen) {
								this.logger.debug('BMS serial port is not open, restarting BMS');
								await this.initBMS();
							} else if (this.continue.BMS === 1 && this.ports.BMS.port.isOpen) {
								this.logger.debug('BMS serial port is closing, ignoring request');
							} else if (this.continue.BMS === 2) {
								this.logger.debug('BMS serial port is opening, ignoring request');
							} else {
								this.logger.debug('BMS serial port is in an unknown state, restarting BMS');
								await this.stopBMS();
								await this.initBMS();
							}
						} else if (this.continue.BMS === 3 && this.ports.BMS.port.isOpen) {
							if (this.ports.BMS.debug.noRes >= 3) {
								this.logger.warn('BMS serial port is not responding, putting it into an unknown state for restart');
								this.continue.BMS = -1;
							}

							this.ports.BMS.port.write('\nsh\n', (error) => {
								if (error) {
									this.logger.warn('BMS write failed: ' + error);
									this.ports.BMS.debug.noRes += 1;
								}
							});

							if (this.ports.BMS.debug.waiting) {
								this.ports.BMS.debug.noRes += 1;
								// if (this.ports.BMS.debug.noRes >= 3) {
								// 	this.logger.warn('BMS serial port is not responding, putting it into an unknown state for restart');
								// 	this.continue.BMS = -1;
								// }
							}
							this.logger.debug('Wrote all commands, waiting for data response');
							this.ports.BMS.debug.waiting = true;
						} else {
							this.continue.BMS = -1;
						}
					}, 500);
				}


			});
			this.ports.BMS.port.on('error', (error) => {
				this.logger.warn(`BMS serial port error: ${error}`);
			});
			this.ports.BMS.port.on('close', () => {
				this.logger.debug('BMS serial port closed');
				this.continue.BMS = 0;
			});
			this.ports.BMS.port.on('drain', () => {
				this.logger.warn('BMS serial port drained (write failed)');
			});

			this.ports.BMS.parser.on('data', (data) => {
				try {
					this.parseBMSData(data.toString().split('\n'));
				} catch {
					this.logger.warn('Error calling BMS data parser + ' + error);
				}

			});
			this.ports.BMS.alerts.parser.on('data', (data) => {
				const possibleAlert = this.parseAlert(data.toString());
				if (possibleAlert) this.ports.BMS.alerts.list.push(possibleAlert);
			});

			this.ports.BMS.port.open((err) => {
				if (err) {
					this.logger.fail('Error opening BMS serial port: ' + err);
					child_process.exec(`sudo fuser -k ${this.config.BMS.path}`, (error, stdout, stderr) => {
						if (error) {
							this.logger.warn('Error killing BMS serial port process: ' + error);
						}
						if (stdout) {
							this.logger.success('Killed BMS serial port process: ' + stdout);
						}
						if (stderr) {
							this.logger.warn('Error killing BMS serial port process: ' + stderr);
						}
					});
					this.continue.BMS = 0;
				}
			});
		} else {
			this.logger.fail('BMS serial port not found at ' + this.config.BMS.path);
		}

	}

	async initGPS() {
		// Initialize serial port for GPS
		if (fs.existsSync(this.config.GPS.path)) {
			this.ports.GPS.enabled = true;
			this.ports.GPS.nores = 0;

			this.ports.GPS.listener = new Listener({
				port: 2947,
				hostname: 'localhost',
				logger: {
					info: this.logger.debug,
					warn: this.logger.debug,
					error: this.logger.fail,
				},
				parse: true,
			});
			this.ports.GPS.listener.connect(() => {
				this.logger.success('Connected to gpsd');
				this.ports.GPS.listener.watch();

				

				if (this.ports.GPS.nores >= 10) {
					this.logger.warn('GPS data not being received, restarting GPS');
					this.continue.GPS = -1;
				}
				if (this.continue.GPS === -1) {
					this.stopGPS();
					this.initGPS();
				}
			});
			this.ports.GPS.listener.on('TPV', (data) => {
				this.parseGPSData(data);
			});

		} else {
			this.logger.fail('GPS device not found at ' + this.config.GPS.path);
		}
	}

	async stopGPS() {
		this.continue.GPS = false;
		this.ports.GPS.listener.unwatch(() => {
			this.logger.warn('Listener stopped watching gpsd');
		});
		this.ports.GPS.listener.disconnect(() => {
			this.logger.warn('Disconnected listener from gpsd');
		});
		// this.ports.GPS.daemon.stop(() => {
		// 	this.logger.warn('GPS daemon stopped');
		// });
	}

	async stopBMS() {
		this.continue.BMS = 1;
		await this.ports.BMS.port.close();
		// this.continue.BMS = 0;
		// this.logger.debug('BMS serial port closed');
	}

	async initSocket() {
		// Initialize WebSocket server
		this.wss = new WebSocketServer({
			port: this.config.ports.socket,
		});


		this.wss.on('connection', (ws) => {
			this.logger.success('Client connected to WebSocket server');
			ws.on('message', async (message) => {
				message = message.toString();
				const prefix = message;
				let reply;
				this.logger.debug('Received message from client: ' + message);
				if (message === 'bms-data') {
					this.logger.debug('Client requested BMS data, sending it over');
					reply = JSON.stringify(this.ports.BMS.data);
				} else if (message === 'gps-data') {
					this.logger.debug('Client requested GPS data, sending it over');
					reply = JSON.stringify(this.ports.GPS.data);
				} else if (message === 'gps-restart') {
					try {
						try {
							await this.stopGPS();
						} catch (error) {
							this.logger.warn('Error stopping GPS: ' + error);
						}
						try {
							await this.initGPS();
						} catch (error) {
							this.logger.warn('Error starting GPS: ' + error);
						}
						reply = 'GPS restarted';
						this.logger.success('GPS restarted');
					} catch (error) {
						this.logger.warn('Error restarting GPS: ' + error);
						console.log(error);
					}
				} else if (message === 'bms-restart') {
					try {
						await this.stopBMS();
						await this.initBMS();
						reply = 'BMS restarted';
						this.logger.success('BMS restarted');
					} catch (error) {
						this.logger.warn('Error restarting BMS: ' + error);
					}
				} else if (message === 'bms-alerts') {
					try {
						this.ports.BMS.alerts.parser.on('data', (data) => {
							const possibleAlert = this.parseAlert(data.toString());
							if (possibleAlert) ws.send(JSON.stringify(possibleAlert));
						});
						ws.send('BMS alert mode enabled');
					} catch (error) {
						this.logger.warn('Error enabling BMS alert mode: ' + error);
					}
				} else if (message === 'bms-debug') {
					try {
						const debugBMS = this.ports.BMS.port.pipe(new DelimiterParser({
							delimiter: '\n',
						}));
						debugBMS.on('data', (data) => {
							// console.log(data.toString());
							ws.send(data.toString());
						});
						ws.send('BMS debug mode enabled');
					} catch (error) {
						this.logger.warn('Error enabling BMS debug mode: ' + error);
					}
				} else if (message === 'vpn-start') {
					try {
						execSync('wg-quick up AEV-CarPi');
						reply = 'VPN started';
						this.logger.success('VPN started');
					} catch (error) {
						this.logger.fail('There was an error starting the VPN: ' + error);
						console.log(error);
					}
				} else if (message === 'vpn-stop') {
					try {
						execSync('wg-quick down AEV-CarPi');
						reply = 'VPN stopped';
						this.logger.success('VPN stopped');
					} catch (error) {
						this.logger.fail('There was an error stopping the VPN: ' + error);
						console.log(error);
					}
				} else if (message === 'vpn-restart') {
					try {
						execSync('wg-quick down AEV-CarPi');
						execSync('wg-quick up AEV-CarPi');
						reply = 'VPN restarted';
						this.logger.success('VPN restarted');
					} catch (error) {
						this.logger.fail('There was an error restarting the VPN: ' + error);
						console.log(error);
					}
				} else if (message === 'bar-stop') {
					try {
						execSync('killall ags');
						this.logger.warn('Successfully killed AGS bar');
					} catch (error) {
						this.logger.fail('Error killing AGS bar:' + error);
					}
				} else if (message === 'bar-start') {
					try {
						execSync('hyprctl dispatch exec ags');
						this.logger.success('Successfully started AGS bar');
					} catch (error) {
						this.logger.fail('Error starting AGS bar:' + error);
					}
				} else if (message === 'bar-restart') {
					try {
						try {
							execSync('killall ags');
							this.logger.warn('Successfully killed AGS bar');
						} catch (error) {
							this.logger.fail('Error killing AGS bar:' + error);
						}
						try {
							execSync('hyprctl dispatch exec ags');
							this.logger.success('Successfully started AGS bar');
						} catch (error) {
							this.logger.fail('Error starting AGS bar:' + error);
						}
					} catch (error) {
						this.logger.fail('Error restarting AGS bar:' + error);
					}
				} else if (message === 'lap-start') {
					this.laps.start();
					reply = 'Lap started';
					this.logger.success('Lap & stopwatch started');
				} else if (message === 'lap-stop') {
					this.laps.stop();
					reply = 'Lap stopped';
					this.logger.success('Lap & stopwatch stopped');
				} else if (message === 'lap-lap') {
					this.laps.lap();
					reply = 'Lap recorded';
					this.logger.success('Lap recorded');
				} else if (message === 'lap-sheets') {
					this.laps.pushToSheet();
					reply = 'Updated Google Sheets page with lap data (hopefully)';
					this.logger.success('Updated Google Sheets page with lap data (hopefully)');
				} else if (message.startsWith('eval|')) {
					const code = message.split('|')[1];
					reply = `${this.eval(code)}`;
				} else if (message.startsWith('hyprland-dispatch|')) {
					const dispatch = message.split('|')[1];
					execSync(`hyprctl dispatch ${dispatch}`);
					this.logger.success(`Dispatched "${dispatch}" for Hyprland`);
				} else {
					reply = 'Unknown message';
					this.logger.debug('Unknown message received from client: ' + `"${message}"`);
				}

				ws.send(`${prefix}|${reply}`);
			});
		});

		this.wss.on('listening', () => {
			this.logger.success('WebSocket server started on port ' + this.config.ports.socket);
		});

	}

	async initAPI() {
		this.api = express();
		this.api.use(express.json());

		this.api.get('/', (req, res) => {
			this.logger.success('Recieved GET request on /, replied with API status');
			res.send({
				message: 'API server is running',
				ports: {
					BMS: this.ports.BMS.enabled,
					GPS: this.ports.GPS.enabled,
				},
			});
		});

		this.api.get('/bms', (req, res) => {
			this.logger.success('Recieved GET request on /bms, replied with BMS status: ' + this.ports.BMS.enabled);
			if (this.ports.GPS.enabled) {
				res.send({ enabled: true });
			} else {
				res.send({ enabled: false });
			}
		});
		this.api.get('/bms/data', (req, res) => {
			this.logger.success('Recieved GET request on /bms/data, replied with BMS data');
			res.send(this.ports.BMS.data);
		});
		this.api.get('/bms/alerts', (req, res) => {
			this.logger.success('Recieved GET request on /bms/alerts, replied with BMS alerts');
			res.send({ list: this.ports.BMS.alerts.list });
		});
		this.api.get('/bms/restart', (req, res) => {
			try {
				this.logger.success('Recieved GET request on /bms/restart, restarting BMS');
				this.stopBMS();
				this.initBMS();
				res.send({ status: 'BMS restarted' });
			} catch (error) {
				res.send({ status: 'Error restarting BMS: ' + error });
			}
		});

		this.api.get('/gps', (req, res) => {
			this.logger.success('Recieved GET request on /gps, replied with GPS status: ' + this.ports.GPS.enabled);
			if (this.ports.GPS.enabled) {
				res.send({ enabled: true });
			} else {
				res.send({ enabled: false });
			}
		});
		this.api.get('/gps/data', (req, res) => {
			this.logger.success('Recieved GET request on /gps/data, replied with GPS data');
			res.send(this.ports.GPS.data);
		});
		this.api.get('/gps/restart', (req, res) => {
			try {
				this.logger.success('Recieved GET request on /gps/restart, restarting GPS');
				this.stopGPS();
				this.initGPS();
				res.send({ status: 'GPS restarted' });
			} catch (error) {
				res.send({ status: 'Error restarting GPS: ' + error });
			}
		});

		this.api.get('/hyprland/dispatch', (req, res) => {
			if (req.query.dispatcher) {
				if (req.query.value) {
					execSync(`hyprctl dispatch ${req.query.dispatcher} ${req.query.value}`);
					res.send({ status: `Dispatched ${req.query.dispatcher} with value ${req.query.value}` });
				} else {
					execSync(`hyprctl dispatch ${req.query.dispatcher}`);
					res.send({ status: `Dispatched ${req.query.dispatcher}` });
				}
			}
		});

		this.api.listen(this.config.ports.api, () => {
			this.logger.success('API server started on port ' + this.config.ports.api);
		});
	}

	async checkInternet() {
		const lookupService = util.promisify(dns.lookupService);
		try {
			await lookupService('1.1.1.1', 53);
			return true; // Internet connection is available
		} catch (error) {
			return false; // Internet connection is not available
		}
	}

	parseBMSData(data) {
		try {
			// Trim the first two elements of the array and the last element of the array (useless bc first is "\r" and last is "BMS> ")
			data.shift();
			data.shift();
			data.pop();

			// Split each element by the colon and trim the whitespace from the beginning and end
			data = data.map((element) => {
				return element.split(':').map((item) => {
					return item.trim();
				});

			});


			// Remove all instances of \r from the array
			data = data.map((element) => {
				return element.map((item) => {
					return item.replace(/\r/g, '');
				});
			});

			// Trim spaces in all of the keys
			data = data.map((element) => {
				return element.map((item) => {
					return item.replace(/\s/g, '');
				});
			});

			// Alerts
			const alerts = [];
			const alertStartIndex = data.findIndex((element) => {
				return element[0] === 'alerts';
			});
			const alertEndIndex = data.findIndex((element) => {
				return element[0] === 'current';
			});
			for (let i = alertStartIndex; i < alertEndIndex; i++) {
				if (data[i][1] !== '') {
					alerts.push(data[i][1]);
				}
			}


			const dataObj = {};
			for (const item of data) {
				if (item[0] !== '') {
					dataObj[item[0]] = item[1];
				}
			}
			dataObj.alerts = alerts;
			if (!dataObj.uptime) return this.ports.BMS.data;

			// Trim all non-numbers from dataObj.uptime
			const oldUptime = dataObj.uptime.split('');
			const newUptime = [];
			for (let i = 0; i < oldUptime.length; i++) {
				if (isNaN(oldUptime[i])) {
					if (oldUptime[i].match(',')) {
						newUptime.push(oldUptime[i]);
					}
				} else {
					newUptime.push(oldUptime[i]);
				}
			}
			dataObj.uptime = newUptime.join('').split(',');

			// Trim all non-numbers from dataObj.cells
			const cellsRaw = dataObj.cells.split('');
			const cells = [];
			for (let i = 0; i < cellsRaw.length; i++) {
				if (!isNaN(cellsRaw[i])) {
					cells.push(cellsRaw[i]);
				}
			}
			dataObj.cells = cells.join('');

			const finalData = {
				voltage: dataObj.voltage,
				cells: dataObj.cells,
				mean: dataObj.mean,
				stddev: dataObj.stddev,
				alerts: dataObj.alerts,
				current: dataObj.current,
				SOC: dataObj.SOC,
				uptime: dataObj.uptime,
			};

			// this.logger.success("RAW BMS DATA: \n\n" + data.join("\n"));
			// this.logger.success("PARSED BMS DATA: \n\n" + JSON.stringify(finalData, null, 4));

			this.ports.BMS.data = finalData;
			this.ports.BMS.debug.noRes = 0;
			this.logger.success('Parsed and updated BMS data');
			this.logger.debug(JSON.stringify(finalData));
			return this.ports.BMS.data;

		} catch (error) {
			this.logger.warn('Error parsing BMS data: ' + error);
			console.log(error);

			return this.ports.BMS.data;
		}
	}

	parseGPSData(data) {
		if (data.speed) {
			this.ports.GPS.data.speed = data.speed;
		}
		if (data.lon) {
			this.ports.GPS.data.lon = data.lon;
		}
		if (data.lat) {
			this.ports.GPS.data.lat = data.lat;
		}

		if (this.ports.GPS.data.speed === 0 && this.ports.GPS.data.lon === 0 && this.ports.GPS.data.lat === 0) {
			this.ports.GPS.nores += 1;
			this.logger.debug('No GPS data recieved');

			if (this.ports.GPS.nores >= 10) {
				this.logger.warn('GPS data not being received, restarting GPS');
				this.continue.GPS = -1;
			}
		} else {
			this.logger.success('Parsed and updated GPS data');
		}

		return this.ports.GPS.data;
	}

	parseAlert(data) {
		// If line starts with "1/" and has a colon in it, it's an alert
		if (data.startsWith('1/') && data.includes(':')) {
			const alert = data.split(':');
			alert[0] = alert[0].replace('1/', '');
			alert[1] = alert[1].replace('\r', '');
			const alertObj = {
				cell: alert[0],
				message: alert[1],
				time: new Date().getTime(),
			};
			return alertObj;
		} else {
			return null;
		}
	}

	getBMSData() {
		return this.ports.BMS.data;
	}

	getGPSData() {
		return this.ports.GPS.data;
	}

	// JavaScript eval function for debugging
	eval(code) {
		try {
			const evaled = eval(code);
			return evaled;
		} catch (error) {
			return error;
		}
	}
}

export default AEVBackend;
