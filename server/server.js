// Load environment variables
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

// Serve uploads from custom path if configured
if (process.env.UPLOAD_PATH) {
    app.use('/uploads', express.static(process.env.UPLOAD_PATH));
}

// Database setup
const { Database } = require('./models/index');
const dbPath = process.env.DB_PATH || path.join(__dirname, 'visionhub.db');
const dbInstance = new Database(dbPath);
let db;

// Initialize database connection and start server
async function initializeApp() {
    try {
        db = await dbInstance.connect();
        console.log('Connected to SQLite database.');
        await initDatabase();
        // Create database indexes for optimization
        await dbInstance.createIndexes();

        // Make database available to routes
        app.set('db', db);

        // Import API routes after database is connected
        const apiRoutes = require('./routes');
        const healthMonitor = require('./services/healthMonitor');
        const aiService = require('./services/aiService');
        const apiManager = require('./middleware/apiManager');

        // Get rate limiters
        const rateLimiters = apiManager.getRateLimiters();

        // Apply middleware
        app.use(apiManager.securityHeaders());
        app.use(apiManager.requestMonitor());
        app.use(apiManager.validateApiKey());

        // Apply rate limiting to different route groups
        app.use('/api/auth', rateLimiters.auth);
        app.use('/api/ai', rateLimiters.ai);
        app.use('/api/uploads', rateLimiters.files);
        app.use('/api', rateLimiters.general);

        // Mount API routes
        app.use('/api', apiRoutes);
        app.use('/api/settings', require('./routes/settings'));

        // Serve frontend
        app.get('/', (req, res) => {
            res.sendFile(path.join(__dirname, '../public/index.html'));
        });

        // Catch-all handler: send back index.html for client-side routing
        app.get('*', (req, res) => {
            res.sendFile(path.join(__dirname, '../public/index.html'));
        });

        // Export app and db for use in other files
        module.exports = { app, db, authenticateToken, requireAdmin, logAction, JWT_SECRET };

        // Start server
        app.listen(PORT, async () => {
            console.log(`Server running on http://localhost:${PORT}`);

            // Initialize AI service
            try {
                // Pass database connection to AI service
                const aiService = require('./services/aiService');
                aiService.setDatabase(db);
                await aiService.initialize();
                console.log('AI Service initialized');
            } catch (error) {
                console.warn('AI Service initialization failed:', error.message);
            }

            // Start health monitoring
            healthMonitor.startMonitoring();
            console.log('System health monitoring started');
        });
    } catch (error) {
        console.error('Failed to initialize application:', error.message);
        process.exit(1);
    }
}

// Initialize database tables
function initDatabase() {
    const tables = [
        `CREATE TABLE IF NOT EXISTS users (
            username TEXT PRIMARY KEY,
            password TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'user',
            fullName TEXT,
            department TEXT,
            employeeId TEXT,
            email TEXT,
            phone TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`,
        `CREATE TABLE IF NOT EXISTS categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`,
        `CREATE TABLE IF NOT EXISTS videos (
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
        )`,
        `CREATE TABLE IF NOT EXISTS user_favorites (
            userId TEXT,
            videoId INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (userId, videoId),
            FOREIGN KEY(userId) REFERENCES users(username),
            FOREIGN KEY(videoId) REFERENCES videos(id)
        )`,
        `CREATE TABLE IF NOT EXISTS comments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            videoId INTEGER,
            userId TEXT,
            text TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(videoId) REFERENCES videos(id),
            FOREIGN KEY(userId) REFERENCES users(username)
        )`,
        `CREATE TABLE IF NOT EXISTS reports (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            userId TEXT,
            videoId INTEGER,
            reason TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(userId) REFERENCES users(username),
            FOREIGN KEY(videoId) REFERENCES videos(id)
        )`,
        `CREATE TABLE IF NOT EXISTS logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            userId TEXT,
            action TEXT NOT NULL,
            details TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(userId) REFERENCES users(username)
        )`,
        `CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`
    ];

    tables.forEach((table) => {
        db.run(table, (err) => {
            if (err) {
                console.error('Error creating table:', err.message);
            }
        });
    });

    // Insert default data
    seedDatabase();
}

// Seed database with initial data
async function seedDatabase() {
    // Create default admin user
    const adminPassword = await bcrypt.hash('123456', 10);
    const userPassword = await bcrypt.hash('123456', 10);

    db.run(`INSERT OR IGNORE INTO users (username, password, role) VALUES (?, ?, ?)`,
           ['admin', adminPassword, 'admin']);
    db.run(`INSERT OR IGNORE INTO users (username, password, role) VALUES (?, ?, ?)`,
           ['user', userPassword, 'user']);

    // Create default categories
    const categories = ['Development', 'Design', 'Marketing'];
    categories.forEach(category => {
        db.run(`INSERT OR IGNORE INTO categories (name) VALUES (?)`, [category]);
    });

    // Create default settings
    db.run(`INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)`, ['siteName', 'VisionHub']);
    db.run(`INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)`, ['primaryColor', '#2a9d8f']);
}

// Authentication middleware
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid token' });
        }
        req.user = user;
        next();
    });
}

// Admin middleware
function requireAdmin(req, res, next) {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }
    next();
}

// Logging function
function logAction(userId, action, details = '') {
    db.run(`INSERT INTO logs (userId, action, details) VALUES (?, ?, ?)`,
           [userId, action, details],
           (err) => {
               if (err) console.error('Error logging action:', err.message);
           });
}

// Initialize the application
if (require.main === module) {
    initializeApp();
}
