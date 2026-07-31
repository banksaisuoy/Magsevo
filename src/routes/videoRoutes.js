const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';

// JWT Authentication Middleware
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] }, (err, user) => {
        if (err) {
            return res.status(401).json({ error: 'Invalid token' }); // Memory mentions 401 for edge cases
        }
        req.user = user;
        next();
    });
}

// GET /api/videos with pagination
router.get('/', async (req, res) => {
    try {
        const db = req.app.get('db');
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const videos = await db.all(
            `SELECT * FROM videos ORDER BY created_at DESC LIMIT ? OFFSET ?`,
            [limit, offset]
        );

        const countResult = await db.get(`SELECT COUNT(*) as total FROM videos`);
        const total = countResult ? countResult.total : 0;

        res.json({
            success: true,
            videos,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get videos error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /api/videos/:id
router.get('/:id', async (req, res) => {
    try {
        const db = req.app.get('db');
        const { id } = req.params;

        const video = await db.get(
            `SELECT * FROM videos WHERE id = ?`,
            [id]
        );

        if (!video) {
            return res.status(404).json({ error: 'Video not found' });
        }

        res.json({ success: true, video });
    } catch (error) {
        console.error('Get video error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /api/videos (authenticated)
router.post('/', authenticateToken, async (req, res) => {
    try {
        const db = req.app.get('db');
        const { title, description, video_url, category_id } = req.body;

        if (!title || !video_url) {
            return res.status(400).json({ error: 'Title and video_url are required' });
        }

        const safeDescription = description !== undefined ? description : null;
        const safeCategoryId = category_id !== undefined ? category_id : null;
        // The memory says: "The `users` SQLite table schema supports `id` (INTEGER PRIMARY KEY AUTOINCREMENT)"
        // "retaining username TEXT UNIQUE and the legacy password field for backward compatibility"
        // Let's assume req.user might have 'id' or 'userId' or 'username' depending on token structure.
        const userId = req.user.id !== undefined ? req.user.id : null;

        const result = await db.run(
            `INSERT INTO videos (title, description, video_url, category_id, user_id)
             VALUES (?, ?, ?, ?, ?)`,
            [title, safeDescription, video_url, safeCategoryId, userId]
        );

        res.status(201).json({
            success: true,
            message: 'Video created successfully',
            videoId: result.lastID || result.id
        });
    } catch (error) {
        console.error('Create video error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});



// PUT /api/videos/:id (authenticated)
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const db = req.app.get('db');
        const { id } = req.params;
        const { title, description, video_url, category_id } = req.body;

        const existingVideo = await db.get(`SELECT * FROM videos WHERE id = ?`, [id]);
        if (!existingVideo) {
            return res.status(404).json({ error: 'Video not found' });
        }

        if (!title || !video_url) {
            return res.status(400).json({ error: 'Title and video_url are required' });
        }

        const safeDescription = description !== undefined ? description : null;
        const safeCategoryId = category_id !== undefined ? category_id : null;

        await db.run(
            `UPDATE videos 
             SET title = ?, description = ?, video_url = ?, category_id = ?
             WHERE id = ?`,
            [title, safeDescription, video_url, safeCategoryId, id]
        );

        res.json({ success: true, message: 'Video updated successfully' });
    } catch (error) {
        console.error('Update video error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// DELETE /api/videos/:id (authenticated)
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const db = req.app.get('db');
        const { id } = req.params;

        const existingVideo = await db.get(`SELECT * FROM videos WHERE id = ?`, [id]);
        if (!existingVideo) {
            return res.status(404).json({ error: 'Video not found' });
        }

        await db.run(`DELETE FROM videos WHERE id = ?`, [id]);

        res.json({ success: true, message: 'Video deleted successfully' });
    } catch (error) {
        console.error('Delete video error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
