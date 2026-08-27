const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const isProduction = process.env.NODE_ENV === 'production';
const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET || (isProduction ? '' : 'dev-only-change-me');
  if (isProduction && secret.length < 32) throw new Error('JWT_SECRET must be set in production');
  return secret;
};
const attempts = new Map();
const isRateLimited = (req) => {
  const key = req.ip || 'unknown';
  const now = Date.now();
  const recent = (attempts.get(key) || []).filter((time) => now - time < 60_000);
  recent.push(now);
  attempts.set(key, recent);
  return recent.length > 20;
};

router.post('/register', async (req, res) => {
  if (isRateLimited(req)) return res.status(429).json({ error: 'Too many requests' });
  try {
    const { email, password } = req.body;

    if (!email || !password || password.length < 6) {
      return res.status(400).json({ error: 'Email and password (min 6 chars) are required' });
    }

    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const newUser = await User.create({ email, password });

    const token = jwt.sign({ userId: newUser.id }, getJwtSecret(), { expiresIn: '7d' });

    res.status(201).json({ token });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/login', async (req, res) => {
  if (isRateLimited(req)) return res.status(429).json({ error: 'Too many requests' });
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValidPassword = await User.validatePassword(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id }, getJwtSecret(), { expiresIn: '7d' });

    res.json({ token });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;