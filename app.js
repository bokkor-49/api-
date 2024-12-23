const express = require('express');
const mongoose = require('mongoose');
const app = express();
const port = process.env.port || 3000;

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/teachdb')
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

// Create a schema for teach and reply
const teachSchema = new mongoose.Schema({
    key: String,
    teach: String,
    reply: String
});

// Create a model from the schema
const Teach = mongoose.model('Teach', teachSchema);

// Middleware to parse URL encoded data
app.use(express.urlencoded({ extended: true }));

// Route to add a teach using URL parameters
app.get('/:key/teach=:teach/reply=:reply', async (req, res) => {
    const { key, teach, reply } = req.params;

    // Save teach and reply to MongoDB
    const newTeach = new Teach({ key, teach, reply });
    await newTeach.save();

    res.json({ message: `Teach added successfully for key: ${key}`, data: { teach, reply } });
});

// Route to fetch a teach using the key
app.get('/get/:key', async (req, res) => {
    const key = req.params.key;

    // Find teach from MongoDB by key
    const teachData = await Teach.findOne({ key });

    if (!teachData) {
        return res.status(404).json({ message: `Teach for key '${key}' not found!` });
    }

    res.json({ key, teach: teachData.teach, reply: teachData.reply });
});

// Route to fetch all teaches
app.get('/all', async (req, res) => {
    const allTeaches = await Teach.find();
    res.json(allTeaches);
});

// Route to remove a teach using the key
app.get('/remove/:key', async (req, res) => {
    const key = req.params.key;

    // Find and remove the teach from MongoDB
    const teachData = await Teach.findOneAndDelete({ key });

    if (!teachData) {
        return res.status(404).json({ message: `Teach for key '${key}' not found to remove!` });
    }

    res.json({ message: `Teach for key '${key}' removed successfully!` });
});

// Route to reply based on msg
app.get('/bby/msg/:message', async (req, res) => {
    const message = req.params.message;

    // Find reply from MongoDB by the message
    const teachData = await Teach.findOne({ teach: message });

    if (!teachData) {
        return res.status(404).json({ message: `No reply found for message '${message}'!` });
    }

    res.json({ message: teachData.reply });
});

// Start the server
app.listen(port, () => {
    console.log(`Teach API is running at http://localhost:${port}`);
});
