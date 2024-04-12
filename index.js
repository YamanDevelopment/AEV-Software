"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var serialport_1 = require("serialport");
var socket_io_1 = require("socket.io");
var express_1 = require("express");
var node_http_1 = require("node:http");
var node_url_1 = require("node:url");
var node_path_1 = require("node:path");
var portNum = 15;
var app = (0, express_1.default)();
var server = (0, node_http_1.createServer)(app);
var io = new socket_io_1.Server(server);
var __dirname = (0, node_path_1.dirname)((0, node_url_1.fileURLToPath)(import.meta.url));
app.get('/', function (req, res) {
    res.sendFile((0, node_path_1.join)(__dirname, 'index.html'));
});
io.on('connection', function (socket) {
    console.log('a user connected');
});
server.listen(3000, function () {
    console.log('server running at http://localhost:3000');
});
var options = {
    path: "path",
    baudRate: 9600,
};
var port = new serialport_1.SerialPort(options);
port.on('open', function () {
    port.port.emitData('data');
});
var parser = port.pipe(new serialport_1.ReadlineParser());
parser.on('data', console.log);
port.write('ROBOT PLEASE RESPOND\n');
