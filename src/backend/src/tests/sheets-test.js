import { JWT } from 'google-auth-library';
import { GoogleSpreadsheet } from 'google-spreadsheet';

const google = {};
import config from '../config.js';
import existingData from '../../../../data.json' with { type: "json" };
// console.log(existingData);
google.jwt = new JWT({
	email: config.google.creds.client_email,
	key: config.google.creds.private_key,
	scopes: config.google.scopes,
});
google.sheet = new GoogleSpreadsheet(config.google.sheetID, google.jwt);



// console.log(formatTime(36123000)); process.exit(0);

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
	await google.sheet.loadInfo();
	console.log(`Loaded sheet: ${google.sheet.title}`);
	// for each session, duplicate the template sheet and fill in the data
	const templateSheet = google.sheet.sheetsByIndex[0];
	for (const sheet of google.sheet.sheetsByIndex) {
		if (sheet.sheetId !== templateSheet.sheetId) {
			await sheet.delete();
		}
	}
	for (let i = 0; i < existingData.sessions.length; i++) {
		const currentSession = existingData.sessions[i];
		console.log(currentSession.startTime)
		const newSheet = await templateSheet.duplicate({
			title: `Session ${i + 1} at ${new Date(currentSession.startTime).toLocaleString()}`,
			index: i + 1,
		});

		// Load the cells of the new sheet
		await newSheet.loadCells();
		console.log(newSheet.cellStats);

		// Fill in the main table
		const startTimeCell = newSheet.getCell(0, 1);
		const endTimeCell = newSheet.getCell(1, 1);
		const totalTimeCell = newSheet.getCell(2, 1);

		startTimeCell.value = `=EPOCHTODATE(${currentSession.startTime}, 2)`;
		endTimeCell.value = `=EPOCHTODATE(${currentSession.endTime}, 2)`;
		totalTimeCell.value = formatTime(currentSession.totalTime * 1000);
		// console.log(startTimeCell.value, endTimeCell.value, totalTimeCell.value)

		await newSheet.saveUpdatedCells();

		// Fill in the lap list data
		let lastStartTime = "START";
		for (let j = 0; j < currentSession.laps.length; j++) {
			const currentLap = currentSession.laps[j];
			const lapNumCell = newSheet.getCell(j + 4, 0);
			const lapStartTimeCell = newSheet.getCell(j + 4, 1)
			const lapEndTimeCell = newSheet.getCell(j + 4, 2);
			const lapSplitCell = newSheet.getCell(j + 4, 3);

			lapNumCell.value = currentLap.num;
			lapStartTimeCell.value = (() => {
				// Convert epoch time to HH:MM:SS.SSS
				const startTime = formatTime(currentLap.startTime - currentSession.startTime);
				if (lastStartTime === "START") {
					lastStartTime = startTime;
					return "START";
				}
				lastStartTime = startTime;
				return startTime;
			})();
			lapEndTimeCell.value = formatTime(currentLap.endTime - currentSession.startTime);
			lapSplitCell.value = formatTime(currentLap.split * 1000);
		}
		await newSheet.saveUpdatedCells();

		// Populate the lap interval data table
		let lastIndex = 2;
		for (let j = 0; j < currentSession.laps.length; j++) {
			const currentLap = currentSession.laps[j];
			for (let k = 0; k < currentLap.data.length; k++) {
				const currentInterval = currentLap.data[k];
				const lapNumCell = newSheet.getCell(k + lastIndex - 1, 4);
				const swTimeCell = newSheet.getCell(k + lastIndex - 1, 5);
				const sysTimeCell = newSheet.getCell(k + lastIndex - 1, 6);
				const speedCell = newSheet.getCell(k + lastIndex - 1, 7);
				const latCell = newSheet.getCell(k + lastIndex - 1, 8);
				const lonCell = newSheet.getCell(k + lastIndex - 1, 9);
				const packCellCountCell = newSheet.getCell(k + lastIndex - 1, 10);
				const packVoltCell = newSheet.getCell(k + lastIndex - 1, 11);
				const packMeanVoltCell = newSheet.getCell(k + lastIndex - 1, 12);
				const packVoltStdDevCell = newSheet.getCell(k + lastIndex - 1, 13);
				const packAlertsCell = newSheet.getCell(k + lastIndex - 1, 14);
				const packCurrentCell = newSheet.getCell(k + lastIndex - 1, 15);
				const packSOCCell = newSheet.getCell(k + lastIndex - 1, 16);
				const bmsUptimeCell = newSheet.getCell(k + lastIndex - 1, 17);

				console.log(`Lap ${currentLap.num}`)
				lapNumCell.value = currentLap.num;
				swTimeCell.value = formatTime(currentInterval.swTime);
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
				await newSheet.saveUpdatedCells();
			}
			lastIndex += currentLap.data.length;
		}
	}
} catch (e) {
	console.error('Failed to save data to Google Sheets: ' + e);
	console.log(e)
}