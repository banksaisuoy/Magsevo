        app.use('/api', rateLimiters.general);

        process.env.JWT_SECRET = process.env.JWT_SECRET || 'your_strong_secret_here_change_in_production';
        
        // Mount API routes
        app.use('/api/auth', require('../routes/auth'));
        const { verifyToken } = require('../middleware/auth');
            res.json({ message: 'Profile data', userId: req.user.id });
        });
        
        app.use('/api/videos', verifyToken);
        app.use('/api/categories', verifyToken);
        app.use('/api', apiRoutes);

        // Serve frontend