        app.set('db', db);

        // Import API routes after database is connected
        const videoRoutesV2 = require('../src/routes/videoRoutes');
        const apiRoutes = require('./routes');
        const healthMonitor = require('./services/healthMonitor');
        const aiService = require('./services/aiService');
        app.use('/api', rateLimiters.general);

        // Mount API routes
        // Mount new V2 video routes before legacy API routes to prevent conflict
        app.use('/api/videos', videoRoutesV2);
        app.use('/api', apiRoutes);

        // Serve frontend