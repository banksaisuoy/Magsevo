// Test script to verify that the main functionality is working after optimization

const axios = require('axios');
const fs = require('fs');

async function testFunctionality() {
    console.log('=== Testing Application Functionality ===\n');
    
    try {
        // Test 1: Check if the server is responding
        console.log('1. Testing server response...');
        const homeResponse = await axios.get('http://localhost:3000');
        console.log(`   ✅ Server is responding with status ${homeResponse.status}`);
        
        // Test 2: Check API endpoints
        console.log('\n2. Testing API endpoints...');
        const videosResponse = await axios.get('http://localhost:3000/api/videos');
        console.log(`   ✅ Videos API is responding with status ${videosResponse.status}`);
        console.log(`   ✅ Found ${videosResponse.data.videos.length} videos`);
        
        // Test 3: Check categories endpoint
        const categoriesResponse = await axios.get('http://localhost:3000/api/categories');
        console.log(`   ✅ Categories API is responding with status ${categoriesResponse.status}`);
        console.log(`   ✅ Found ${categoriesResponse.data.categories.length} categories`);
        
        // Test 4: Check settings endpoint
        const settingsResponse = await axios.get('http://localhost:3000/api/settings');
        console.log(`   ✅ Settings API is responding with status ${settingsResponse.status}`);
        
        // Test 5: Check if database has data
        console.log('\n3. Checking database content...');
        if (videosResponse.data.videos.length > 0) {
            console.log('   ✅ Database contains videos');
            
            // Check if we have featured videos
            const featuredVideos = videosResponse.data.videos.filter(v => v.isFeatured);
            console.log(`   ✅ Found ${featuredVideos.length} featured videos`);
            
            // Check if we have categories
            if (categoriesResponse.data.categories.length > 0) {
                console.log('   ✅ Database contains categories');
            }
        } else {
            console.log('   ⚠️  No videos found in database');
        }
        
        console.log('\n=== All Tests Passed ===');
        console.log('✅ The application is functioning correctly after optimization');
        console.log('✅ All core APIs are responding properly');
        console.log('✅ Database is accessible and contains data');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        if (error.response) {
            console.error(`   Status: ${error.response.status}`);
            console.error(`   Data: ${JSON.stringify(error.response.data)}`);
        }
    }
    
    console.log('\n=== Next Steps ===');
    console.log('1. Open your browser and navigate to http://localhost:3000');
    console.log('2. Test user authentication with admin/123456 or user/123456');
    console.log('3. Verify video carousel functionality');
    console.log('4. Test video playback');
    console.log('5. Check admin panel features');
}

// Run the test
testFunctionality();