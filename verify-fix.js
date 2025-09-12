// Script to verify that our fix worked

const axios = require('axios');

async function verifyFix() {
    console.log('=== Verifying Fix ===\n');
    
    try {
        // Test if the main page is accessible
        console.log('1. Testing main page access...');
        const homeResponse = await axios.get('http://localhost:3000/');
        console.log(`   ✅ Main page accessible with status ${homeResponse.status}`);
        
        // Check if the response contains expected content
        const content = homeResponse.data;
        if (content.includes('id="root"') && content.includes('app-container')) {
            console.log('   ✅ HTML contains expected root element');
        } else {
            console.log('   ❌ HTML missing expected root element');
        }
        
        // Test a simple API endpoint
        console.log('\n2. Testing API endpoint...');
        const videosResponse = await axios.get('http://localhost:3000/api/videos');
        console.log(`   ✅ API endpoint working with status ${videosResponse.status}`);
        console.log(`   ✅ Found ${videosResponse.data.videos.length} videos`);
        
        console.log('\n=== Verification Complete ===');
        console.log('✅ The application should now be working correctly');
        console.log('✅ Please refresh your browser to see the changes');
        
    } catch (error) {
        console.error('❌ Verification failed:', error.message);
        if (error.response) {
            console.error(`   Status: ${error.response.status}`);
        }
    }
}

// Run the verification
verifyFix();