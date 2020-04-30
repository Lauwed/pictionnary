'use strict'

const express = require('express');
// Associe SocketIO à un serveur HTTP simple
// Server side
const socketIO = require('socket.io');

const port = process.env.PORT || 3000;
const index = '/pictionnary.html';

const server = express()
    // Will mount the index file as the specific path
    // Here path is not specified, so default is '/'
    // When app will be launched, this is pictionnary.html
    // That will be called
    .use((req, res) => res.sendFile(index, { root: __dirname }))
    // Bind and listen for connections on the specified
    // host and port
    .listen(port, () => console.log('Listening on port ', port))

// Access to 'server' after its initialisation
const io = socketIO(server);

// Register a new event handler on connections
io.on('connection', (socket) => {
    console.log('A new client joined the server');

    onConnection(socket);
});

let users = [];
let currentPlayer = null;
let timeout;
let words = ['apples', 'windows', 'linx'];

function onConnection(socket) {
    console.log(socket);
    // Handle the event triggered in pictionnary.html
    // named username
    socket.on('username', (username) => {
        console.log('Client name: ', username);
        socket.username = username;

        // If there is no player, the player will be the
        // currentPlayer init the timeout
        if(users.length === 0) {
            currentPlayer = socket;
            timeout = clearTimeout(timeout);
            users.push(socket);
            switchPlayer();
        }
        else {
            users.push(socket);
        }

        // Trigger an event and send an array of the users
        sendUsers();
    });

    function sendUsers() {
        // Trigger an event by sending a array of objects from
        // the array users
        io.emit('users', users.map((user) => {
            return {
                username: user.username,
                active: user === currentPlayer
            }
        }));
    }

    function switchPlayer() {
        // If there is no player, no switch (obvious)
        if(users.length === 0) return;

        // Get index of current player
        const indexCurrentPlayer = users.indexOf(currentPlayer);
        console.log(indexCurrentPlayer, (indexCurrentPlayer + 1) % users.length);
        // ????
        currentPlayer = users[(indexCurrentPlayer + 1) % users.length];

        sendUsers();
        // Set the time of the play time of the player
        // 20 sec.
        timeout = setTimeout(switchPlayer, 20000);

        currentPlayer.emit('word', words[Math.floor(words.length * Math.random())]);
        io.emit('clear');
    }
}