#!/bin/bash

# Project Cleanup Script
# This script removes unnecessary files to optimize the project

echo -e "\033[0;32mStarting project cleanup...\033[0m"

# Remove unnecessary Markdown files (keep only README.md)
find . -name "*.md" -not -name "README.md" -delete
echo -e "\033[1;33mRemoved unnecessary Markdown files\033[0m"

# Remove test JavaScript files
find . -name "*test*.js" -delete
find . -name "*check*.js" -delete
find . -name "*admin-panel*.js" -delete
find . -name "*comprehensive*.js" -delete
find . -name "*verify*.js" -delete
find . -name "*diagnose*.js" -delete
echo -e "\033[1;33mRemoved test JavaScript files\033[0m"

# Remove HTML test files
find . -name "*test*.html" -delete
find . -name "*carousel*.html" -delete
find . -name "Steam.html" -delete
echo -e "\033[1;33mRemoved HTML test files\033[0m"

# Remove setup/utility scripts
rm -f setup-localtunnel.js
rm -f setup-cloudflare-tunnel.js
rm -f start-with-cloudflare.bat
rm -f start-with-localtunnel.bat
rm -f start-with-ngrok.bat
rm -f install-cloudflared.bat
rm -f ngrok-expose.js
rm -f expose-app.js
rm -f ngrok.yml
rm -f stop-all-services.bat
rm -f stop-services.bat
rm -f docker-compose.dev.yml
rm -f docker-compose.ngrok.yml
rm -f docker-compose.prod.yml
rm -f docker-helper.bat
rm -f docker-helper.sh
echo -e "\033[1;33mRemoved setup/utility scripts\033[0m"

# Remove migration files
find . -name "migrate*.js" -delete
echo -e "\033[1;33mRemoved migration files\033[0m"

# Clean up empty directories
find . -type d -empty -delete
echo -e "\033[1;33mRemoved empty directories\033[0m"

echo -e "\033[0;32mCleanup completed successfully!\033[0m"
echo -e "\033[0;36mTo optimize further, consider:\033[0m"
echo -e "\033[0;36m1. Running 'npm prune' to remove unused dependencies\033[0m"
echo -e "\033[0;36m2. Running 'npm install' to reinstall dependencies cleanly\033[0m"
echo -e "\033[0;36m3. Minifying CSS and JavaScript files for production\033[0m"