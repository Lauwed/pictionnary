'use strict'

const express = require('express');
const socketIO = require('socket.io');

const port = process.env.PORT || 3000;
const index = '/pictionnary.html';

const server = express()
    .use((req, res) => res.sendFile(index, { root: __dirname }))
    .listen(port, () => console.log('Listening on port ', port))

const io = socketIO(server);

io.on('connection', (socket) => {
    console.log('A new client joined the server');

    onConnection(socket);
});

let users = [];
let currentPlayer = null;
let timeout;
let words = ['apples', 'windows', 'linx'];

function onConnection(socket) {
    socket.on('username', (username) => {
        console.log('Client name: ', username);
    })
}