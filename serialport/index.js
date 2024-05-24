import { SerialPort } from 'serialport';
import { ByteLengthParser } from '@serialport/parser-byte-length';
import { Server } from 'socket.io';
import express from 'express';

const port = new SerialPort({
    path: '/dev/ttyUSB0',
    baudRate: 115200,
});
const byteparser = port.pipe(new ByteLengthParser({
    length: 500
}));

const server = express(); // socketio server used as fallback in case of electron failure
const httpServer = createServer(server);
const io = new Server(httpServer);
const connections = [];

io.on('connection', (socket) => {
    connections.push(socket);
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
    io.emit('data', battery_data);
});
port.on('error', (err) => {io.emit('error', err)});


let interval = setInterval(() => {
    if(connections.length < 1) {
        clearInterval(interval);
    }
    else {
        writeData('sh\n');
    }
}, 1000);
