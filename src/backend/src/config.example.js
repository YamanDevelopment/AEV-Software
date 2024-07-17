const config = {
	'BMS': {
		'path': '/dev/ttyUSB0',
		'baudRate': 115200,
	},
	'GPS': {
		'path': '/dev/ttyACM0',
	},
	'ports': {
		'socket': 3001,
		'api': 3002,
	},
	'debug': false,
	'google': {
		'creds': { }, // Service account credentials .json file
		'scopes': ['https://www.googleapis.com/auth/spreadsheets', 'https://www.googleapis.com/auth/drive.file'],
		'sheetID': '',
	},
	'discord': {
		'webhookURL': '',
		'channel': '',
		'userMentionID': '',
	},
	'backupPaths': [ '/mnt' ],
};

export default config;