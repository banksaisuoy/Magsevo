const express = require('express');
const jwt = require('jsonwebtoken');
const { Database, User, Log } = require('../models/index');
const router = express.Router();

const isProduction = process.env.NODE_ENV === 'production';
const getJwtSecret = () => {
    const secret = process.env.JWT_SECRET || (!isProduction ? 'dev-only-change-me' : '');
    if (isProduction && secret.length < 32) {
        throw new Error('JWT_SECRET must be set to a random value of at least 32 characters in production');
    }
    return secret;
};
// Database is accessed via req.app.get('db')

// Login route
router.post('/login', async (req, res) => {
    try {
        const db = req.app.get('db');
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }

        const user = await User.findByUsername(db, username);
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isValid = await User.validatePassword(password, user.password);
        if (!isValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { username: user.username, role: user.role },
            getJwtSecret(),
            { expiresIn: '24h' }
        );

        // Log the login action
        await Log.create(db, username, 'Login', `User ${username} logged in`);

        res.json({
            success: true,
            token,
            user: {
                username: user.username,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Logout route (mainly for logging purposes)
router.post('/logout', async (req, res) => {
    try {
        const db = req.app.get('db');
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (token) {
            try {
                const decoded = jwt.verify(token, getJwtSecret());
                await Log.create(db, decoded.username, 'Logout', `User ${decoded.username} logged out`);
            } catch (err) {
                // Token invalid, but that's ok for logout
            }
        }

        res.json({ success: true, message: 'Logged out successfully' });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Verify token route
router.get('/verify', async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const decoded = jwt.verify(token, getJwtSecret());
        res.json({
            success: true,
            user: {
                username: decoded.username,
                role: decoded.role
            }
        });
    } catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
});

module.exports = router;