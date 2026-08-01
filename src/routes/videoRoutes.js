const express = require('express');
const jwt = require('jsonwebtoken');
const { validateVideoCreate, validateVideoUpdate } = require('../middleware/validation');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';
});

// POST /api/videos (authenticated)
router.post('/', authenticateToken, validateVideoCreate, async (req, res) => {
    try {
        const db = req.app.get('db');
        const { title, description, video_url, category_id, category } = req.body;

        if (!title || !video_url) {
            return res.status(400).json({ error: 'Title and video_url are required' });
        }

        const safeDescription = description !== undefined ? description : null;
        
        let safeCategoryId = category_id !== undefined ? category_id : null;
        if (category && !safeCategoryId) {
            const catRecord = await db.get('SELECT id FROM categories WHERE name = ? OR id = ?', [category, category]);
            if (catRecord) safeCategoryId = catRecord.id;
        }
        // The memory says: "The `users` SQLite table schema supports `id` (INTEGER PRIMARY KEY AUTOINCREMENT)"
        // "retaining username TEXT UNIQUE and the legacy password field for backward compatibility"
        // Let's assume req.user might have 'id' or 'userId' or 'username' depending on token structure.


// PUT /api/videos/:id (authenticated)
router.put('/:id', authenticateToken, validateVideoUpdate, async (req, res) => {
    try {
        const db = req.app.get('db');
        const { id } = req.params;
        const { title, description, video_url, category_id, category } = req.body;

        const existingVideo = await db.get(`SELECT * FROM videos WHERE id = ?`, [id]);
        if (!existingVideo) {
        }

        const safeDescription = description !== undefined ? description : null;
        let safeCategoryId = category_id !== undefined ? category_id : null;
        if (category && !safeCategoryId) {
            const catRecord = await db.get('SELECT id FROM categories WHERE name = ? OR id = ?', [category, category]);
            if (catRecord) safeCategoryId = catRecord.id;
        }

        await db.run(
            `UPDATE videos 