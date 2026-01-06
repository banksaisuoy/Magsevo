# Project Cleanup Script
# This script removes unnecessary files to optimize the project

Write-Host "Starting project cleanup..." -ForegroundColor Green

# Remove unnecessary Markdown files (keep only README.md)
$markdownFiles = Get-ChildItem -Path . -Include *.md -Recurse | Where-Object { $_.Name -ne "README.md" }
Write-Host "Removing $($markdownFiles.Count) Markdown files..." -ForegroundColor Yellow
foreach ($file in $markdownFiles) {
    Remove-Item $file.FullName -Force
    Write-Host "Removed: $($file.Name)"
}

# Remove test JavaScript files
$testJsFiles = Get-ChildItem -Path . -Include *.js -Recurse | Where-Object {
    $_.Name -like "*test*" -or
    $_.Name -like "*check*" -or
    $_.Name -like "*admin-panel*" -or
    $_.Name -like "*comprehensive*" -or
    $_.Name -like "*verify*" -or
    $_.Name -like "*diagnose*"
}
Write-Host "Removing $($testJsFiles.Count) test JavaScript files..." -ForegroundColor Yellow
foreach ($file in $testJsFiles) {
    Remove-Item $file.FullName -Force
    Write-Host "Removed: $($file.Name)"
}

# Remove HTML test files
$htmlTestFiles = Get-ChildItem -Path . -Include *.html -Recurse | Where-Object {
    $_.Name -like "*test*" -or
    $_.Name -like "*carousel*" -or
    $_.Name -eq "Steam.html"
}
Write-Host "Removing $($htmlTestFiles.Count) HTML test files..." -ForegroundColor Yellow
foreach ($file in $htmlTestFiles) {
    Remove-Item $file.FullName -Force
    Write-Host "Removed: $($file.Name)"
}

# Remove setup/utility scripts
$setupFiles = @(
    "setup-localtunnel.js",
    "setup-cloudflare-tunnel.js",
    "start-with-cloudflare.bat",
    "start-with-localtunnel.bat",
    "start-with-ngrok.bat",
    "install-cloudflared.bat",
    "ngrok-expose.js",
    "expose-app.js",
    "ngrok.yml",
    "stop-all-services.bat",
    "stop-services.bat",
    "docker-compose.dev.yml",
    "docker-compose.ngrok.yml",
    "docker-compose.prod.yml",
    "docker-helper.bat",
    "docker-helper.sh"
)

Write-Host "Removing setup/utility scripts..." -ForegroundColor Yellow
foreach ($fileName in $setupFiles) {
    $file = Get-ChildItem -Path . -Recurse -Name $fileName -ErrorAction SilentlyContinue
    if ($file) {
        Remove-Item $file -Force
        Write-Host "Removed: $fileName"
    }
}

# Remove migration files
$migrationFiles = Get-ChildItem -Path . -Include migrate*.js -Recurse
Write-Host "Removing $($migrationFiles.Count) migration files..." -ForegroundColor Yellow
foreach ($file in $migrationFiles) {
    Remove-Item $file.FullName -Force
    Write-Host "Removed: $($file.Name)"
}

# Clean up empty directories
$emptyDirs = Get-ChildItem -Path . -Directory -Recurse | Where-Object { (Get-ChildItem $_.FullName -Force | Measure-Object).Count -eq 0 }
Write-Host "Removing $($emptyDirs.Count) empty directories..." -ForegroundColor Yellow
foreach ($dir in $emptyDirs) {
    Remove-Item $dir.FullName -Force
    Write-Host "Removed empty directory: $($dir.Name)"
}

Write-Host "Cleanup completed successfully!" -ForegroundColor Green
Write-Host "To optimize further, consider:" -ForegroundColor Cyan
Write-Host "1. Running 'npm prune' to remove unused dependencies" -ForegroundColor Cyan
Write-Host "2. Running 'npm install' to reinstall dependencies cleanly" -ForegroundColor Cyan
Write-Host "3. Minifying CSS and JavaScript files for production" -ForegroundColor Cyan