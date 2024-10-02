const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const path = require('path');
const mongoose = require('mongoose');

// SETUP - express, server
const app = express();
app.use(express.json());
app.use(express.static("css"));
app.set('view engine', 'ejs');
const server = createServer(app);
const io = new Server(server);

// GLOBAL
let tmp_username;
let max_user_at_leaderboard = 11;

// SETUP - database
mongoose.connect('mongodb://localhost:27017/timerDB').then(() => console.log('MongoDB connected...')).catch(err => console.error('MongoDB connection error:', err));
const leaderboardSchema = new mongoose.Schema({
    username: String,
    time: String,
    timex: Number
});
const Leaderboard = mongoose.model('Leaderboard', leaderboardSchema);

// METHODS
app.get('/', (req, res) => {
    res.render('index.ejs', {title: "Home"});
});
app.get('/timer', (req, res) => {
    res.render('timer.ejs', {title: "Timer"});
});
app.get('/panel', (req, res) => {
    res.render('panel.ejs', {title: "Panel"});
});
app.get('/leaderboard', (req, res) => {
    res.render('leaderboard.ejs', {title: "Leaderboard"});
});

// SOCKET
io.on('connection', (socket) => {
     // Check if the username exists and handle accordingly
    socket.on('update-username', async (data) => {
        try {
            const existingUserCount = await Leaderboard.countDocuments({ username: new RegExp(`^${data.username}(\\(\\d+\\))?$`, 'i') });
            tmp_username = data.username;
            if (existingUserCount != 0) io.emit("error", {code: 1, text: data.username + " already exist."});
            if (data.username == "") io.emit("error", {code: 3, text: "Empty username (No Saves)."});
            io.emit('update-username', tmp_username);
        } catch (error) {
            console.error(error);
            io.emit("error", {code: 2, text: "Database connection at update-username."});
        }
    });
    socket.on('fetch-username', () => {
        if (tmp_username) io.emit('update-username', tmp_username);
        else io.emit("error", {code: 4, text: "No saved username fetch-username."});
    });

    // Handle updating the leaderboard
    socket.on('update-leaderboard', async (data) => {
        try {
            const existingUserCount = await Leaderboard.countDocuments({ username: new RegExp(`^${data.username}(\\(\\d+\\))?$`, 'i') });
            if (existingUserCount == 0) await Leaderboard({ username: data.username, time: data.time, timex: data.timex }).save();
            else await Leaderboard.findOneAndUpdate({username: data.username},{time: data.time, timex: data.timex}, {new: true});
            
            const leaderboard = await Leaderboard.find().sort({ timex: 1 }).limit(max_user_at_leaderboard);
            io.emit('update-leaderboard', leaderboard);
        } catch (error) {
            console.error(error);
            io.emit("error", {code: 2, text: "Database connection at update-leaderboard."});
        }
    });

    socket.on('update-leaderboard-once', async () => {
        try {
            const leaderboard = await Leaderboard.find().sort({ timex: 1 }).limit(max_user_at_leaderboard);
            io.emit('update-leaderboard', leaderboard); // Notify all clients to update leaderboard
        } catch (error) {
            console.error(error);
            io.emit("error", {code: 2, text: "Database connection at update-leaderboard-once."});
        }
    });
});

// LAUNCH
server.listen(8082, () => {
    console.log('Server running at http://localhost:8082');
});
