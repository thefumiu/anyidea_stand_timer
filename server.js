const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const path = require('path');
const mongoose = require('mongoose');

const app = express();
const server = createServer(app);
const io = new Server(server);

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/timerDB')
  .then(() => console.log('MongoDB connected...'))
  .catch(err => console.error('MongoDB connection error:', err));

// Define Schema and Model
const leaderboardSchema = new mongoose.Schema({
  username: String,
  time: String
});

const Leaderboard = mongoose.model('Leaderboard', leaderboardSchema);

// Middleware to parse JSON
app.use(express.json());

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// GET Methods
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

app.get('/leaderboard-data', async (req, res) => {
    try {
        const leaderboard = await Leaderboard.find().sort({ time: -1 }).limit(10); // Adjust sorting and limit as needed
        io.emit("update-leaderboard", leaderboard); // Notify clients to update leaderboard
    } catch (err) {
        res.status(500).send('Error fetching leaderboard');
    }
});

// POST method to save leaderboard entry
app.post('/add-leaderboard', async (req, res) => {
    const { username, time } = req.body;

    if (!username || !time) {
        return res.status(400).json({ message: 'Username and time are required' });
    }

    try {
        const newEntry = new Leaderboard({ username, time });
        await newEntry.save();
        res.status(201).json({ message: 'Entry added successfully' });
        io.emit('update-leaderboard'); // Notify all clients to update leaderboard
    } catch (error) {
        console.error('Error adding entry:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// GET method to retrieve leaderboard
app.get('/get-leaderboard', async (req, res) => {
    try {
        const entries = await Leaderboard.find().sort({ time: -1 }).exec();
        res.json(entries);
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Socket.io setup
io.on('connection', (socket) => {
    console.log('A user connected');

    // Handle adding to leaderboard
    socket.on('add-to-leaderboard', async (data) => {
        console.log('Received leaderboard data:', data);

        const { username, time } = data;
        if (!username || !time) {
            return;
        }

        try {
            const newEntry = new Leaderboard({ username, time });
            await newEntry.save();
            io.emit('update-leaderboard'); // Notify all clients to update leaderboard
        } catch (error) {
            console.error('Error saving leaderboard entry:', error);
        }
    });

    // Handle username update
    socket.on('update-username', (username) => {
        console.log('Username updated:', username);
        io.emit('username-updated', username); // Notify all clients of username update
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

server.listen(8082, () => {
    console.log('Server running at http://localhost:8082');
});
