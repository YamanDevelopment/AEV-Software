import { SerialPort } from 'serialport';
import { ByteLengthParser } from '@serialport/parser-byte-length'
import { createServer } from 'http';
import { Server } from 'socket.io';
import { fileURLToPath } from 'url';
import {dirname, join} from 'node:path';
import express from "express";
import { Parser } from "simple-text-parser";
import { read } from 'fs';


const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);



 function writeData(data,port) {
  port.write(data, function(err) {
    if (err) {
      return console.log('Error on write: ', err.message)
    }
    console.log('message written')
  });
}
 function readData(port,bytecount) {
  const byteparser = port.pipe(new ByteLengthParser({length: bytecount}));
  let data;
  byteparser.on('data', (stream) => {
    data = stream.toString();
    byteparser.off('data', () => {});
  });
  return data;
}

function getBatteryData(port) { 
  const textparser = new Parser();
  writeData('sh\n',port); //need to later add the command to switch to battery data
  let data = readData(port, 250);
  let battery_data = {};
  textparser.addRule('voltage : {voltage}v', (tag, voltage) => {
    battery_data.voltage = voltage; 
  });
  textparser.addRule('cells   : {cells}', (tag, cells) => {
    battery_data.cells = cells; 
  });
  textparser.addRule('mean    : {mean}v', (tag, mean) => {
    battery_data.mean = mean; 
  });
  textparser.addRule('current : {current}v', (tag, current) => {
    battery_data.current = current; 
  });

  data = textparser.render(data);

  return battery_data;
}

io.on("connection", (socket) => {
  console.log(socket);

  const port = new SerialPort({
    path: 'COM3',
    baudRate: 115200,
  });
  let interval = setInterval(() => {
    let data = getBatteryData(port);
    console.log(data);
    
    socket.emit('data', data);
  }, 1000)
  // When a client connects, send battery data (github copilot wrote that)
//
  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });  
})


// Static files (html, css, js) (also wrote by copilot)
const _dirname = dirname(fileURLToPath(import.meta.url));
app.use('/',express.static(join(_dirname,"static")));

app.get('/', (req, res) => {
  res.sendFile(join(_dirname,'/static/index.html'));
});
httpServer.listen(3000);
