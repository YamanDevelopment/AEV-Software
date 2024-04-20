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
    console.log(data);
    byteparser.off('data', () => {});
  });
  return data;
}

function getBatteryData(port) { 
  writeData('sh\n',port); //need to later add the command to switch to battery data
  // let data = readData(port, 250);
  let data = `  no cells detected
  alerts    : not locked
  current   : -62.1A
  SOC       : 0%
  uptime: 0 hour(s), 5 minute(s), 24 second(s)`;
  let battery_data = {};
  let data_arr = data.split('\n');
  let new_arr = []
  for(let item of data_arr) {
    item = item.trim();
    item = item.split(' ');
    item = item.filter((el) => el != '');
    new_arr.push(item);
    if(item.includes(':') && !(item.includes('uptime')) && !(item.includes('alerts'))){
      battery_data[item[0]] = item[2];
    }
    //if(item.includes('alerts')) {}
    
  }
  return battery_data;
}

io.on("connection", (socket) => {
  console.log(socket);

  const port = new SerialPort({
    path: 'COM3',
    baudRate: 115200,
  });
  let interval = setInterval(() => {
    let data = getBatteryData(port)
        
    socket.emit('data', data.current);
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
