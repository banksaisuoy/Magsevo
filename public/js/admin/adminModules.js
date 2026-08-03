        if (typeof BackupSystemManagement !== 'undefined') {
            this.modules['backup-system'] = new BackupSystemManagement(app);
        }
        if (typeof APIManagement !== 'undefined') {
            this.modules['api-management'] = new APIManagement(app);
        }
    }

    // Render the appropriate admin module based on the current tab
                    'video-compression': 'Video Compression',
                    'system-health': 'System Health',
                    'backup-system': 'Backup System',
                    'api-management': 'API Management',
                    'report-reasons': 'Report Reasons',
                    'password-policy': 'Password Policy',
                    'users': 'User Management',