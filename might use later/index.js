  import { createServer } from 'http';
import { Server } from 'socket.io';
// import { fileURLToPath } from 'url';
import {join} from 'node:path';
// import { read } from 'fs';

import { SerialPort } from 'serialport';
import { ByteLengthParser } from '@serialport/parser-byte-length'
import express from "express";
import {app, BrowserWindow, ipcMain} from 'electron';
import path from "node:path";
import { isDev } from 'electron-is-dev';
const __dirname = path.dirname(new URL(import.meta.url).pathname);
console.log(__dirname);

const server = express();
function writeData(data, port) {
    port.write(data, function(err) {
        if (err) {
            return console.log('Error on write: ', err.message)
        }
        console.log('message written')
    });
}
ipcMain.on("connection", (event) => {
    console.log(event);
    try {
        let data;
        const port = new SerialPort({
            path: '/dev/ttyUSB0',
            baudRate: 115200,
        });
        const byteparser = port.pipe(new ByteLengthParser({
            length: 250
        }));
        byteparser.on('data', (stream) => {
            let data = stream.toString();
            console.log(data);
            let battery_data = {};
            let data_arr = data.split('\n');
            let new_arr = []
            for (let item of data_arr) {
                item = item.trim();
                item = item.split(' ');
                item = item.filter((el) => el != '');
                new_arr.push(item);
                if (item.includes(':') && !(item.includes('uptime')) && !(item.includes('alerts'))) {
                    battery_data[item[0]] = item[2];
                }
                //if(item.includes('alerts')) {}
            }
            event.reply('data', battery_data);
        });
        let interval = setInterval(() => {
            writeData('sh\n', port);
        }, 1000);
    } catch (err) {
        console.log(error);
    }
});
// Static files (html, css, js) (also wrote by copilot)

server.use(express.static(path.join(__dirname, '/static')));
server.listen(3000, () => {
    console.log('Site is running on port 3000')
})

function createWindow(route = '/') {
    const win = new BrowserWindow({
        width: 900,
        height: 700,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
          }
    })
    isDev ? win.loadURL(`https://localhost:3000${route}`): win.loadURL(`file://${path.join(__dirname, '/static/index.html')}#${route}`)
}

app.whenReady().then(() => {
    createWindow('/car');
    createWindow('/bms');
  })
  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin')  app.quit()
  })