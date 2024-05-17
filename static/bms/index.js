import { ipcRenderer } from "electron";

ipcRenderer.send('connection');
ipcRenderer.on('data', (data) => {
    document.getElementById('container').innerHTML = JSON.stringify(data);
})