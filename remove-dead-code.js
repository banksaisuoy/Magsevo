// Script to remove dead code and unnecessary logging from JavaScript files

const fs = require('fs');
const path = require('path');

// Function to remove console.log statements and other debug code
function removeDebugCode(code) {
    // Remove console.log statements (but keep console.error and console.warn)
    code = code.replace(/console\.log\(.*?\);/g, '');
    
    // Remove debug comments
    code = code.replace(/\/\/\s*DEBUG:.*$/gm, '');
    
    // Remove multiple empty lines
    code = code.replace(/\n\s*\n\s*\n/g, '\n\n');
    
    return code;
}

// Function to optimize the main app.js file
function optimizeAppJS() {
    const filePath = 'public/js/app.js';
    if (!fs.existsSync(filePath)) {
        console.log('File not found:', filePath);
        return;
    }
    
    let code = fs.readFileSync(filePath, 'utf8');
    
    // Remove excessive console.log statements while keeping important ones
    // Keep error logging and important debug info
    code = code.replace(/console\.log\(['"`][^'"]*['"`]\);/g, '');
    code = code.replace(/console\.log\(.*?response.*?\);/g, '');
    code = code.replace(/console\.log\(.*?error.*?\);/g, '');
    
    // Remove commented out code blocks
    code = code.replace(/\/\*[\s\S]*?\*\//g, '');
    code = code.replace(/\/\/.*$/gm, '');
    
    // Clean up multiple empty lines
    code = code.replace(/\n\s*\n\s*\n/g, '\n\n');
    
    fs.writeFileSync(filePath, code);
    console.log('Optimized:', filePath);
}

// Function to optimize handler files
function optimizeHandlers() {
    const filePath = 'public/js/app-handlers.js';
    if (!fs.existsSync(filePath)) {
        console.log('File not found:', filePath);
        return;
    }
    
    let code = fs.readFileSync(filePath, 'utf8');
    
    // Remove excessive console.log statements
    code = code.replace(/console\.log\(.*?\);/g, '');
    
    // Clean up multiple empty lines
    code = code.replace(/\n\s*\n\s*\n/g, '\n\n');
    
    fs.writeFileSync(filePath, code);
    console.log('Optimized:', filePath);
}

// Function to optimize admin files
function optimizeAdminFiles() {
    const adminDir = 'public/js/admin';
    if (!fs.existsSync(adminDir)) {
        console.log('Directory not found:', adminDir);
        return;
    }
    
    const files = fs.readdirSync(adminDir);
    for (const file of files) {
        if (file.endsWith('.js')) {
            const filePath = path.join(adminDir, file);
            let code = fs.readFileSync(filePath, 'utf8');
            
            // Remove excessive console.log statements
            code = code.replace(/console\.log\(.*?\);/g, '');
            
            // Clean up multiple empty lines
            code = code.replace(/\n\s*\n\s*\n/g, '\n\n');
            
            fs.writeFileSync(filePath, code);
            console.log('Optimized:', filePath);
        }
    }
}

// Run optimization
console.log('Starting dead code removal...');
optimizeAppJS();
optimizeHandlers();
optimizeAdminFiles();
console.log('Dead code removal completed!');