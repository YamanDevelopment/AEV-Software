import { JWT } from 'google-auth-library';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import Discord from 'discord.js';
import config from './src/config.js';
import existingData from '../../data.json' with { type: "json" };
import fs from 'fs';
import path from 'path';

try {
	const webhook = new Discord.WebhookClient({
		url: config.discord.webhookURL,
	});
	const data = fs.readFileSync(path.join(__dirname, '../../data.json'));
	const attachment = new Discord.AttachmentBuilder()
		.setFile(data)
		.setName('data.json');
	await webhook.send({
		content: `<@${config.discord.userMentionID}> **ALSET CyberSedan Data (\`data.json\`) as of ${new Date().toLocaleString()}**`,
		files: [attachment],
	});
	console.log('Data successfully sent to Discord webhook');
} catch (e) {
	console.log('Failed to send data to Discord webhook: ' + e);
}

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
			return await sheet[functionName](...args);
		} catch (error) {
			console.error(`Request failed (attempt ${retryCount + 1}): ${error}`);
			console.log(error)
			// Check if we've reached the maximum number of retries
			if (retryCount === maxRetries - 1) {
				throw new Error('Maximum retries reached, failing.');
			}

			// Calculate the delay with exponential backoff + random jitter
			let waitTime = Math.min(delay + Math.floor(Math.random() * 1000), maxBackoff);
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
	await sheetRequest(google.sheet, "loadInfo", []);
	console.log(`Loaded sheet: ${google.sheet.title}`);
	// for each session, duplicate the template sheet and fill in the data
	const templateSheet = google.sheet.sheetsByIndex[0];
	for (const sheet of google.sheet.sheetsByIndex) {
		if (sheet.sheetId !== templateSheet.sheetId) {
			await sheetRequest(sheet, "delete", []);
		}
	}
	for (let i = 0; i < existingData.sessions.length; i++) {
		const currentSession = existingData.sessions[i];
		// console.log(currentSession.startTime)
		const newSheet = await sheetRequest(templateSheet, "duplicate", [{
			title: `Session ${i + 1} at ${new Date(currentSession.startTime).toLocaleString()}`,
			index: i + 1,
		}]);

		// Load the cells of the new sheet
		await sheetRequest(newSheet, "loadCells", []);
		// console.log(newSheet.cellStats);

		// Fill in the main table
		const startTimeCell = await sheetRequest(newSheet, "getCell", [0, 1]);
		const endTimeCell = await sheetRequest(newSheet, "getCell", [1, 1]);
		const totalTimeCell = await sheetRequest(newSheet, "getCell", [2, 1]);

		startTimeCell.value = `=EPOCHTODATE(${currentSession.startTime}, 2)`;
		endTimeCell.value = `=EPOCHTODATE(${currentSession.endTime}, 2)`;
		totalTimeCell.value = formatTime(currentSession.totalTime * 1000);
		// console.log(startTimeCell.value, endTimeCell.value, totalTimeCell.value)

		await sheetRequest(newSheet, "saveUpdatedCells", []);

		// Fill in the lap list data
		let lastStartTime = 'START';
		for (let j = 0; j < currentSession.laps.length; j++) {
			const currentLap = currentSession.laps[j];
			const lapNumCell = await sheetRequest(newSheet, "getCell", [j + 4, 0]);
			const lapStartTimeCell = await sheetRequest(newSheet, "getCell", [j + 4, 1]);
			const lapEndTimeCell = await sheetRequest(newSheet, "getCell", [j + 4, 2]);
			const lapSplitCell = await sheetRequest(newSheet, "getCell", [j + 4, 3]);

			lapNumCell.value = currentLap.num;
			lapStartTimeCell.value = (() => {
				// Convert epoch time to HH:MM:SS.SSS
				const startTime = formatTime(currentLap.startTime - currentSession.startTime);
				if (lastStartTime === 'START') {
					lastStartTime = startTime;
					return 'START';
				}
				lastStartTime = startTime;
				return startTime;
			})();
			lapEndTimeCell.value = formatTime(currentLap.endTime - currentSession.startTime);
			lapSplitCell.value = formatTime(currentLap.split * 1000);
		}
		await sheetRequest(newSheet, "saveUpdatedCells", []);

		// Populate the lap interval data table
		let lastIndex = 2;
		for (let j = 0; j < currentSession.laps.length; j++) {
			const currentLap = currentSession.laps[j];
			for (let k = 0; k < currentLap.data.length; k++) {
				const currentInterval = currentLap.data[k];

				const lapNumCell = await sheetRequest(newSheet, "getCell", [k + lastIndex - 1, 4]);
				const swTimeCell = await sheetRequest(newSheet, "getCell", [k + lastIndex - 1, 5]);
				const sysTimeCell = await sheetRequest(newSheet, "getCell", [k + lastIndex - 1, 6]);
				const speedCell = await sheetRequest(newSheet, "getCell", [k + lastIndex - 1, 7]);
				const latCell = await sheetRequest(newSheet, "getCell", [k + lastIndex - 1, 8]);
				const lonCell = await sheetRequest(newSheet, "getCell", [k + lastIndex - 1, 9]);
				const packCellCountCell = await sheetRequest(newSheet, "getCell", [k + lastIndex - 1, 10]);
				const packVoltCell = await sheetRequest(newSheet, "getCell", [k + lastIndex - 1, 11]);
				const packMeanVoltCell = await sheetRequest(newSheet, "getCell", [k + lastIndex - 1, 12]);
				const packVoltStdDevCell = await sheetRequest(newSheet, "getCell", [k + lastIndex - 1, 13]);
				const packAlertsCell = await sheetRequest(newSheet, "getCell", [k + lastIndex - 1, 14]);
				const packCurrentCell = await sheetRequest(newSheet, "getCell", [k + lastIndex - 1, 15]);
				const packSOCCell = await sheetRequest(newSheet, "getCell", [k + lastIndex - 1, 16]);
				const bmsUptimeCell = await sheetRequest(newSheet, "getCell", [k + lastIndex - 1, 17]);
				
				// console.log(`Lap ${currentLap.num}`);
				lapNumCell.value = currentLap.num;
				swTimeCell.value = formatTime(currentInterval.swTime * 1000);
				sysTimeCell.value = `=EPOCHTODATE(${currentInterval.sysTime}, 2)`;
				speedCell.value = currentInterval.data.GPS.speed;
				latCell.value = currentInterval.data.GPS.lat;
				lonCell.value = currentInterval.data.GPS.lon;
				packCellCountCell.value = Number(currentInterval.data.BMS.cells);
				packVoltCell.value = Number(currentInterval.data.BMS.voltage.split('v')[0]);
				packMeanVoltCell.value = Number(currentInterval.data.BMS.mean.split('v')[0]);
				packVoltStdDevCell.value = Number(currentInterval.data.BMS.stddev.split('v')[0]);
				packAlertsCell.value = currentInterval.data.BMS.alerts.join(', ');
				packCurrentCell.value = Number(currentInterval.data.BMS.current.split('A')[0]);
				packSOCCell.value = Number(currentInterval.data.BMS.SOC.split('%')[0]) / 100;
				bmsUptimeCell.value = (() => {
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
				await sheetRequest(newSheet, "saveUpdatedCells", []);
			}
			lastIndex += currentLap.data.length;
		}
	}
} catch (e) {
	console.error('Failed to save data to Google Sheets: ' + e);
	console.log(e);
}
