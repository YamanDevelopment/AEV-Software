"use strict";
import { SerialPort, ReadlineParser } from "serialport";

var options = {
    path: "COM3",
    baudRate: 9600,
};
var port = new SerialPort(options);
port.on('open', function () {
    port.port.emitData('data');
});
var parser = port.pipe(new ReadlineParser());
parser.on('data', console.log);
port.write('ROBOT PLEASE RESPOND\n');
