# VisionHub - Video Content Management System

A complete, modern web application for video content management with an advanced admin panel. Built with Node.js, Express, SQLite, and vanilla JavaScript.

## Features

### Core Functionality
- **User Authentication**: Secure login system with JWT tokens
- **Video Management**: Complete CRUD operations for video content
- **Category System**: Organize videos into categories
- **User Roles**: Admin and regular user roles with different permissions
- **Featured Videos**: Rotating carousel for highlighted content
- **Search & Discovery**: Real-time search and trending videos
- **Favorites System**: Users can bookmark their favorite videos
- **Comments**: Interactive commenting system for videos
- **Reporting**: Users can report inappropriate content

### Admin Panel Features
- **User Management**: Create, edit, and manage user accounts
- **Video Administration**: Full video lifecycle management
- **Category Management**: Create and organize content categories
- **Reports & Logs**: Review user reports and system activity
- **Site Settings**: Customize site appearance and configuration
- **AI Settings**: Configure Google Gemini API integration
- **Analytics**: View video statistics and user engagement

### Technical Features
- **RESTful API**: Well-structured API endpoints
- **Persistent Database**: SQLite3 for reliable data storage
- **Responsive Design**: Mobile-friendly interface
- **Modern CSS**: Custom styling without external frameworks
- **Video Embedding**: Support for YouTube, Google Drive, and direct video files
- **Real-time Updates**: Dynamic content loading without page refreshes
- **Docker Support**: Easy deployment with Docker containers
- **AI Integration**: Google Gemini API integration for enhanced features

## Quick Start

### Using Docker (Recommended)
```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/YOUR_REPOSITORY_NAME.git
cd YOUR_REPOSITORY_NAME

# Start the application
docker-compose up -d

# Access the application at http://localhost:3000
```

### Direct Installation
1. Install Node.js (version 14 or higher)
2. Clone this repository
3. Install dependencies: `npm install`
4. Initialize database: `npm run setup`
5. Start the application: `npm start`
6. Access at http://localhost:3000

### Default Login Credentials
- **Admin Account**
  - Username: `admin`
  - Password: `123456`

- **Regular User Account**
  - Username: `user`
  - Password: `123456`

## Configuration
Create a `.env` file with the following variables:
```
JWT_SECRET=your-super-secret-jwt-key
GEMINI_API_KEY=your-google-gemini-api-key  # Optional, can be set in admin panel
```

## API Documentation
Access the API documentation at `http://localhost:3000/api/docs` when the server is running.

## Contributing
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
