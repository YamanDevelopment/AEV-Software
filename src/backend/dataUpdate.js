import { JWT } from 'google-auth-library';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import Discord from 'discord.js';
import config from './src/config.js';
import existingData from '../../data.json' with { type: "json" };
import fs from 'fs';
import path from 'path';
// import XLSX from 'sheetjs-ce-unofficial';
// import Excel from "excel4node";
import ExcelJS from 'exceljs';
const __dirname = path.resolve();

const utils = {
	formatTime: (milliseconds) => {
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
	},
	formatDate: (timestampMS) => {
		const timestamp = new Date(timestampMS / 1000);
		const month = timestamp.getMonth() + 1;
		const day = timestamp.getDate();
		const year = timestamp.getFullYear();
		const hours = timestamp.getHours();
		const minutes = timestamp.getMinutes();
		const seconds = timestamp.getSeconds();
		return `${month}/${day}/${year} ${hours}:${minutes < 10 ? `0${minutes}` : minutes}:${seconds < 10 ? `0${seconds}` : seconds}`;
	},
	formatClock: (timestampMS) => {
		let timestamp = timestampMS / 1000;
		const date = new Date(timestamp);
		const hours = date.getHours();
		const minutes = date.getMinutes();
		const seconds = date.getSeconds();
		return `${hours}:${minutes < 10 ? `0${minutes}` : minutes}:${seconds < 10 ? `0${seconds}` : seconds}`;
	},
	gridToA1Notation: (row, column) => {
		const rowLetter = String.fromCharCode(65 + column); // doesn't work for columns > 26, don't care lol
		return `${rowLetter}${row + 1}`;
	},
};

async function discordWebhook(file = "json") {
	const hostname = require('os').hostname();
	try {
		const webhook = new Discord.WebhookClient({
			url: config.discord.webhookURL,
		});
		let attachment = new Discord.AttachmentBuilder();
		if (file === "json") {
			const data = fs.readFileSync(path.join(__dirname, '../../data.json'));
			attachment
				.setFile(data)
				.setName('data.json');
		} else if (file === "xlsx") {
			const spreadsheet = fs.readFileSync(path.join(__dirname, '../../laps.xlsx'));
			attachment
				.setFile(spreadsheet)
				.setName('laps.xlsx');
		}
		await webhook.send({
			content: [
				'# **ALSET CyberSedan Data**',
				`<@${config.discord.userMentionID}>`,
				`**Data file: ${file === "json" ? '`data.json`' : '`laps.xlsx`'}**`,
				'**Ran from data update script.**',
				`**Device:** ${hostname}`,
				`**Timestamp:** ${new Date().toLocaleString()}`,
			].join('\n'),
			files: [attachment],
		});
		console.log('Data successfully sent to Discord webhook');
	} catch (e) {
		console.log('Failed to send data to Discord webhook: ' + e);
	}
}


