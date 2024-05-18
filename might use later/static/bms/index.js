import { ipcRenderer } from "electron";
let container = document.getElementById("container");


ipcRenderer.send('connection');
ipcRenderer.on('data', (data) => {
    document.getElementById('container').innerHTML = JSON.stringify(data);
})