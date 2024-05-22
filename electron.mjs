import {app, BrowserWindow} from 'electron';
import { createServer } from 'http';
import express from "express";
import { SerialPort } from 'serialport';
import { ByteLengthParser } from '@serialport/parser-byte-length';
import { Server } from 'socket.io';

// global variables
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const port = new SerialPort({
    path: '/dev/ttyUSB0',
    baudRate: 115200,
});
const byteparser = port.pipe(new ByteLengthParser({
    length: 250
}));
const server = express(); // socketio server used as fallback in case of electron failure
const httpServer = createServer(server);
const io = new Server(httpServer);

let connection;
let interval;

httpServer.listen(3000, () => { //starts socketio server
    console.log('Site is running on port 3000')
});

io.on('connection', (socket) => { // used to detect when socketio fallback is triggered
    connection = true;
    socket.on('disconnect', () => {clearInterval(interval)})
})

function writeData(data) { // used to write commands to serialport
    if(!port.isOpen) {
        return false;
    }
    port.write(data, function(err) {
        if (err) {
            return console.log('Error on write: ', err.message)
        }
        console.log('message written')
    });
    return true;
}

function createWindow(route = '/') { //creates electron windows
    const win = new BrowserWindow({
        width: 900,
        height: 700,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
            preload: path.join(__dirname, 'preload.js')
          }
    });
    byteparser.on('data', (stream) => { //reads data
        let data = stream.toString().split('\n');
        let battery_data = {};
        for (let item of data) {
            item = item.trim().split(' ');
            item = item.filter((el) => el != '');
            if (item.includes(':') && !(item.includes('uptime')) && !(item.includes('alerts'))) {
                battery_data[item[0]] = item[2];
            }
        }
        if(!connection) {
            win.webContents.send('data', battery_data);
        }
        else {
            io.emit('data', battery_data);
        }
        port.on('error', (err) => {connection ? io.emit('error', err) : win.webContents.send('error', err);});
    });
    
    win.loadURL(`file://${path.join(__dirname, '/react/build/index.html')}#${route}`);
}

app.whenReady().then(() => {
    createWindow('/car');
    createWindow('/bms');
    if(writeData) {
        interval = setInterval(() => {writeData('sh\n')}, 1000);
    }
  })
  app.on('window-all-closed', () => {
    app.quit()
    port.close((err) => {
        if(err) {
            return console.log('error in closing port!!!');
        }
        return console.log('application fully closed')
    });
    clearInterval(interval);
  })