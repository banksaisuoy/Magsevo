        app.use('/api', rateLimiters.general);

        // Mount API routes
        app.use('/api/auth', require('../routes/auth'));
        const { verifyToken } = require('../middleware/auth');
        app.get('/api/profile', verifyToken, (req, res) => {
            res.json({ message: 'Profile data', userId: req.user.id });
        });
        
        app.use('/api', apiRoutes);

        // Serve frontend
        app.get('*', (req, res) => {
            res.sendFile(path.join(__dirname, '../public/index.html'));
        });
        
        // Error handling middleware
        app.use((req, res, next) => {
            res.status(404).json({ error: 'Not Found' });
        });
        
        app.use((err, req, res, next) => {
            console.error(err.stack);
            res.status(500).json({ error: 'Internal Server Error' });
        });

        // Export app and db for use in other files
        module.exports = { app, db, authenticateToken, requireAdmin, logAction, JWT_SECRET };
