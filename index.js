const express = require('express');
const { MongoClient } = require('mongodb'); // Import MongoDB Client
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
const port = 5500;

app.use(cors());
app.use(bodyParser.json());

const uri = "mongodb+srv://neerajmukkara:Neeraj123@userdata.8kbakbb.mongodb.net/?retryWrites=true&w=majority&appName=UserData"; // Replace <db_password> with your actual MongoDB password

let db;
let usersCollection;

// Initialize MongoDB connection
// Initialize MongoDB connection
MongoClient.connect(uri)
  .then(client => {
    console.log('Connected to MongoDB');
    db = client.db('UserData'); // Database name
    usersCollection = db.collection('users'); // Collection name
  })
  .catch(err => console.error('Failed to connect to MongoDB', err));


// API endpoint to check if the email already exists
app.post('/check-email', async (req, res) => {
  const { email } = req.body;
  try {
    const user = await usersCollection.findOne({ email });
    if (user) {
      res.status(200).json({ exists: true });
    } else {
      res.status(200).json({ exists: false });
    }
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
const SECRET_KEY = 'FreshMart'; // Replace with your secret key

app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await usersCollection.findOne({ email, password });
    if (user) {
      const token = jwt.sign({ id: user._id, email: user.email }, SECRET_KEY, { expiresIn: '1h' });
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
  res.send("Hello Gurur");
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
