  import { createServer } from 'http';
import { Server } from 'socket.io';
import { fileURLToPath } from 'url';
import {join} from 'node:path';
// import { read } from 'fs';

import { SerialPort } from 'serialport';
import { ByteLengthParser } from '@serialport/parser-byte-length'
import express from "express";
import {app, BrowserWindow} from 'electron';
import path from "node:path";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
console.log(__dirname);

const server = express();
const httpServer = createServer(server);
const io = new Server(httpServer);
function writeData(data, port) {
    console.log(port);
    if(!port.isOpen) {
        io.emit('error', 'Port is not open');
    }
    port.write(data, function(err) {
        if (err) {
            return console.log('Error on write: ', err.message)
        }
        console.log('message written')
    });
}
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
    io.emit('data', battery_data);
});
port.on('error', (err) => {
    io.emit('error', err);
});
io.on("connection", (event) => {
    if(port.isOpen) {
        try {
            let interval = setInterval(() => {
                writeData('sh\n', port);
            }, 1000);
        } catch (err) {
            console.log(err);
            io.emit('error', err);
        }
        event.on('disconnect', () => {
            clearInterval(interval);
        });
    }
    else {
        io.emit('error', 'Port is not open');
    }
});


// Static files (html, css, js) (also wrote by copilot)


httpServer.listen(3000, () => {
    console.log('Site is running on port 3000')
});

function createWindow(route = '/') {
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
    
    false ? win.loadURL(`https://localhost:3000${route}`): win.loadURL(`file://${path.join(__dirname, '/react/build/index.html')}#${route}`)
}

app.whenReady().then(() => {
    createWindow('/car');
    createWindow('/bms');
  })
  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin')  app.quit()
    port.close((err) => {
        if(err) {
            return console.log('error in closing port!!!');
        }
        return console.log('application fully closed')
    })
  })