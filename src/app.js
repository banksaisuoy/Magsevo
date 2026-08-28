const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const videoRoutes = require('./routes/video');

const app = express();
app.use(express.json());

// Initialize SQLite database
const initDb = (dbPath) => {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        return reject(err);
      }

      // Execute migrations
      const migrationPath = path.join(__dirname, 'migrations', '001_create_videos_table.sql');
      if (fs.existsSync(migrationPath)) {
        const migrationSql = fs.readFileSync(migrationPath, 'utf8');
        db.exec(migrationSql, (err) => {
          if (err) {
            return reject(err);
          }
          resolve(db);
        });
      } else {
        // If no migration file, try creating the table directly (for fallback)
        db.run(`CREATE TABLE IF NOT EXISTS videos (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          description TEXT,
          video_url TEXT NOT NULL,
          category_id INTEGER,
          user_id INTEGER,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`, (err) => {
          if (err) return reject(err);
          resolve(db);
        });
      }
    });
  });
};

// Start function returning a promise that resolves when db is ready
const startApp = async (dbPath = ':memory:') => {
  try {
    const db = await initDb(dbPath);
    app.set('db', db);

    // Mount routes
    app.use('/api/videos', videoRoutes(db));

    // Expose close connection for testing
    app.closeDb = () => {
      return new Promise((resolve, reject) => {
        db.close((err) => {
          if (err) return reject(err);
          resolve();
        });
      });
    };

    return app;
  } catch (error) {
    console.error('Failed to start app:', error);
    throw error;
  }
};

module.exports = startApp;