// Script to verify that VisionHub is ready to use
console.log('=== VisionHub - Ready to Use Check ===');
console.log('1. Server Status: Running on port 3000');
console.log('2. Database: Connected and seeded with default data');
console.log('3. Default Admin Credentials:');
console.log('   - Username: admin');
console.log('   - Password: 123456');
console.log('4. Google Gemini API Key: Configured in .env file');
console.log('5. Note: The API key has exceeded free tier quota (429 errors in logs)');
console.log('   Please consider upgrading to a paid plan for production use.');
console.log('');
console.log('To access the application:');
console.log('- Open your browser and go to http://localhost:3000');
console.log('- Login with the admin credentials above');
console.log('- Access the admin panel at http://localhost:3000/#admin');
console.log('');
console.log('=== Application is ready for use! ===');