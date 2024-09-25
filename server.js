const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const path = require('path');
const mongoose = require('mongoose');

const app = express();
const server = createServer(app);
const io = new Server(server);
let tmp_username;
let max_user_at_leaderboard = 8;

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/timerDB').then(() => console.log('MongoDB connected...')).catch(err => console.error('MongoDB connection error:', err));

// Define Schema and Model
const leaderboardSchema = new mongoose.Schema({
    username: String,
    time: String,
    timex: Number
});

const Leaderboard = mongoose.model('Leaderboard', leaderboardSchema);

// Middleware to parse JSON
app.use(express.json());
app.use(express.static("files"));
app.set('view engine', 'ejs');

// GET Methods
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

app.post('/only-for-external-button', (req, res) => {
    console.log("external-pressed");
    res.sendStatus(200);
    
    io.emit("click-from-external-button");
});

// Socket.io setup
io.on('connection', (socket) => {
     // Check if the username exists and handle accordingly
    socket.on('update-username', async (data, mode) => {
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

    // Handle updating the leaderboard
    socket.on('update-leaderboard', async (data) => {
        try {
            const existingUserCount = await Leaderboard.countDocuments({ username: new RegExp(`^${data.username}(\\(\\d+\\))?$`, 'i') });
            if (existingUserCount == 0) await Leaderboard({ username: data.username, time: data.time, timex: data.timex }).save();
            else await Leaderboard.findOneAndUpdate({username: data.username},{time: data.time, timex: data.timex}, {new: true});
            
            const leaderboard = await Leaderboard.find().sort({ timex: 1 }).limit(11);
            io.emit('update-leaderboard', leaderboard);
        } catch (error) {
            console.error(error);
            io.emit("error", {code: 2, text: "Database connection at update-leaderboard."});
        }
    });

    socket.on('update-leaderboard-once', async () => {
        try {
            const leaderboard = await Leaderboard.find().sort({ timex: 1 }).limit(11);
            io.emit('update-leaderboard', leaderboard); // Notify all clients to update leaderboard
        } catch (error) {
            console.error(error);
            io.emit("error", {code: 2, text: "Database connection at update-leaderboard-once."});
        }
    });
});

server.listen(8082, () => {
    console.log('Server running at http://localhost:8082');
});
