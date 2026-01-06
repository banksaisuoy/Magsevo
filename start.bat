@echo off
REM VisionHub Windows Startup Script

REM Create necessary directories
mkdir server 2>nul
mkdir public\uploads\videos 2>nul
mkdir public\uploads\thumbnails 2>nul

REM Check if database exists, if not initialize it
if not exist server\visionhub.db (
    echo Initializing database...
    npm run setup
) else (
    echo Database already exists
)

REM Start the application
echo Starting VisionHub application...
npm start