const express = require('express');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const { db, initializeDatabase } = require('./setup');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'visionhub_secret_key';

// Initialize Database on Start
initializeDatabase();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

// Ensure Upload Directories Exist
const uploadVideosPath = path.join(__dirname, '../public/uploads/videos');
const uploadThumbnailsPath = path.join(__dirname, '../public/uploads/thumbnails');

if (!fs.existsSync(uploadVideosPath)) {
    fs.mkdirSync(uploadVideosPath, { recursive: true });
}
if (!fs.existsSync(uploadThumbnailsPath)) {
    fs.mkdirSync(uploadThumbnailsPath, { recursive: true });
}

// Multer setup for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (file.fieldname === 'video') {
            cb(null, uploadVideosPath);
        } else if (file.fieldname === 'thumbnail') {
            cb(null, uploadThumbnailsPath);
        }
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage });

// Routes

// 1. Get all videos
app.get('/api/videos', (req, res) => {
    const { category, search } = req.query;
    let query = `SELECT v.*, c.name as categoryName FROM videos v LEFT JOIN categories c ON v.categoryId = c.id`;
    let params = [];
    let conditions = [];

    if (category && category !== 'All') {
        conditions.push('c.name = ?');
        params.push(category);
    }

    if (search) {
        conditions.push('(v.title LIKE ? OR v.description LIKE ?)');
        params.push(`%${search}%`, `%${search}%`);
    }

    if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY v.created_at DESC';

    db.all(query, params, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// 2. Get featured videos
app.get('/api/videos/featured', (req, res) => {
    db.all(`SELECT * FROM videos WHERE isFeatured = 1 ORDER BY created_at DESC LIMIT 5`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// 3. Get categories
app.get('/api/categories', (req, res) => {
    db.all(`SELECT * FROM categories`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// 4. Login
app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    db.get(`SELECT * FROM users WHERE username = ?`, [username], (err, user) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!user) return res.status(401).json({ error: 'Invalid credentials' });

        bcrypt.compare(password, user.password, (err, match) => {
            if (match) {
                const token = jwt.sign({ username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
                res.json({ token, user: { username: user.username, role: user.role, fullName: user.fullName } });
            } else {
                res.status(401).json({ error: 'Invalid credentials' });
            }
        });
    });
});

// Middleware to verify token
const verifyToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(403).json({ error: 'No token provided' });

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) return res.status(401).json({ error: 'Unauthorized' });
        req.user = decoded;
        next();
    });
};

// 5. Upload Video (Admin only)
app.post('/api/videos', verifyToken, upload.fields([{ name: 'video' }, { name: 'thumbnail' }]), (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });

    const { title, description, categoryId, isFeatured } = req.body;
    const videoUrl = req.files['video'] ? `/uploads/videos/${req.files['video'][0].filename}` : req.body.videoUrl;
    const thumbnailUrl = req.files['thumbnail'] ? `/uploads/thumbnails/${req.files['thumbnail'][0].filename}` : req.body.thumbnailUrl;

    if (!title || !videoUrl) return res.status(400).json({ error: 'Title and Video are required' });

    const stmt = db.prepare(`INSERT INTO videos (title, description, thumbnailUrl, videoUrl, isFeatured, categoryId) VALUES (?, ?, ?, ?, ?, ?)`);
    stmt.run(title, description, thumbnailUrl, videoUrl, isFeatured === 'true' ? 1 : 0, categoryId, function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID, message: 'Video uploaded successfully' });
    });
    stmt.finalize();
});

// 6. Delete Video (Admin only)
app.delete('/api/videos/:id', verifyToken, (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });

    const id = req.params.id;
    db.run(`DELETE FROM videos WHERE id = ?`, [id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Video deleted successfully' });
    });
});

// 7. Increment View Count
app.post('/api/videos/:id/view', (req, res) => {
    const id = req.params.id;
    db.run(`UPDATE videos SET views = views + 1 WHERE id = ?`, [id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'View count updated' });
    });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
