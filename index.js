const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config(); 

// Initialize the Express app
const app = express();
const port = 5500;

// Middleware
app.use(cors());
app.use(bodyParser.json());

const db_username= process.env.MONGODB_USER_NAME;
const db_password = process.env.MONGODB_PASS;


// MongoDB connection
const dbURI = `mongodb+srv://${db_username}:${db_password}@userdata.8kbakbb.mongodb.net/MarketAppUserData?retryWrites=true&w=majority&appName=MarketAppUserData`;


mongoose.connect(dbURI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Error connecting to MongoDB', err));

// Mongoose User Schema
const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },  // email should be unique
  mobileNumber: { type: String, required: true },
  password: { type: String, required: true },
  username: { type: String }  // Allow duplicates
});

const User = mongoose.model('User', userSchema);

// Secret key for JWT
const SECRET_KEY = process.env.SECRET_KEY; 

// Check if the email exists
app.post('/check-email', async (req, res) => {
  const { email } = req.body;
  
  try {
    const user = await User.findOne({ email });
    if (user) {
      res.status(200).json({ exists: true });
    } else {
      res.status(200).json({ exists: false });
    }
  } catch (err) {
    console.error('Error checking email:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Register a new user
app.post('/register', async (req, res) => {
  const { fullName, email, mobileNumber, password, username } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    
    if (existingUser) {
      res.status(400).json({ message: 'User with this email already exists' });
    } else {
      const newUser = new User({ fullName, email, mobileNumber, password, username });
      await newUser.save();
      res.status(201).json({ message: 'User registered successfully' });
    }
  } catch (err) {
    console.error('Error registering user:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Login user
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email, password });
    
    if (user) {
      const token = jwt.sign({ id: user._id, email: user.email }, SECRET_KEY, { expiresIn: '1h' });
      res.status(200).json({ message: 'Login successful', user, token });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (err) {
    console.error('Error logging in:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Root route
app.get('/', (req, res) => {
  res.send("Welcome to Fresh Mart");
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
