// Speed Insights Initialization
// This file will be bundled for browser use
const { injectSpeedInsights } = require('@vercel/speed-insights');

// Initialize Speed Insights when the DOM is ready
if (typeof window !== 'undefined') {
  // Initialize Speed Insights
  // In production on Vercel, this will automatically track performance metrics
  injectSpeedInsights({
    debug: false // Set to true for development debugging
  });
}
