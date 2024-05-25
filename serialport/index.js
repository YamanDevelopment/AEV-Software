import { SerialPort } from 'serialport';
import { DelimiterParser } from '@serialport/parser-delimiter';
import { Server } from 'socket.io';
import {createServer} from 'http';
import express from 'express';
import cors from 'cors';



const port = new SerialPort({
    path: '/dev/ttyUSB0',
    baudRate: 115200,
});
const byteparser = port.pipe(new DelimiterParser({
    delimiter: 'sh'
}));
port.open();
const server = express(); // socketio server used as fallback in case of electron failure
server.use(cors())
const httpServer = createServer(server);
const io = new Server(httpServer, {cors: {
    origin: '*',
  }});
const connections = [];

class BmsData {
    constructor(data) {
        console.log(data);
        const voltagere = new RegExp("\\s+voltage\\s+:\\s[0-9]{2}\\.[0-9]{2}v");
        const cellsre = new RegExp("\\s+cells\\s+:\\s[0-9]{2}.+");
        const meanre = new RegExp("\\s+mean\\s+:\\s[0-9]+\\.[0-9]+v");
        const stddevre = new RegExp("\\s+std dev\\s+:\\s[0-9]+\\.[0-9]+v");
        const currentre = new RegExp("\\s+current\\s+:\\s.[0-9]+\\.[0-9]+A");
        const socre = new RegExp("\\s+soc\\s+:\\s[0-9].*[0-9]*%");
        for(let item of data) {
            console.log(item);
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
    let battery_data = new BmsData(data);
    console.log(battery_data);
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






