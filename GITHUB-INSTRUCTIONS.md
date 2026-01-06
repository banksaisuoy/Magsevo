# GitHub Repository Setup Instructions

## Prerequisites
1. You need a GitHub account
2. Git must be installed on your system

## Steps to Create and Push to GitHub

### 1. Create a New Repository on GitHub
1. Go to https://github.com/
2. Log in to your account
3. Click the "+" icon in the top right corner
4. Select "New repository"
5. Name your repository (e.g., "visionhub-video-cms")
6. Choose if it should be Public or Private
7. **Do NOT initialize the repository with a README**
8. Click "Create repository"

### 2. Connect Your Local Repository to GitHub
After creating the repository on GitHub, you'll get a URL like:
`https://github.com/YOUR_USERNAME/YOUR_REPOSITORY_NAME.git`

Replace the placeholders in the commands below with your actual GitHub username and repository name:

```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY_NAME.git
git branch -M main
git push -u origin main
```

### 3. Push Your Code to GitHub
Run these commands in your project directory:

```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY_NAME.git
git branch -M main
git push -u origin main
```

## What's Included in This Repository

This repository contains the complete VisionHub Video Content Management System with the following features:

- Full video management system with categories
- User authentication and role-based access control
- Featured video carousel
- Video embedding support (YouTube, Google Drive, direct video files)
- Admin panel with user, video, and category management
- AI integration with Google Gemini API
- Docker support for easy deployment
- Responsive design with modern CSS

## Deployment Options

### Docker Deployment (Recommended)
The application includes Docker configuration files for easy deployment:
- `Dockerfile` for building the application container
- `docker-compose.yml` for running the application with all dependencies
- Helper scripts for Windows and Linux

### Direct Deployment
You can also run the application directly:
1. Install Node.js (version 14 or higher)
2. Run `npm install` to install dependencies
3. Run `npm run setup` to initialize the database
4. Run `npm start` to start the application

## Configuration
The application uses environment variables for configuration. Create a `.env` file with the following variables:
- `JWT_SECRET` - Secret key for JWT token generation
- `GEMINI_API_KEY` - Google Gemini API key (optional, can be set in admin panel)

Default login credentials:
- Admin: username `admin`, password `123456`
- User: username `user`, password `123456`

## Support
For issues or questions about the application, please check the documentation or create an issue on GitHub.