const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');

const path = require('path'); 


const app = express();
const server = createServer(app);
const io = new Server(server);

var ONLINE_USERS = 0;

io.on('connection', (socket) => {
    ONLINE_USERS++;
    io.emit("value ONLINE_USERS", ONLINE_USERS);

    socket.on('disconnect', (socket) => {
        ONLINE_USERS--;
        io.emit("value ONLINE_USERS", ONLINE_USERS);
    });
});

// GET METHODS

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});


app.get('/timer', (req, res) => {
    
    res.sendFile(path.join(__dirname, 'timer.html'));

});

app.get('/username', (req, res) => {
    
    res.sendFile(path.join(__dirname, 'username.html'));

});

app.get('/leaderboard', (req, res) => {
    
    res.sendFile(path.join(__dirname, 'leaderboard.html'));

});




server.listen(8082, () => {
    console.log('server running at http://localhost:8082');
});