// import {io} from "/socket.io/socket.io.esm.min.js";


const socket = io();

socket.on("connect", () => {
    console.log(socket.id);
})

socket.on('data', (data) => {
    let container = document.getElementById("container");
    container.innerHTML = data;
})