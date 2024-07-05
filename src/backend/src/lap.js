import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { JWT } from 'google-auth-library';
import Stopwatch from 'statman-stopwatch';
import { GoogleSpreadsheet } from 'google-spreadsheet';

// Get the current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class AEVLaps {
	constructor(backend) {
		this.backend = backend;
		this.stopwatch = new Stopwatch();
		this.intervalID = null;

		this.startTime = 0;
		this.endTime = 0;
		this.totalTime = 0;

		this.current = {
			num: 1,
			startTime: 0,
			endTime: 0,
			split: 0,
			data: [],
		};
		this.list = [];

		this.google = {
			jwt: new JWT({
				email: this.backend.config.google.creds.client_email,
				key: this.backend.config.google.creds.private_key,
				scopes: this.backend.config.google.scopes,
			}),
		};
		this.google.sheet = new GoogleSpreadsheet(this.backend.config.google.sheetID, this.google.jwt);

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
				swTime: Number(swTime),
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
		if (this.intervalID !== null) {
			clearInterval(this.intervalID);
		} else {
			this.startTime = Date.now();
		}
		try {
			this.stopwatch.start();
			this.current.startTime = Date.now();

			this.intervalID = setInterval(() => {
				this.recordData();
			}, 1000);
			this.backend.logger.debug(`Lap #${this.current.num} started`);
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
			this.totalTime = (this.endTime - this.startTime) / 1000;
			this.intervalID = null;
			(async () => {
				await this.saveData();
			})();
		} catch (e) {
			this.backend.logger.fail('Failed to stop lap: ' + e);
			clearInterval(this.intervalID);
			this.intervalID = null;
		}
	}

	getLaps() {
		return this.list;
	}

	trimData() {
		// If there are any duplicate lap entries (based on the lap number, startTime, and endTime), remove them
		const uniqueLaps = [];
		const uniqueLapKeys = [];
		this.list.forEach((lap) => {
			const key = `${lap.num}-${lap.startTime}-${lap.endTime}`;
			if (!uniqueLapKeys.includes(key)) {
				uniqueLapKeys.push(key);
				uniqueLaps.push(lap);
			}
		});

		this.list = uniqueLaps;
	}

	async saveData() {
		this.trimData();
		const data = {
			startTime: this.startTime,
			endTime: this.endTime,
			totalTime: this.totalTime,
			laps: this.list,
		};

		// Define the path to the data.json file
		// console.log(path.join(__dirname, '../../../data.json'));
		const filePath = path.join(__dirname, '../../../data.json');

		// Read the existing data from the file
		await fs.readFileSync(filePath, 'utf8', async (err, fileContents) => {
			if (err) {
				this.backend.logger.fail('Error reading data.json:', err);
				return;
			}

			// Parse the existing data
			let existingData = {};
			try {
				// console.log(fileContents.split('\n').join(''));
				existingData = JSON.parse(fileContents.split('\n').join(''));
			} catch (parseErr) {
				this.backend.logger.fail('Error parsing JSON from data.json:' + parseErr);
				// console.log(parseErr);
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
			await fs.writeFileSync(filePath, JSON.stringify(existingData, null, 4), 'utf8', (writeErr) => {
				if (writeErr) {
					this.backend.logger.fail('Error writing to data.json:', writeErr);
				} else {
					this.backend.logger.success('Data successfully saved to data.json');
				}
			});
		});

		// Save it to Google Sheets
		function formatTime(milliseconds) {
			let seconds = milliseconds / 1000;
			// console.log(seconds)
			const hours = Math.floor(seconds / 3600);
			seconds -= hours * 3600;
			const minutes = Math.floor(seconds / 60);
			seconds -= minutes * 60;
		
			// Pad to 2 or 3 digits, default is 2
			const pad = (num, size = 2) => (`000${num}`).slice(size * -1);
		
			const finalFormat = `${pad(hours)}:${pad(minutes)}:${pad(seconds.toFixed(3), 6)}`;
			// console.log(final)
			return finalFormat;
		}
		try {
			await this.google.sheet.loadInfo();
			// for each session, duplicate the template sheet and fill in the data
			const templateSheet = this.google.sheet.sheetsByIndex[0];
			for (const sheet of this.google.sheet.sheetsByIndex) {
				if (sheet.sheetId !== templateSheet.sheetId) {
					await sheet.delete();
				}
			}
			for (let i = 0; i < existingData.length; i++) {
				const currentSession = existingData.sessions[i];
				const newSheet = await templateSheet.duplicate({
					title: `Session ${i + 1} at ${new Date(currentSession.startTime).toLocaleString()}`,
					index: i + 1,
				});

				// Load the cells of the new sheet
				await newSheet.loadCells();

				// Fill in the main table
				const startTimeCell = newSheet.getCell('B1');
				const endTimeCell = newSheet.getCell('B2');
				const totalTimeCell = newSheet.getCell('B3');

				startTimeCell.value = `=EPOCHTODATE(${currentSession.startTime}, 2)`;
				endTimeCell.value = `=EPOCHTODATE(${currentSession.endTime}, 2)`;
				totalTimeCell.value = (() => {
					// Seconds to HH:MM:SS.SSS
					let seconds = currentSession.totalTime;
					const hours = Math.floor(seconds / 3600);
					let minutes = Math.floor((seconds % 3600) / 60);
					seconds = seconds % 60;

					if (seconds < 10) {
						seconds = `0${seconds}`;
					}
					if (minutes < 10) {
						minutes = `0${minutes}`;
					}

					return `${hours}:${minutes}:${seconds.toFixed(3)}`;
				})();

				await sheet.saveUpdatedCells();

				// Fill in the lap list data
				let lastStartTime = 0;
				for (let j = 0; j < currentSession.laps.length; j++) {
					const currentLap = currentSession.laps[j];
					const lapNumCell = newSheet.getCell(`A${j + 5}`);
					const lapStartTimeCell = newSheet.getCell(`B${j + 5}`);
					const lapEndTimeCell = newSheet.getCell(`C${j + 5}`);
					const lapSplitCell = newSheet.getCell(`D${j + 5}`);

					lapNumCell.value = currentLap.num;
					lapStartTimeCell.value = (() => {
						// Convert epoch time to HH:MM:SS.SSS
						const startTime = (currentLap.startTime - currentSession.startTime) / 1000;
						if (lastStartTime === 0) {
							lastStartTime = startTime;
							return 0;
						}
						lastStartTime = startTime;
						return startTime;
					})();
					lapEndTimeCell.value = (() => {
						// Convert epoch time to HH:MM:SS.SSS
						const endTime = (currentLap.endTime - currentSession.startTime) / 1000;
						return endTime;
					})();
					lapSplitCell.value = (() => {
						// Seconds to HH:MM:SS.SSS
						let seconds = currentLap.split;
						const hours = Math.floor(seconds / 3600);
						let minutes = Math.floor((seconds % 3600) / 60);
						seconds = seconds % 60;

						if (seconds < 10) {
							seconds = `0${seconds}`;
						}
						if (minutes < 10) {
							minutes = `0${minutes}`;
						}

						return `${hours}:${minutes}:${seconds.toFixed(3)}`;
					})();
				}
				await sheet.saveUpdatedCells();

				// Populate the lap interval data table
				let lastIndex = 2;
				for (let j = 0; j < currentSession.laps.length; j++) {
					const currentLap = currentSession.laps[j];
					for (let k = 0; k < currentLap.data.length; k++) {
						const currentInterval = currentLap.data[k];
						const lapNumCell = newSheet.getCell(`E${k + lastIndex}`);
						const swTimeCell = newSheet.getCell(`F${k + lastIndex}`);
						const sysTimeCell = newSheet.getCell(`G${k + lastIndex}`);
						const speedCell = newSheet.getCell(`H${k + lastIndex}`);
						const latCell = newSheet.getCell(`I${k + lastIndex}`);
						const lonCell = newSheet.getCell(`J${k + lastIndex}`);
						const packCellCountCell = newSheet.getCell(`K${k + lastIndex}`);
						const packVoltCell = newSheet.getCell(`L${k + lastIndex}`);
						const packMeanVoltCell = newSheet.getCell(`M${k + lastIndex}`);
						const packVoltStdDevCell = newSheet.getCell(`N${k + lastIndex}`);
						const packAlertsCell = newSheet.getCell(`O${k + lastIndex}`);
						const packCurrentCell = newSheet.getCell(`P${k + lastIndex}`);
						const packSOCCell = newSheet.getCell(`Q${k + lastIndex}`);
						const bmsUptimeCell = newSheet.getCell(`R${k + lastIndex}`);

						lapNumCell.value = currentLap.num;
						swTimeCell.value = (() => {
							// Seconds to HH:MM:SS.SSS
							let seconds = currentInterval.swTime;
							const hours = Math.floor(seconds / 3600);
							let minutes = Math.floor((seconds % 3600) / 60);
							seconds = seconds % 60;

							if (seconds < 10) {
								seconds = `0${seconds}`;
							}
							if (minutes < 10) {
								minutes = `0${minutes}`;
							}

							return `${hours}:${minutes}:${seconds.toFixed(3)}`;
						})();
						sysTimeCell.value = `=EPOCHTODATE(${currentInterval.sysTime}, 2)`;
						speedCell.value = currentInterval.data.GPS.speed;
						latCell.value = currentInterval.data.GPS.lat;
						lonCell.value = currentInterval.data.GPS.lon;
						packCellCountCell.value = currentInterval.data.BMS.packCellCount;
						packVoltCell.value = currentInterval.data.BMS.packVolt.split('v')[0];
						packMeanVoltCell.value = currentInterval.data.BMS.packMeanVolt.split('v')[0];
						packVoltStdDevCell.value = currentInterval.data.BMS.packVoltStdDev.split('v')[0];
						packAlertsCell.value = currentInterval.data.BMS.packAlerts.join(', ');
						packCurrentCell.value = currentInterval.data.BMS.packCurrent.split('A')[0];
						packSOCCell.value = currentInterval.data.BMS.packSOC.split('%')[0];
						bmsUptimeCell.value = (() => {
							const uptime = currentInterval.data.BMS.uptime;
							const hours = uptime[0];
							let minutes = uptime[1];
							let seconds = uptime[2];
							// If the seconds/minutes are less than 10, add trailing 0
							seconds = seconds < 10 ? `0${seconds}` : seconds;
							minutes = minutes < 10 ? `0${minutes}` : minutes;

							return `${hours}:${minutes}:${seconds}`;
						});

						await sheet.saveUpdatedCells();
					}
					lastIndex += currentLap.data.length;
				}
			}
		} catch (e) {
			this.backend.logger.fail('Failed to save data to Google Sheets: ' + e);
		}


		// Clear all the data
		this.startTime = 0;
		this.endTime = 0;
		this.list = [];
		this.current = {
			num: 1,
			startTime: 0,
			endTime: 0,
			split: 0,
			data: [],
		};
	}
};

export default AEVLaps;