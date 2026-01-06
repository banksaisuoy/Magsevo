const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcrypt');

const dbPath = path.join(__dirname, 'visionhub.db');
const db = new sqlite3.Database(dbPath);

function initializeDatabase() {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            // Categories Table
            db.run(`CREATE TABLE IF NOT EXISTS categories (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL UNIQUE,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`);

            // Users Table
            db.run(`CREATE TABLE IF NOT EXISTS users (
                username TEXT PRIMARY KEY,
                password TEXT NOT NULL,
                role TEXT NOT NULL DEFAULT 'user',
                fullName TEXT,
                department TEXT,
                employeeId TEXT,
                email TEXT,
                phone TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`);

            // Videos Table
            db.run(`CREATE TABLE IF NOT EXISTS videos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                description TEXT,
                thumbnailUrl TEXT,
                videoUrl TEXT NOT NULL,
                optimizedUrl TEXT,
                views INTEGER DEFAULT 0,
                isFeatured BOOLEAN DEFAULT 0,
                categoryId INTEGER,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(categoryId) REFERENCES categories(id)
            )`);

            console.log('Database tables verified/created.');

            // Seed default admin user if not exists
            const adminPassword = 'admin'; // In a real app, this should be an env var or complex
            bcrypt.hash(adminPassword, 10, (err, hash) => {
                if (err) {
                    console.error('Error hashing password:', err);
                    return;
                }
                db.run(`INSERT OR IGNORE INTO users (username, password, role) VALUES ('admin', ?, 'admin')`, [hash], (err) => {
                    if (err) console.error('Error seeding admin:', err);
                    else console.log('Admin user verified.');
                    resolve();
                });
            });
        });
    });
}

if (require.main === module) {
    initializeDatabase();
}

module.exports = { db, initializeDatabase };
