const bcrypt = require('bcrypt');
const { getDB } = require('../db/connection');

class User {
  static async findByEmail(email) {
    const db = getDB();
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  static async create(userData) {
    const { email, password } = userData;
    const db = getDB();
    const hashedPassword = await bcrypt.hash(password, 12);
    
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO users (email, password) VALUES (?, ?)',
        [email, hashedPassword],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ id: this.lastID, email });
          }
        }
      );
    });
  }

  static async validatePassword(plainText, hashed) {
    return bcrypt.compare(plainText, hashed);
  }
}

module.exports = User;