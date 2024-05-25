import { SerialPort } from 'serialport';
import { ByteLengthParser } from '@serialport/parser-byte-length';
import { Server } from 'socket.io';
import {createServer} from 'http';
import express from 'express';

const port = new SerialPort({
    path: '/dev/ttyUSB0',
    baudRate: 115200,
});
const byteparser = port.pipe(new ByteLengthParser({
    length: 500
}));
port.open();
const server = express(); // socketio server used as fallback in case of electron failure
const httpServer = createServer(server);
const io = new Server(httpServer);
const connections = [];

class BmsData {
    constructor(data) {
        const voltagere = new RegExp("\\s{4}voltage\\s+:\\s[0-9]{2}\\.[0-9]{2}v");
        const cellsre = new RegExp("\\s{4}cells\\s+:\\s[0-9]{2}.+");
        const meanre = new RegExp("\\s{4}mean\\s+:\\s[0-9]{2}\\.[0-9]{2}v");
        const stddevre = new RegExp("\\s{4}stddev\\s+:\\s[0-9]{2}\\.[0-9]{2}v");
        const currentre = new RegExp("\\s{4}current\\s+:\\s.[0-9]+\\.[0-9]+A");
        const socre = new RegExp("\\s{4}soc\\s+:\\s[0-9].*[0-9]*%");
        for(let item in data) {
            if(voltagere.test(item)) {
                this.voltage = item.match(/[0-9]{2}\.[0-9]{2}/)[0];
            }
            else if(cellsre.test(item)) {
                this.cells = item.match(/[0-9]{2}/)[0];
            }
            else if(meanre.test(item)) {
                this.mean = item.match(/[0-9]{2}\.[0-9]{2}/)[0];
            }
            else if(stddevre.test(item)) {
                this.stddev = item.match(/[0-9]{2}\.[0-9]{2}/)[0];
            }
            else if(currentre.test(item)) {
                this.current = item.match(/.[0-9]+.[0-9]+/)[0];
            }
            else if(socre.test(item)) {
                this.soc = item.match(/[0-9].*[0-9]*/)[0];
            }
        }
    }
}

byteparser.on('data', (stream) => { //reads data
    let data = stream.toString().split('\n');
    for (let item of data) {
        let battery_data = new BmsData(item);
    }
    io.emit('data', battery_data);
});
port.on('error', (err) => {io.emit('error', err)});

io.on('connection', (socket) => {
    console.log('New connection!');
    connections.push(socket);
    if(writeData('sh\n')) {
        let interval = setInterval(() => {
            if(connections.length < 1) {
                clearInterval(interval);
            }
            else {
                console.log("write success: ", writeData('sh\n'));
            }
        }, 1000);
    }
    else {
        io.emit('error', 'BMS is not connected')
    }
    


});

httpServer.listen(3000, () => { //starts socketio server
    console.log('Site is running on port 3000')
});

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






