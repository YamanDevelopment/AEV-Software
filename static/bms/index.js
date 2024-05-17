import { ipcRenderer } from "electron";


const socket = io();

socket.on("connect", () => {
    console.log(socket.id);
})

socket.on('data', (data) => {
    let container = document.getElementById("container");
    console.log(data)
})