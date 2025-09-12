const fs = require('fs');
const path = require('path');

function countFiles(dir) {
    let count = 0;
    let totalSize = 0;
    
    function walkDir(currentPath) {
        const items = fs.readdirSync(currentPath);
        
        for (const item of items) {
            const fullPath = path.join(currentPath, item);
            const stats = fs.statSync(fullPath);
            
            if (stats.isDirectory()) {
                walkDir(fullPath);
            } else {
                count++;
                totalSize += stats.size;
            }
        }
    }
    
    walkDir(dir);
    return { count, size: totalSize };
}

console.log('=== Project File Count ===');
const result = countFiles('.');
console.log(`Total files: ${result.count}`);
console.log(`Total size: ${(result.size / 1024 / 1024).toFixed(2)} MB (${result.size} bytes)`);
console.log('==========================');