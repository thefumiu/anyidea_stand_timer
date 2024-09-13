const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const path = require('path');
const mongoose = require('mongoose');

const app = express();
const server = createServer(app);
const io = new Server(server);
let tmp_username;

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/timerDB')
  .then(() => console.log('MongoDB connected...'))
  .catch(err => console.error('MongoDB connection error:', err));

// Define Schema and Model
const leaderboardSchema = new mongoose.Schema({
  username: String,
  time: String,
  timex: String
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
    // Fetching data from /username
    socket.on('save-username-to-cache', async (data) => {
        // Global variable (not cookies)
        tmp_username = data;
        io.emit("save-username-to-cache", data);
        console.log("Username setted: ", tmp_username);
        
    });
    // Updating Leaderboard with new data
    socket.on('update-leaderboard', async (data) => {
        try {
            const newEntry = new Leaderboard({username: data.username, time: data.time, timex: data.timex}); 
            await newEntry.save();
            const leaderboard = await Leaderboard.find().sort({ timex: 1 }).limit(10); 
            io.emit('update-leaderboard', leaderboard); // Notify all clients to update leaderboard
        } catch (error) {
            console.error('update-leaderboard:', error);
        }
    });
});

server.listen(8082, () => {
    console.log('Server running at http://localhost:8082');
});
