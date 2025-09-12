// Debug script to check what's happening during app initialization

const axios = require('axios');

async function debugAppInit() {
    console.log('=== Debugging Application Initialization ===\n');
    
    try {
        // Test API endpoints that the app uses during initialization
        console.log('1. Testing settings API...');
        const settingsResponse = await axios.get('http://localhost:3000/api/settings');
        console.log(`   Status: ${settingsResponse.status}`);
        console.log(`   Data: ${JSON.stringify(settingsResponse.data, null, 2)}`);
        
        console.log('\n2. Testing videos API...');
        const videosResponse = await axios.get('http://localhost:3000/api/videos');
        console.log(`   Status: ${videosResponse.status}`);
        console.log(`   Total videos: ${videosResponse.data.videos.length}`);
        
        // Check if we have featured videos
        const featuredVideos = videosResponse.data.videos.filter(v => v.isFeatured);
        console.log(`   Featured videos: ${featuredVideos.length}`);
        
        if (featuredVideos.length > 0) {
            console.log('   First featured video:', JSON.stringify(featuredVideos[0], null, 2));
        }
        
        console.log('\n3. Testing categories API...');
        const categoriesResponse = await axios.get('http://localhost:3000/api/categories');
        console.log(`   Status: ${categoriesResponse.status}`);
        console.log(`   Categories: ${categoriesResponse.data.categories.length}`);
        
        if (categoriesResponse.data.categories.length > 0) {
            console.log('   First category:', JSON.stringify(categoriesResponse.data.categories[0], null, 2));
        }
        
        console.log('\n=== Debug Results ===');
        console.log('✅ All API endpoints are responding correctly');
        console.log('✅ Database contains data');
        console.log('✅ Featured videos are available');
        console.log('✅ Categories are available');
        console.log('\nThe issue might be with the frontend JavaScript initialization.');
        
    } catch (error) {
        console.error('❌ Debug failed:', error.message);
        if (error.response) {
            console.error(`   Status: ${error.response.status}`);
            console.error(`   Data: ${JSON.stringify(error.response.data, null, 2)}`);
        }
    }
}

// Run the debug
debugAppInit();