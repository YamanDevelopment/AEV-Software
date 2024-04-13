import { SerialPort } from 'serialport';
import { DelimiterParser } from '@serialport/parser-delimiter'
import { createServer } from 'http';
import { Server } from 'socket.io';
import { fileURLToPath } from 'url';
import {dirname, join} from 'node:path';
import express from "express";


const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

io.on("connection", (socket) => {
  console.log(socket);

  const port = new SerialPort({
    path: 'COM3',
    baudRate: 115200,
  });
  console.log(port);
  const parser = port.pipe(new DelimiterParser({ delimiter: '\n' }));
  parser.on('data', console.log);

  port.write('help', function(err) {
    if (err) {
      return console.log('Error on write: ', err.message)
    }
    console.log('message written')
  });


  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });  
})

const _dirname = dirname(fileURLToPath(import.meta.url));
app.use('/',express.static(join(_dirname,"static")));

app.get('/', (req, res) => {
  res.sendFile(join(_dirname,'/static/index.html'));
});
httpServer.listen(3000);


/*
// Create a port

  */