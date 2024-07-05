import fs from 'fs';
import path from 'path';
import Stopwatch from 'statman-stopwatch';

class AEVLaps {
	constructor(backend) {
		this.backend = backend;
		this.stopwatch = new Stopwatch();
		this.intervalID = null;

		this.startTime = 0;
		this.endTime = 0;

		this.current = {
			num: 1,
			startTime: 0,
			endTime: 0,
			split: 0,
			data: [],
		};
		this.list = [];

		this.backend.logger.startup('Lap module initialized');
	}

	recordData() {
		try {
			const swTime = (() => {
				this.stopwatch.split();
				const time = this.stopwatch.read(3, 's');
				this.stopwatch.unsplit();
				return time;
			})();
			const BMS = this.backend.getBMSData();
			const GPS = this.backend.getGPSData();

			const interval = {
				swTime: swTime,
				sysTime: Date.now(),
				data: {
					BMS: BMS,
					GPS: GPS,
				},
			};
			this.backend.logger.debug('Recorded lap interval data: ', interval.toString());
			this.current.data.push(interval);
		} catch (e) {
			this.backend.logger.fail('Failed to record lap interval data: ' + e);
		};
	}

	start() {
		if (this.intervalID !== null) clearInterval(this.intervalID);
		try {
			this.startTime = Date.now();
			this.stopwatch.start();
			this.current.startTime = Date.now();

			this.intervalID = setInterval(() => {
				this.recordData();
			}, 1000);
			this.backend.logger.info(`Lap #${this.current.num} started`);
		} catch (e) {
			this.backend.logger.fail('Failed to start lap: ' + e);
			if (this.intervalID !== null) clearInterval(this.intervalID);
		}
	}

	lap() {
		try {
			clearInterval(this.intervalID);
			this.current.endTime = Date.now();
			this.recordData();
			this.current.split = this.current.data[this.current.data.length - 1].swTime;
			this.list.push(this.current);
			this.backend.logger.debug('Lap stopped and recorded: ', this.current.toString());

			this.current = {
				num: this.current.num + 1,
				startTime: 0,
				endTime: 0,
				split: 0,
				data: [],
			};
			this.stopwatch.stop();
			this.start();
		} catch (e) {
			this.backend.logger.fail('Failed to record lap: ' + e);
		}
	}

	stop() {
		try {
			clearInterval(this.intervalID);
			this.current.endTime = Date.now();
			this.recordData();
			this.current.split = this.current.data[this.current.data.length - 1].swTime;
			this.list.push(this.current);
			this.backend.logger.debug('Lap stopped and recorded: ', this.current.toString());
			this.stopwatch.stop();

			this.endTime = Date.now();
			this.saveData();
		} catch (e) {
			this.backend.logger.fail('Failed to stop lap: ' + e);
			clearInterval(this.intervalID);
		}
	}

	getLaps() {
		return this.list;
	}

	saveData() {
		const data = {
			startTime: this.startTime,
			endTime: this.endTime,
			laps: this.list,
		};

		// Define the path to the data.json file
		const filePath = path.join(__dirname, '../../../data.json');

		// Read the existing data from the file
		fs.readFile(filePath, 'utf8', (err, fileContents) => {
			if (err) {
				this.backend.logger.fail('Error reading data.json:', err);
				return;
			}

			// Parse the existing data
			let existingData = {};
			try {
				existingData = JSON.parse(fileContents);
			} catch (parseErr) {
				this.backend.logger.fail('Error parsing JSON from data.json:', parseErr);
				return;
			}

			// Add the current dataJSON to the existing data
			// This example assumes you're appending the new data to an array named 'sessions'
			// Adjust according to your actual data structure
			if (!existingData.sessions) {
				existingData.sessions = [];
			}
			existingData.sessions.push(data);

			// Write the updated data back to the file
			fs.writeFile(filePath, JSON.stringify(existingData, null, 4), 'utf8', (writeErr) => {
				if (writeErr) {
					this.backend.logger.fail('Error writing to data.json:', writeErr);
				} else {
					this.backend.logger.log('Data successfully saved to data.json');
				}
			});
		});
	}
};

export default AEVLaps;