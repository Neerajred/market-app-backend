const sqlite3 = require('sqlite3').verbose();
const jwt = require('jsonwebtoken');

const SECRET_KEY = 'FreshMart';

exports.handler = async (event, context) => {
  const db = new sqlite3.Database('./usersDB.db');

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Method Not Allowed' }),
    };
  }

  const { email, password } = JSON.parse(event.body);

  return new Promise((resolve) => {
    db.get(
      'SELECT * FROM users WHERE email = ? AND password = ?',
      [email, password],
      (err, row) => {
        if (err) {
          console.error('Error fetching user:', err.message);
          resolve({
            statusCode: 500,
            body: JSON.stringify({ message: 'Internal server error' }),
          });
        } else if (row) {
          const token = jwt.sign({ id: row.id, email: row.email }, SECRET_KEY, {
            expiresIn: '1h',
          });
          resolve({
            statusCode: 200,
            body: JSON.stringify({ message: 'Login successful', user: row, token }),
          });
        } else {
          resolve({
            statusCode: 401,
            body: JSON.stringify({ message: 'Invalid email or password' }),
          });
        }
      }
    );
  });
};
