#!/bin/bash

# VisionHub Docker Startup Script

# Create necessary directories
mkdir -p server
mkdir -p public/uploads/videos
mkdir -p public/uploads/thumbnails

# Check if database exists, if not initialize it
if [ ! -f server/visionhub.db ] || [ ! -s server/visionhub.db ]; then
    echo "Initializing database..."
    npm run setup
else
    echo "Database already exists"
fi

# Start the application
echo "Starting VisionHub application..."
npm start