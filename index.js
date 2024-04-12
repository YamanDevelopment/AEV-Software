"use strict";
import { SerialPort, ReadlineParser } from "serialport";

var port = new SerialPort('\\\\.\\COM3', {baudrate: 9600}, true);
port.on('open', function () {
    port.port.emitData('data');
});
var parser = port.pipe(new ReadlineParser());
parser.on('data', console.log);
port.write('ROBOT PLEASE RESPOND\n');
