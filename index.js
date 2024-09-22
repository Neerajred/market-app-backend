const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
require('dotenv').config(); // Load environment variables

const app = express();
const port = 5500;

const corsOptions = {
  origin: 'https://freshmartindia.netlify.app', 
  credentials: true, 
};

app.use(cors(corsOptions));

app.use(bodyParser.json());

let db;
let usersCollection;

// Initialize MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  tls: true, // Enable TLS
  tlsAllowInvalidCertificates: false, // Optional, depending on your cert settings
})
.then(() => {
  console.log('Connected to MongoDB');
  // Define usersCollection after connecting
  db = mongoose.connection;
  usersCollection = db.collection('MarketAppUserData'); // Replace with your actual collection name
})
.catch((error) => console.error('Failed to connect to MongoDB:', error));

// API endpoint to check if the email already exists
app.post('/check-email', async (req, res) => {
  const { email } = req.body;
  try {
    const user = await usersCollection.findOne({ email });
    res.status(200).json({ exists: !!user });
  } catch (error) {
    console.error('Error checking email:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// API endpoint to register a new user
app.post('/register', async (req, res) => {
  const { fullName, email, mobileNumber, password } = req.body;

  try {
    const user = await usersCollection.findOne({ email });
    if (user) {
      res.status(400).json({ message: 'User with this email already exists' });
    } else {
      await usersCollection.insertOne({ fullName, email, mobileNumber, password });
      res.status(201).json({ message: 'User registered successfully' });
    }
  } catch (error) {
    console.error('Error registering user:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// API endpoint to login a user
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await usersCollection.findOne({ email, password });
    if (user) {
      const token = jwt.sign({ id: user._id, email: user.email }, process.env.SECRET_KEY, { expiresIn: '1h' });
      res.status(200).json({ message: 'Login successful', user, token });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Error logging in:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/', (req, res) => {
  res.send("Hello Guru");
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