async function googleSheets() {
	const google = {};
	// console.log(existingData);
	google.jwt = new JWT({
		email: config.google.creds.client_email,
		key: config.google.creds.private_key,
		scopes: config.google.scopes,
	});
	google.sheet = new GoogleSpreadsheet(config.google.sheetID, google.jwt);


	async function sheetRequestWithBackoffAlgorithm(sheet, functionName, args, maxRetries = 10, maxBackoff = 32000) {
		let retryCount = 0;
		let delay = 1000; // Initial delay of 1 second

		while (retryCount < maxRetries) {
			try {
				// Attempt the API request
				// console.log(functionName)
				if (functionName === 'loadInfo') {
					const response = await sheet.loadInfo(...args);
					console.log(`Ran function: ${functionName} with args: ${args} on sheet ${sheet.title}...`);
					return response;
				}
				console.log(`Running function: ${functionName} with args: ${args} on sheet ${sheet.title}...`);
				return await sheet[functionName](...args);
			} catch (error) {
				if (error.response) {
					if (error.response.code === 429) {
						console.error(`Request failed (attempt ${retryCount + 1}): ${error.response.code} (Rate limited)`);
					} else {
						console.error(`Request failed (attempt ${retryCount + 1}): ${error.response.code}`);
					}
				} else {
					console.error(`Request failed (attempt ${retryCount + 1}): ${error.message}`);
					console.log(error);
				}
				// console.log(error)
				// Check if we've reached the maximum number of retries
				if (retryCount === maxRetries - 1) {
					throw new Error('Maximum retries reached, failing.');
				}

				// Calculate the delay with exponential backoff + random jitter
				const waitTime = Math.min(delay + Math.floor(Math.random() * 1000), maxBackoff);
				console.log(`Waiting ${waitTime} ms before retrying...`);
				await new Promise(resolve => setTimeout(resolve, waitTime));

				// Prepare for the next iteration
				delay *= 2; // Double the delay for the next retry
				retryCount++;
			}
		}
	}

	async function sheetRequest(sheet, func, args) {
		return await sheetRequestWithBackoffAlgorithm(sheet, func, args);
	}

	try {
		await sheetRequest(google.sheet, 'loadInfo', []);
		console.log(`Loaded sheet: ${google.sheet.title}`);
		// for each session, duplicate the template sheet and fill in the data
		const templateSheet = google.sheet.sheetsByIndex[0];
		for (const sheet of google.sheet.sheetsByIndex) {
			if (sheet.sheetId !== templateSheet.sheetId) {
				await sheetRequest(sheet, 'delete', []);
			}
		}
		for (let i = 0; i < existingData.sessions.length; i++) {
			const currentSession = existingData.sessions[i];
			// console.log(currentSession.startTime)
			const newSheet = await sheetRequest(templateSheet, 'duplicate', [{
				title: `Session ${i + 1} at ${new Date(currentSession.startTime).toLocaleString()}`,
				index: i + 1,
			}]);

			// Load the cells of the new sheet
			await sheetRequest(newSheet, 'loadCells', []);
			// console.log(newSheet.cellStats);

			// Fill in the main table
			const startTimeCell = await sheetRequest(newSheet, 'getCell', [0, 1]);
			const endTimeCell = await sheetRequest(newSheet, 'getCell', [1, 1]);
			const totalTimeCell = await sheetRequest(newSheet, 'getCell', [2, 1]);

			startTimeCell.value = `=EPOCHTODATE(${currentSession.startTime}, 2)`;
			endTimeCell.value = `=EPOCHTODATE(${currentSession.endTime}, 2)`;
			totalTimeCell.value = utils.formatTime(currentSession.totalTime * 1000);
			// console.log(startTimeCell.value, endTimeCell.value, totalTimeCell.value)

			await sheetRequest(newSheet, 'saveUpdatedCells', []);

			// Fill in the lap list data
			let lastStartTime = 'START';
			const averageCells = [];
			for (let j = 0; j < currentSession.laps.length; j++) {
				const currentLap = currentSession.laps[j];
				const lapNumCell = await sheetRequest(newSheet, 'getCell', [j + 4, 0]);
				const lapStartTimeCell = await sheetRequest(newSheet, 'getCell', [j + 4, 1]);
				const lapEndTimeCell = await sheetRequest(newSheet, 'getCell', [j + 4, 2]);
				const lapSplitCell = await sheetRequest(newSheet, 'getCell', [j + 4, 3]);
				const lapAverageSpeedCell = await sheetRequest(newSheet, 'getCell', [j + 4, 4]);
				const lapAverageCurrentCell = await sheetRequest(newSheet, 'getCell', [j + 4, 5]);

				lapNumCell.value = currentLap.num;
				lapStartTimeCell.value = (() => {
					// Convert epoch time to HH:MM:SS.SSS
					const startTime = utils.formatTime(currentLap.startTime - currentSession.startTime);
					if (lastStartTime === 'START') {
						lastStartTime = startTime;
						return 'START';
					}
					lastStartTime = startTime;
					return startTime;
				})();
				lapEndTimeCell.value = utils.formatTime(currentLap.endTime - currentSession.startTime);
				lapSplitCell.value = utils.formatTime(currentLap.split * 1000);

				averageCells.push({
					speed: lapAverageSpeedCell,
					current: lapAverageCurrentCell,
				});
			}
			await sheetRequest(newSheet, 'saveUpdatedCells', []);

			// Populate the lap interval data table
			let lastIndex = 2;
			for (let j = 0; j < currentSession.laps.length; j++) {
				const currentLap = currentSession.laps[j];
				let startIndex, endIndex;
				for (let k = 0; k < currentLap.data.length; k++) {
					const currentInterval = currentLap.data[k];
					if (k === 0) startIndex = k + lastIndex - 1;
					else if (k === currentLap.data.length - 1) endIndex = k + lastIndex - 1;

					const lapNumCell = await sheetRequest(newSheet, 'getCell', [k + lastIndex - 1, 6]);
					const swTimeCell = await sheetRequest(newSheet, 'getCell', [k + lastIndex - 1, 7]);
					const sysTimeCell = await sheetRequest(newSheet, 'getCell', [k + lastIndex - 1, 8]);
					const speedCell = await sheetRequest(newSheet, 'getCell', [k + lastIndex - 1, 9]);
					const latCell = await sheetRequest(newSheet, 'getCell', [k + lastIndex - 1, 10]);
					const lonCell = await sheetRequest(newSheet, 'getCell', [k + lastIndex - 1, 11]);
					const packCellCountCell = await sheetRequest(newSheet, 'getCell', [k + lastIndex - 1, 12]);
					const packVoltCell = await sheetRequest(newSheet, 'getCell', [k + lastIndex - 1, 13]);
					const packMeanVoltCell = await sheetRequest(newSheet, 'getCell', [k + lastIndex - 1, 14]);
					const packVoltStdDevCell = await sheetRequest(newSheet, 'getCell', [k + lastIndex - 1, 15]);
					const packAlertsCell = await sheetRequest(newSheet, 'getCell', [k + lastIndex - 1, 16]);
					const packCurrentCell = await sheetRequest(newSheet, 'getCell', [k + lastIndex - 1, 17]);
					const packSOCCell = await sheetRequest(newSheet, 'getCell', [k + lastIndex - 1, 18]);
					const bmsUptimeCell = await sheetRequest(newSheet, 'getCell', [k + lastIndex - 1, 19]);

					// console.log(`Lap ${currentLap.num}`);
					lapNumCell.value = currentLap.num;
					swTimeCell.value = utils.formatTime(currentInterval.swTime * 1000);
					sysTimeCell.value = `=EPOCHTODATE(${currentInterval.sysTime}, 2)`;
					speedCell.value = currentInterval.data.GPS.speed;
					latCell.value = currentInterval.data.GPS.lat;
					lonCell.value = currentInterval.data.GPS.lon;
					packCellCountCell.value = (() => {
						if (currentInterval.data.BMS.cells === undefined || currentInterval.data.BMS.cells === null) return 'N/A';
						const cellCountRaw = currentInterval.data.BMS.cells;
						try {
							const cellCount = Number(cellCountRaw);
							if (typeof cellCount === 'number' && !isNaN(cellCount)) {
								return cellCount;
							} else {
								throw new Error('Failed to parse cell count, did not convert to a number');
							}
						} catch (e) {
							console.log(`Failed to parse cell count (returning it raw): ${cellCountRaw}`);
							return `${cellCountRaw}`;
						}
					})();
					packVoltCell.value = (() => {
						if (currentInterval.data.BMS.voltage === undefined || currentInterval.data.BMS.voltage === null) return 'N/A';
						const voltageRaw = currentInterval.data.BMS.voltage;
						try {
							const voltage = Number(voltageRaw.split('v')[0]);
							if (typeof voltage === 'number' && !isNaN(voltage)) {
								return voltage;
							} else {
								throw new Error('Failed to parse voltage, did not convert to a number');
							}
						} catch (e) {
							console.log(`Failed to parse voltage (returning it raw): ${voltageRaw}`);
							return `${voltageRaw}`;
						}

					})();
					packMeanVoltCell.value = (() => {
						if (currentInterval.data.BMS.mean === undefined || currentInterval.data.BMS.mean === null) return 'N/A';
						const meanVoltageRaw = currentInterval.data.BMS.mean;
						try {
							const meanVoltage = Number(meanVoltageRaw.split('v')[0]);
							if (typeof meanVoltage === 'number' && !isNaN(meanVoltage)) {
								return meanVoltage;
							} else {
								throw new Error('Failed to parse mean voltage, did not convert to a number');
							}
						} catch (e) {
							console.log(`Failed to parse mean voltage (returning it raw): ${meanVoltageRaw}`);
							return `${meanVoltageRaw}`;
						}
					})();
					packVoltStdDevCell.value = (() => {
						if (currentInterval.data.BMS.stddev === undefined || currentInterval.data.BMS.stddev === null) return 'N/A';
						const stdDevRaw = currentInterval.data.BMS.stddev;
						try {
							const stdDev = Number(stdDevRaw.split('v')[0]);
							if (typeof stdDev === 'number' && !isNaN(stdDev)) {
								return stdDev;
							} else {
								throw new Error('Failed to parse voltage stddev, did not convert to a number');
							}
						} catch (e) {
							console.log(`Failed to parse voltage stddev (returning it raw): ${stdDevRaw}`);
							return `${stdDevRaw}`;
						}
					})();
					// packAlertsCell.value = currentInterval.data.BMS.alerts.join(', ');
					packAlertsCell.value = (() => {
						if (currentInterval.data.BMS.alerts === undefined || currentInterval.data.BMS.alerts === null) return 'N/A';
						const alerts = currentInterval.data.BMS.alerts;
						if (alerts.length === 0) return 'None';
						return alerts.join(', ');
					})();
					// packCurrentCell.value = Number(currentInterval.data.BMS.current.split('A')[0]);
					packCurrentCell.value = (() => {
						if (currentInterval.data.BMS.current === undefined || currentInterval.data.BMS.current === null) return 'N/A';
						const currentRaw = currentInterval.data.BMS.current;
						try {
							const current = Number(currentRaw.split('A')[0]);
							if (typeof current === 'number' && !isNaN(current)) {
								return current;
							} else {
								throw new Error('Failed to parse current, did not convert to a number');
							}
						} catch (e) {
							console.log(`Failed to parse current (returning it raw): ${currentRaw}`);
							return `${currentRaw}`;
						}
					})();
					// packSOCCell.value = Number(currentInterval.data.BMS.SOC.split('%')[0]) / 100;
					packSOCCell.value = (() => {
						if (currentInterval.data.BMS.SOC === undefined || currentInterval.data.BMS.SOC === null) return 'N/A';
						const socRaw = currentInterval.data.BMS.SOC;
						try {
							const soc = Number(socRaw.split('%')[0]) / 100;
							if (typeof soc === 'number' && !isNaN(soc)) {
								return soc;
							} else {
								throw new Error('Failed to parse SOC, did not convert to a number');
							}
						} catch (e) {
							console.log(`Failed to parse SOC (returning it raw): ${socRaw}`);
							return `${socRaw}`;
						}
					})();
					expect(packSOCCell.type).toEqual(ExcelJS.ValueType.Date);
					bmsUptimeCell.value = (() => {
						if (currentInterval.data.BMS.uptime === undefined || currentInterval.data.BMS.uptime === null) return 'N/A';
						const uptime = currentInterval.data.BMS.uptime;
						let hours = Number(uptime[0]);
						let minutes = Number(uptime[1]);
						let seconds = Number(uptime[2]);
						// If the seconds/minutes are less than 10, add trailing 0
						seconds = seconds < 10 ? `0${seconds}` : seconds;
						minutes = minutes < 10 ? `0${minutes}` : minutes;
						hours = hours < 10 ? `0${hours}` : hours;

						return `${hours}:${minutes}:${seconds}`;
					})();
					await sheetRequest(newSheet, 'saveUpdatedCells', []);
				}
				lastIndex += currentLap.data.length;

				// Update speed/current averages
				const lapAverageSpeedCell = averageCells[j].speed;
				const lapAverageCurrentCell = averageCells[j].current;

				lapAverageSpeedCell.value = (() => {
					const startCell = utils.gridToA1Notation(startIndex, 9);
					const endCell = utils.gridToA1Notation(endIndex, 9);
					return `=AVERAGE(${startCell}:${endCell})`;
				})();

				lapAverageCurrentCell.value = (() => {
					const startCell = utils.gridToA1Notation(startIndex, 17);
					const endCell = utils.gridToA1Notation(endIndex, 17);
					return `=AVERAGE(${startCell}:${endCell})`;
				})();

				await sheetRequest(newSheet, 'saveUpdatedCells', []);
			}
		}
		console.log('Successfully saved data to Google Sheets');
	} catch (e) {
		console.error('Failed to save data to Google Sheets: ' + e);
		console.log(e);
	}
}

