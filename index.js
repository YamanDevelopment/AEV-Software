import { SerialPort } from 'serialport';
import { ByteLengthParser } from '@serialport/parser-byte-length'
import { createServer } from 'http';
import { Server } from 'socket.io';
import { fileURLToPath } from 'url';
import {dirname, join} from 'node:path';
import express from "express";

import { read } from 'fs';


const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

console.log('hi');
function writeData(data, port) {
    port.write(data, function(err) {
        if (err) {
            return console.log('Error on write: ', err.message)
        }
        console.log('message written')
    });
}
io.on("connection", (socket) => {
    console.log(socket);
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
            socket.emit('data', battery_data);
        });
        let interval = setInterval(() => {
            writeData('sh\n', port);
        }, 1000)
        //need to later add the command to switch to battery data
        // When a client connects, send battery data (github copilot wrote that)
        //
        socket.on("disconnect", () => {
            console.log("Client disconnected");
        });
    } catch (err) {
        console.log(error);
    }
});
// Static files (html, css, js) (also wrote by copilot)
const _dirname = dirname(fileURLToPath(import.meta.url));
app.use('/', express.static(join(_dirname, "static")));
app.get('/', (req, res) => {
    res.sendFile(join(_dirname, '/static/index.html'));
});
httpServer.listen(3000);