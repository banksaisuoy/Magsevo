const express = require('express');
const router = express.Router();
const Settings = require('../models/Settings');
const { Log } = require('../models/index'); // Try to get Log from index, if fails, we might crash.
// If Log is missing, we should probably handle it.
// Or we can import Log from '../models/Log' if we assume it exists.

// Middleware
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    const jwt = require('jsonwebtoken');
    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';

    if (!token) return res.status(401).json({ error: 'Access token required' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid token' });
        req.user = user;
        next();
    });
}

function requireAdmin(req, res, next) {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }
    next();
}

// Get all settings
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const db = req.app.get('db');
        const settings = await Settings.getAll(db);
        res.json(settings);
    } catch (error) {
        console.error('Error fetching settings:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update settings
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const db = req.app.get('db');
        const settings = req.body; // Expects { key: value, ... }

        for (const [key, value] of Object.entries(settings)) {
            await Settings.set(db, key, value);
        }

        try {
            if (Log && Log.create) {
                await Log.create(db, req.user.username, 'Update Settings', 'Updated system settings');
            }
        } catch (e) {
            console.warn('Failed to create log:', e);
        }

        // Re-initialize AI Service if related settings changed
        if (settings.gemini_api_key || settings.gemini_model) {
            const aiService = require('../services/aiService');
            if (aiService.setDatabase) aiService.setDatabase(db);
            await aiService.initialize();
        }

        res.json({ success: true, message: 'Settings updated successfully' });
    } catch (error) {
        console.error('Error updating settings:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
