const fs = require('fs');
const path = require('path');

console.log('Fixing API Key Issues...');
console.log('========================');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  console.log('✅ Found .env file');
  
  // Read the .env file
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  // Check if GEMINI_API_KEY is present
  if (envContent.includes('GEMINI_API_KEY=')) {
    console.log('✅ GEMINI_API_KEY found in .env file');
    
    // Check if it's a valid key or placeholder
    const apiKeyLine = envContent.split('\n').find(line => line.includes('GEMINI_API_KEY='));
    if (apiKeyLine && !apiKeyLine.includes('your-gemini-api-key') && apiKeyLine.split('=')[1].length > 10) {
      console.log('✅ Valid API key detected');
      console.log('No changes needed to .env file');
    } else {
      console.log('⚠️  Placeholder or invalid API key detected');
      console.log('The application will run without AI features');
    }
  } else {
    console.log('ℹ️  No GEMINI_API_KEY found in .env file');
    console.log('AI features will be disabled');
  }
} else {
  console.log('ℹ️  No .env file found');
  console.log('Creating a new .env file with placeholder values...');
  
  const envExamplePath = path.join(__dirname, '.env.example');
  if (fs.existsSync(envExamplePath)) {
    fs.copyFileSync(envExamplePath, envPath);
    console.log('✅ Created .env file from .env.example');
  } else {
    // Create a basic .env file
    const basicEnv = `# VisionHub Environment Configuration
PORT=3000
NODE_ENV=production
JWT_SECRET=your-production-secret-key-change-this
GEMINI_API_KEY=your-gemini-api-key
DB_PATH=./server/visionhub.db
UPLOAD_MAX_SIZE=104857600
UPLOAD_PATH=./public/uploads
`;
    fs.writeFileSync(envPath, basicEnv);
    console.log('✅ Created basic .env file');
  }
}

// Update docker-compose.ngrok.yml to remove the invalid API key
const dockerComposePath = path.join(__dirname, 'docker-compose.ngrok.yml');
if (fs.existsSync(dockerComposePath)) {
  let dockerComposeContent = fs.readFileSync(dockerComposePath, 'utf8');
  
  if (dockerComposeContent.includes('GEMINI_API_KEY=your-gemini-api-key')) {
    console.log('\n🔧 Fixing docker-compose.ngrok.yml...');
    
    // Remove or comment out the invalid API key
    dockerComposeContent = dockerComposeContent.replace(
      /^\s*- GEMINI_API_KEY=your-gemini-api-key$/gm,
      '  # - GEMINI_API_KEY=your-gemini-api-key  # Removed invalid API key'
    );
    
    fs.writeFileSync(dockerComposePath, dockerComposeContent);
    console.log('✅ Removed invalid API key from docker-compose.ngrok.yml');
  } else {
    console.log('\n✅ docker-compose.ngrok.yml does not contain invalid API key');
  }
}

console.log('\n=== Summary ===');
console.log('1. The application will run without AI features due to invalid API key');
console.log('2. To enable AI features, update the GEMINI_API_KEY in .env file');
console.log('3. You can get a new API key from: https://makersuite.google.com/app/apikey');
console.log('4. After updating the key, restart the services');

console.log('\n=== Next Steps ===');
console.log('Run: docker-compose -f docker-compose.ngrok.yml down');
console.log('Run: docker-compose -f docker-compose.ngrok.yml up --build');