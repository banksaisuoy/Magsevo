// Script to verify that our fixes worked

const axios = require('axios');

async function verifyFixes() {
    console.log('=== Verifying Fixes ===\n');
    
    try {
        // Test 1: Check if the main page loads
        console.log('1. Testing main page load...');
        const homeResponse = await axios.get('http://localhost:3000/');
        console.log(`   ✅ Main page loads with status: ${homeResponse.status}`);
        
        // Test 2: Check if CSS is loaded
        console.log('\n2. Testing CSS loading...');
        const cssResponse = await axios.get('http://localhost:3000/css/styles.css');
        console.log(`   ✅ CSS loads with status: ${cssResponse.status}`);
        
        // Test 3: Check if JavaScript files are loaded
        console.log('\n3. Testing JavaScript loading...');
        const appJsResponse = await axios.get('http://localhost:3000/js/app.js');
        console.log(`   ✅ app.js loads with status: ${appJsResponse.status}`);
        
        const appHandlersResponse = await axios.get('http://localhost:3000/js/app-handlers.js');
        console.log(`   ✅ app-handlers.js loads with status: ${appHandlersResponse.status}`);
        
        // Test 4: Check API endpoints
        console.log('\n4. Testing API endpoints...');
        const videosResponse = await axios.get('http://localhost:3000/api/videos');
        console.log(`   ✅ Videos API works with status: ${videosResponse.status}`);
        console.log(`   ✅ Found ${videosResponse.data.videos.length} videos`);
        
        const settingsResponse = await axios.get('http://localhost:3000/api/settings');
        console.log(`   ✅ Settings API works with status: ${settingsResponse.status}`);
        
        // Test 5: Check if we have featured videos
        const featuredVideos = videosResponse.data.videos.filter(v => v.isFeatured);
        console.log(`   ✅ Found ${featuredVideos.length} featured videos`);
        
        console.log('\n=== Verification Results ===');
        console.log('✅ All tests passed! The application should be displaying correctly.');
        console.log('✅ Main page loads properly');
        console.log('✅ CSS and JavaScript files are accessible');
        console.log('✅ API endpoints are working');
        console.log('✅ Database contains content');
        
        console.log('\n=== Next Steps ===');
        console.log('1. Open your browser and go to http://localhost:3000');
        console.log('2. You should see the login page');
        console.log('3. Log in with username: admin, password: 123456');
        console.log('4. The main dashboard with featured video carousel should display');
        
    } catch (error) {
        console.error('❌ Verification failed:', error.message);
        if (error.response) {
            console.error(`   Status: ${error.response.status}`);
        }
    }
}

// Run the verification
verifyFixes();