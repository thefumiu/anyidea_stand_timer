const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const path = require('path'); 
const mongodb = require("mongodb");


const app = express();
const server = createServer(app);
const io = new Server(server);

// GET METHOD

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