const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
const port = 5500;

app.use(cors());
app.use(bodyParser.json());


// check the email if it exists before or not
app.post('/check-email', (req, res) => {
  const { email } = req.body;

  db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
    if (err) {
      console.error('Error fetching user:', err.message);
      res.status(500).json({ message: 'Internal server error' });
    } else if (row) {
      res.status(200).json({ exists: true });
    } else {
      res.status(200).json({ exists: false });
    }
  });
});

// Initialize SQLite database
const db = new sqlite3.Database('usersDB.db', (err) => {
    if (err) {
      console.error('Error opening database:', err.message);
    } else {
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          fullName TEXT NOT NULL,
          email TEXT NOT NULL,
          mobileNumber TEXT NOT NULL,
          password TEXT NOT NULL
        )
      `, (err) => {
        if (err) {
          console.error('Error creating table:', err.message);
        }
      });
    }
  });  

// API endpoint to register a new user
app.post('/register', (req, res) => {
  const { fullName, email, mobileNumber, password } = req.body;

  db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
    if (err) {
      console.error('Error fetching user:', err.message);
      res.status(500).json({ message: 'Internal server error' });
    } else if (row) {
      res.status(400).json({ message: 'User with this email already exists' });
    } else {
      db.run(
        'INSERT INTO users (fullName, email, mobileNumber, password) VALUES (?, ?, ?, ?)'
      , [fullName, email, mobileNumber, password], function (err) {
        if (err) {
          console.error('Error inserting user:', err.message);
          res.status(500).json({ message: 'Internal server error' });
        } else {
          res.status(201).json({ message: 'User registered successfully' });
        }
      });
    }
  });
});


// API endpoint to login a user
const SECRET_KEY = 'FreshMart'; // Replace with your secret key

app.post('/login', (req, res) => {
  const { email, password } = req.body;

  db.get(
    'SELECT * FROM users WHERE email = ? AND password = ?'
  , [email, password], (err, row) => {
    if (err) {
      console.error('Error fetching user:', err.message);
      res.status(500).json({ message: 'Internal server error' });
    } else if (row) {
      const token = jwt.sign({ id: row.id, email: row.email }, SECRET_KEY, { expiresIn: '1h' });
      res.status(200).json({ message: 'Login successful',user:row, token });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  });
});


app.get('/',(req,res)=>{
    res.send("Hello Gurur");
})

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});