async function excelSpreadsheet() {
	function duplicateWorksheet(workbook, originalWorksheet, name) {
		const newWorksheet = workbook.addWorksheet(name);
		newWorksheet.model = Object.assign({},
		{
			...originalWorksheet.model,
			name,
			...{model: {name}}
		});

		originalWorksheet.eachRow((row, rowNumber) =>
		{
			const newRow = newWorksheet.getRow(rowNumber);
			row.eachCell({ includeEmpty: true }, (cell, colNumber) =>
			{
				const newCell = newRow.getCell(colNumber);
				newCell.value = cell.value;
				newCell.style = Object.assign({}, cell.style);
			});
		});

		// Copy Merged Cells
		originalWorksheet.model.merges.forEach(merge =>
		{
			newWorksheet.mergeCells(merge);
		});

		return newWorksheet;
	}
	try {
		/** 
		const templateBook = XLSX.readFile(path.join(__dirname, '../../laps.template.ods'), {
			// type: 'file',
			dense: true,
			cellNF: true,
			cellStyles: true,
			cellDates: true,
		});
		const templateSheet = templateBook.Sheets[templateBook.SheetNames[0]];
		console.log(`Loaded template sheet: ${templateBook.SheetNames[0]}`);

		console.log(templateSheet);
		// Merge B1:F1, B2:F2, B3:F3
		templateSheet['!merges'] = [
			{ s: { r: 0, c: 1 }, e: { r: 0, c: 5 } },
			{ s: { r: 1, c: 1 }, e: { r: 1, c: 5 } },
			{ s: { r: 2, c: 1 }, e: { r: 2, c: 5 } },
		];
		const mainWorkbook = XLSX.utils.book_new();

		for (let i = 0; i < existingData.sessions.length; i++) {
			const currentSession = existingData.sessions[i];
			const newSheetName = `S${i + 1} at ${new Date(currentSession.startTime).toLocaleString().replace(/[:\/]/g, '-').replace(/,/g, '')}`;

			XLSX.utils.book_append_sheet(mainWorkbook, templateSheet, newSheetName);
		}

		XLSX.writeFile(mainWorkbook, '../../laps.ods');
		**/

		const workbook = new ExcelJS.Workbook();
		await workbook.xlsx.readFile(path.join(__dirname, '../../laps.template.xlsx'));

		const templateSheet = workbook.getWorksheet('Session Data Template');
		for (let i = 0; i < existingData.sessions.length; i++) {
			const currentSession = existingData.sessions[i];
			const newSheetName = `S${i + 1} at ${new Date(currentSession.startTime).toLocaleString().replace(/[:\/]/g, '-').replace(/,/g, '')}`;
			const newSheet = duplicateWorksheet(workbook, templateSheet, newSheetName);

			// Fill in the main table
			const startTimeCell = newSheet.getCell('B1');
			const endTimeCell = newSheet.getCell('B2');
			const totalTimeCell = newSheet.getCell('B3');

			startTimeCell.value = utils.formatDate(currentSession.startTime * 1000);
			endTimeCell.value = utils.formatDate(currentSession.endTime * 1000);
			totalTimeCell.value = utils.formatTime(currentSession.totalTime * 1000);

			// Fill in the lap list data
			let lastStartTime = 'START';
			const averageCells = [];
			for (let j = 0; j < currentSession.laps.length; j++) {
				const currentLap = currentSession.laps[j];
				const lapNumCell = newSheet.getCell(`A${j + 5}`);
				const lapStartTimeCell = newSheet.getCell(`B${j + 5}`);
				const lapEndTimeCell = newSheet.getCell(`C${j + 5}`);
				const lapSplitCell = newSheet.getCell(`D${j + 5}`);
				const lapAverageSpeedCell = newSheet.getCell(`E${j + 5}`);
				const lapAverageCurrentCell = newSheet.getCell(`F${j + 5}`);

				lapNumCell.value = currentLap.num;
				lapStartTimeCell.value = (() => {
					// Convert epoch time to HH:MM:SS.SSS
					const startTime = utils.formatTime(currentLap.startTime - currentSession.startTime);
					if (lastStartTime === 'START') {
						lastStartTime = startTime;
						return 'START';
					}
					lastStartTime = startTime;
					return startTime;
				})();
				lapEndTimeCell.value = utils.formatTime(currentLap.endTime - currentSession.startTime);
				lapSplitCell.value = utils.formatTime(currentLap.split * 1000);

				averageCells.push({
					speed: lapAverageSpeedCell,
					current: lapAverageCurrentCell,
				});
			}

			// Populate the lap interval data table
			let lastIndex = 2;
			for (let j = 0; j < currentSession.laps.length; j++) {
				const currentLap = currentSession.laps[j];
				let startIndex, endIndex;
				for (let k = 0; k < currentLap.data.length; k++) {
					const currentInterval = currentLap.data[k];
					if (k === 0) startIndex = k + lastIndex;
					else if (k === currentLap.data.length - 1) endIndex = k + lastIndex;

					const lapNumCell = newSheet.getCell(`G${k + lastIndex}`);
					const swTimeCell = newSheet.getCell(`H${k + lastIndex}`);
					const sysTimeCell = newSheet.getCell(`I${k + lastIndex}`);
					const speedCell = newSheet.getCell(`J${k + lastIndex}`);
					const latCell = newSheet.getCell(`K${k + lastIndex}`);
					const lonCell = newSheet.getCell(`L${k + lastIndex}`);
					const packCellCountCell = newSheet.getCell(`M${k + lastIndex}`);
					const packVoltCell = newSheet.getCell(`N${k + lastIndex}`);
					const packMeanVoltCell = newSheet.getCell(`O${k + lastIndex}`);
					const packVoltStdDevCell = newSheet.getCell(`P${k + lastIndex}`);
					const packAlertsCell = newSheet.getCell(`Q${k + lastIndex}`);
					const packCurrentCell = newSheet.getCell(`R${k + lastIndex}`);
					const packSOCCell = newSheet.getCell(`S${k + lastIndex}`);
					const bmsUptimeCell = newSheet.getCell(`T${k + lastIndex}`);

					lapNumCell.value = currentLap.num;
					swTimeCell.value = utils.formatTime(currentInterval.swTime * 1000);
					sysTimeCell.value = utils.formatClock(currentInterval.sysTime * 1000);
					speedCell.value = currentInterval.data.GPS.speed;
					latCell.value = currentInterval.data.GPS.lat;
					lonCell.value = currentInterval.data.GPS.lon;
					packCellCountCell.value = (() => {
						if (currentInterval.data.BMS.cells === undefined || currentInterval.data.BMS.cells === null) return 'N/A';
						const cellCountRaw = currentInterval.data.BMS.cells;
						try {
							const cellCount = Number(cellCountRaw);
							if (typeof cellCount === 'number' && !isNaN(cellCount)) {
								return cellCount;
							} else {
								throw new Error('Failed to parse cell count, did not convert to a number');
							}
						} catch (e) {
							console.log(`Failed to parse cell count (returning it raw): ${cellCountRaw}`);
							return `${cellCountRaw}`;
						}
					})();
					packVoltCell.value = (() => {
						if (currentInterval.data.BMS.voltage === undefined || currentInterval.data.BMS.voltage === null) return 'N/A';
						const voltageRaw = currentInterval.data.BMS.voltage;
						try {
							const voltage = Number(voltageRaw.split('v')[0]);
							if (typeof voltage === 'number' && !isNaN(voltage)) {
								return voltage;
							} else {
								throw new Error('Failed to parse voltage, did not convert to a number');
							}
						} catch (e) {
							console.log(`Failed to parse voltage (returning it raw): ${voltageRaw}`);
							return `${voltageRaw}`;
						}

					})();
					packMeanVoltCell.value = (() => {
						if (currentInterval.data.BMS.mean === undefined || currentInterval.data.BMS.mean === null) return 'N/A';
						const meanVoltageRaw = currentInterval.data.BMS.mean;
						try {
							const meanVoltage = Number(meanVoltageRaw.split('v')[0]);
							if (typeof meanVoltage === 'number' && !isNaN(meanVoltage)) {
								return meanVoltage;
							} else {
								throw new Error('Failed to parse mean voltage, did not convert to a number');
							}
						} catch (e) {
							console.log(`Failed to parse mean voltage (returning it raw): ${meanVoltageRaw}`);
							return `${meanVoltageRaw}`;
						}
					})();
					packVoltStdDevCell.value = (() => {
						if (currentInterval.data.BMS.stddev === undefined || currentInterval.data.BMS.stddev === null) return 'N/A';
						const stdDevRaw = currentInterval.data.BMS.stddev;
						try {
							const stdDev = Number(stdDevRaw.split('v')[0]);
							if (typeof stdDev === 'number' && !isNaN(stdDev)) {
								return stdDev;
							} else {
								throw new Error('Failed to parse voltage stddev, did not convert to a number');
							}
						} catch (e) {
							console.log(`Failed to parse voltage stddev (returning it raw): ${stdDevRaw}`);
							return `${stdDevRaw}`;
						}
					})();
					// packAlertsCell.value = currentInterval.data.BMS.alerts.join(', ');
					packAlertsCell.value = (() => {
						if (currentInterval.data.BMS.alerts === undefined || currentInterval.data.BMS.alerts === null) return 'N/A';
						const alerts = currentInterval.data.BMS.alerts;
						if (alerts.length === 0) return 'None';
						return alerts.join(', ');
					})();
					// packCurrentCell.value = Number(currentInterval.data.BMS.current.split('A')[0]);
					packCurrentCell.value = (() => {
						if (currentInterval.data.BMS.current === undefined || currentInterval.data.BMS.current === null) return 'N/A';
						const currentRaw = currentInterval.data.BMS.current;
						try {
							const current = Number(currentRaw.split('A')[0]);
							if (typeof current === 'number' && !isNaN(current)) {
								return current;
							} else {
								throw new Error('Failed to parse current, did not convert to a number');
							}
						} catch (e) {
							console.log(`Failed to parse current (returning it raw): ${currentRaw}`);
							return `${currentRaw}`;
						}
					})();
					// packSOCCell.value = Number(currentInterval.data.BMS.SOC.split('%')[0]) / 100;
					packSOCCell.value = (() => {
						if (currentInterval.data.BMS.SOC === undefined || currentInterval.data.BMS.SOC === null) return 'N/A';
						const socRaw = currentInterval.data.BMS.SOC;
						try {
							const soc = Number(socRaw.split('%')[0]) / 100;
							if (typeof soc === 'number' && !isNaN(soc)) {
								return soc;
							} else {
								throw new Error('Failed to parse SOC, did not convert to a number');
							}
						} catch (e) {
							console.log(`Failed to parse SOC (returning it raw): ${socRaw}`);
							return `${socRaw}`;
						}
					})();
					bmsUptimeCell.value = (() => {
						if (currentInterval.data.BMS.uptime === undefined || currentInterval.data.BMS.uptime === null) return 'N/A';
						const uptime = currentInterval.data.BMS.uptime;
						let hours = Number(uptime[0]);
						let minutes = Number(uptime[1]);
						let seconds = Number(uptime[2]);
						// If the seconds/minutes are less than 10, add trailing 0
						seconds = seconds < 10 ? `0${seconds}` : seconds;
						minutes = minutes < 10 ? `0${minutes}` : minutes;
						hours = hours < 10 ? `0${hours}` : hours;

						return `${hours}:${minutes}:${seconds}`;
					})();
				}
				lastIndex += currentLap.data.length;
				// Update speed/current averages
				const lapAverageSpeedCell = averageCells[j].speed;
				const lapAverageCurrentCell = averageCells[j].current;
		
				lapAverageSpeedCell.value = (() => {
					const startCell = utils.gridToA1Notation(startIndex, 9);
					const endCell = utils.gridToA1Notation(endIndex, 9);
					return { formula: `AVERAGE(${startCell}:${endCell})` };
				})();
		
				lapAverageCurrentCell.value = (() => {
					const startCell = utils.gridToA1Notation(startIndex, 17);
					const endCell = utils.gridToA1Notation(endIndex, 17);
					return { formula: `AVERAGE(${startCell}:${endCell})` };
				})();
			}
		}
		await workbook.xlsx.writeFile(path.join(__dirname, '../../laps.xlsx'))
	} catch (error) {
		console.error('Failed to save data to Excel spreadsheet: ' + error);
		console.log(error);
	}
}

// Get params from command line
const args = process.argv.slice(2);
if (args.length === 0) {
	console.log('No arguments provided. Exiting...');
	process.exit(1);
}

if (!args.includes('discord-json') && !args.includes('discord-xlsx') && !args.includes('excel') && !args.includes('sheets') && !args.includes('debug')) {
	console.log('No valid arguments provided. Exiting...');
	process.exit(1);
}

// Run the appropriate function based on the arguments
if (args.includes('discord-json')) await discordWebhook("json");
if (args.includes('discord-xlsx')) await discordWebhook("xlsx");
if (args.includes('excel')) await excelSpreadsheet();
if (args.includes('sheets')) await googleSheets();
if (args.includes('debug')) {
	console.log(`Path: ${__dirname}`);
	console.log(`Args: ${args}`);
}
