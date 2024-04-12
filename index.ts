import { ReadlineParser, SerialPort } from "serialport";
import { Server } from 'socket.io';
import express from 'express';
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const portNum = 15;

const app = express();
const server = createServer(app);
const io = new Server(server);

const __dirname = dirname(fileURLToPath(import.meta.url));

app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'index.html'));
});

io.on('connection', (socket) => {
  console.log('a user connected');
});

server.listen(3000, () => {
  console.log('server running at http://localhost:3000');
});

interface portOptions {
    path?: string,
    baudRate?: number;
}


let options: portOptions = {
    path: "path",
    baudRate: 9600,
}
const port = new SerialPort(options);

port.on('open', () => {
    port.port.emitData('data');
  })


const parser = port.pipe(new ReadlineParser());
parser.on('data',console.log);
port.write('ROBOT PLEASE RESPOND\n');



            