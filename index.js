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

async function writeData(data,port) {
  port.write(data, function(err) {
    if (err) {
      return console.log('Error on write: ', err.message)
    }
    console.log('message written')
  });
}
 function readData(port) {
  const parser = port.pipe(new ByteLengthParser({length: 250}));
  let data;
  parser.on('data', (stream) => {
    data = Buffer.toString(stream);
  });
  parser.off('data');
  return data;
}

function showBatteryData(port) {
  writeData('sh\n',port); //need to later add the command to switch to battery data
  let data = readData(port);
  return data;
}

io.on("connection", (socket) => {
  console.log(socket);

  const port = new SerialPort({
    path: 'COM3',
    baudRate: 115200,
  });
  let interval = setInterval(() => {
    let data = showBatteryData(port);
    socket.emit('data', data);
  }, 200)
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
