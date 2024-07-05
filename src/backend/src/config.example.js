const config = {
	'BMS': {
		'path': '/dev/ttyUSB0',
		'baudRate': 115200,
	},
	'GPS': {
		'path': '/dev/ttyACM0',
	},
	'ports': {
		socket: 3001,
		api: 3002,
	},
	'debug': false,
	'spreadsheet': {
		'credentials': {
			'client_email': '',
			'client_private_key': '',
			'scopes': ['https://www.googleapis.com/auth/spreadsheets'],
		},
		'sheetID': '',
	},
};

export default config;