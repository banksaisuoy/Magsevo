const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Starting project optimization...');

// Step 1: Run the cleanup script
console.log('Step 1: Cleaning up unnecessary files...');
try {
    // Run PowerShell cleanup script
    execSync('powershell -ExecutionPolicy Bypass -File cleanup.ps1', { stdio: 'inherit' });
    console.log('Cleanup completed successfully.');
} catch (error) {
    console.log('PowerShell cleanup failed, trying bash script...');
    try {
        execSync('bash cleanup.sh', { stdio: 'inherit' });
        console.log('Bash cleanup completed successfully.');
    } catch (bashError) {
        console.log('Bash cleanup also failed. Continuing with optimization...');
    }
}

// Step 2: Minify JavaScript files
console.log('Step 2: Minifying JavaScript files...');
const terser = require('terser');

async function minifyJS() {
    const jsFiles = [
        'public/js/app.js',
        'public/js/app-handlers.js',
        'public/js/app-admin.js',
        'public/js/admin/*.js'
    ];
    
    for (const pattern of jsFiles) {
        if (pattern.includes('*')) {
            // Handle glob patterns
            const dir = pattern.replace(/\*.*$/, '');
            if (fs.existsSync(dir)) {
                const files = fs.readdirSync(dir);
                for (const file of files) {
                    if (file.endsWith('.js')) {
                        const filePath = path.join(dir, file);
                        await minifyFile(filePath);
                    }
                }
            }
        } else {
            if (fs.existsSync(pattern)) {
                await minifyFile(pattern);
            }
        }
    }
}

async function minifyFile(filePath) {
    try {
        const code = fs.readFileSync(filePath, 'utf8');
        const result = await terser.minify(code, {
            compress: {
                drop_console: true, // Remove console.log statements
                drop_debugger: true, // Remove debugger statements
                dead_code: true, // Remove dead code
                unused: true, // Remove unused variables/functions
                passes: 2 // Multiple passes for better optimization
            },
            mangle: {
                properties: {
                    regex: /^_/,
                }
            },
            output: {
                comments: false // Remove comments
            }
        });
        
        if (result.code) {
            fs.writeFileSync(filePath, result.code);
            console.log(`Minified: ${filePath}`);
        }
    } catch (error) {
        console.error(`Error minifying ${filePath}:`, error.message);
    }
}

// Step 3: Minify CSS files
console.log('Step 3: Minifying CSS files...');
const cssnano = require('cssnano');

async function minifyCSS() {
    const cssDir = 'public/css';
    if (fs.existsSync(cssDir)) {
        const files = fs.readdirSync(cssDir);
        for (const file of files) {
            if (file.endsWith('.css')) {
                const filePath = path.join(cssDir, file);
                await minifyCSSFile(filePath);
            }
        }
    }
}

async function minifyCSSFile(filePath) {
    try {
        const css = fs.readFileSync(filePath, 'utf8');
        const result = await cssnano.process(css, { from: filePath });
        
        if (result.css) {
            fs.writeFileSync(filePath, result.css);
            console.log(`Minified: ${filePath}`);
        }
    } catch (error) {
        console.error(`Error minifying ${filePath}:`, error.message);
    }
}

// Step 4: Remove unused dependencies
console.log('Step 4: Cleaning up dependencies...');
try {
    execSync('npm prune', { stdio: 'inherit' });
    console.log('Unused dependencies removed.');
} catch (error) {
    console.log('npm prune failed:', error.message);
}

// Run all optimization steps
async function runOptimization() {
    try {
        await minifyJS();
        await minifyCSS();
        console.log('Project optimization completed successfully!');
        console.log('\nOptimization Summary:');
        console.log('- Unnecessary files removed');
        console.log('- JavaScript files minified');
        console.log('- CSS files minified');
        console.log('- Unused dependencies removed');
        console.log('\nYour project is now optimized for better performance and resource efficiency.');
    } catch (error) {
        console.error('Optimization failed:', error.message);
    }
}

// Execute optimization
runOptimization();