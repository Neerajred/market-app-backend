const sqlite3 = require('sqlite3').verbose();

exports.handler = async (event, context) => {
  const db = new sqlite3.Database('./usersDB.db');
  
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Method Not Allowed' }),
    };
  }

  const { email } = JSON.parse(event.body);

  return new Promise((resolve) => {
    db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
      if (err) {
        console.error('Error fetching user:', err.message);
        resolve({
          statusCode: 500,
          body: JSON.stringify({ message: 'Internal server error' }),
        });
      } else if (row) {
        resolve({
          statusCode: 200,
          body: JSON.stringify({ exists: true }),
        });
      } else {
        resolve({
          statusCode: 200,
          body: JSON.stringify({ exists: false }),
        });
      }
    });
  });
};
