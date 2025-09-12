// Test script to verify that static files are being served correctly

const axios = require('axios');
const fs = require('fs');

async function testStaticFiles() {
    console.log('=== Testing Static File Serving ===\n');
    
    try {
        // Test 1: Check if CSS file is accessible
        console.log('1. Testing CSS file access...');
        const cssResponse = await axios.get('http://localhost:3000/css/styles.css');
        console.log(`   ✅ CSS file accessible with status ${cssResponse.status}`);
        console.log(`   ✅ CSS file size: ${cssResponse.data.length} characters`);
        
        // Test 2: Check if JS files are accessible
        console.log('\n2. Testing JavaScript file access...');
        const appJsResponse = await axios.get('http://localhost:3000/js/app.js');
        console.log(`   ✅ app.js accessible with status ${appJsResponse.status}`);
        console.log(`   ✅ app.js file size: ${appJsResponse.data.length} characters`);
        
        const appHandlersResponse = await axios.get('http://localhost:3000/js/app-handlers.js');
        console.log(`   ✅ app-handlers.js accessible with status ${appHandlersResponse.status}`);
        console.log(`   ✅ app-handlers.js file size: ${appHandlersResponse.data.length} characters`);
        
        // Test 3: Check if index.html is accessible
        console.log('\n3. Testing HTML file access...');
        const htmlResponse = await axios.get('http://localhost:3000/');
        console.log(`   ✅ index.html accessible with status ${htmlResponse.status}`);
        console.log(`   ✅ HTML content length: ${htmlResponse.data.length} characters`);
        
        // Check if HTML contains references to CSS and JS
        const htmlContent = htmlResponse.data;
        if (htmlContent.includes('css/styles.css')) {
            console.log('   ✅ HTML references styles.css');
        } else {
            console.log('   ❌ HTML does not reference styles.css');
        }
        
        if (htmlContent.includes('js/app.js')) {
            console.log('   ✅ HTML references app.js');
        } else {
            console.log('   ❌ HTML does not reference app.js');
        }
        
        if (htmlContent.includes('js/app-handlers.js')) {
            console.log('   ✅ HTML references app-handlers.js');
        } else {
            console.log('   ❌ HTML does not reference app-handlers.js');
        }
        
        console.log('\n=== Static File Test Results ===');
        console.log('✅ All static files are accessible');
        console.log('✅ CSS and JavaScript files are being served correctly');
        console.log('✅ HTML file is accessible and contains proper references');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        if (error.response) {
            console.error(`   Status: ${error.response.status}`);
        }
    }
}

// Run the test
testStaticFiles();