class APIManagement {
    constructor(app) {
        this.app = app;
        this.stats = null;
        this.rateLimits = null;
        this.metrics = null;
    }

    async render() {
        const adminContent = document.getElementById('admin-content');
        adminContent.innerHTML = '<div class="text-center">Loading API management...</div>';

        try {
            await this.fetchData();
            
            const html = `
                <div class="mb-6 flex justify-between items-center">
                    <div>
                        <h2 class="text-2xl font-bold">API & Rate Limiting Management</h2>
                        <p class="text-muted">Monitor API usage, performance, and manage rate limits</p>
                    </div>
                    <div class="flex gap-2">
                        <button id="refresh-api-btn" class="btn btn-secondary">
                            <i class="fas fa-sync-alt mr-2"></i> Refresh
                        </button>
                        <button id="reset-stats-btn" class="btn btn-warning">
                            <i class="fas fa-redo mr-2"></i> Reset Stats
                        </button>
                        <button id="export-report-btn" class="btn btn-primary">
                            <i class="fas fa-download mr-2"></i> Export Report
                        </button>
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div class="metric-card">
                        <h5 class="font-medium text-sm text-muted">Active Connections</h5>
                        <p class="text-3xl font-bold text-primary">${this.stats?.activeConnections || 0}</p>
                    </div>
                    <div class="metric-card">
                        <h5 class="font-medium text-sm text-muted">Total Requests (1h)</h5>
                        <p class="text-3xl font-bold">${this.stats?.totalRequests || 0}</p>
                    </div>
                    <div class="metric-card">
                        <h5 class="font-medium text-sm text-muted">Avg Response Time</h5>
                        <p class="text-3xl font-bold ${this.stats?.averageResponseTime > 1000 ? 'text-red-500' : 'text-green-500'}">
                            ${this.stats?.averageResponseTime || 0}ms
                        </p>
                    </div>
                    <div class="metric-card">
                        <h5 class="font-medium text-sm text-muted">Error Rate</h5>
                        <p class="text-3xl font-bold ${this.stats?.errorRate > 5 ? 'text-red-500' : 'text-green-500'}">
                            ${this.stats?.errorRate || 0}%
                        </p>
                    </div>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    <div class="card">
                        <h4 class="text-lg font-semibold mb-4 border-b pb-2">Rate Limits Configuration</h4>
                        <div class="overflow-x-auto">
                            <table class="w-full text-left border-collapse">
                                <thead>
                                    <tr class="bg-surface-light border-b text-muted text-sm">
                                        <th class="p-3">Endpoint Group</th>
                                        <th class="p-3">Window</th>
                                        <th class="p-3">Max Requests</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${Object.entries(this.rateLimits || {}).map(([key, limit]) => `
                                        <tr class="border-b hover:bg-surface-light/50 transition-colors">
                                            <td class="p-3 font-medium capitalize">${key}</td>
                                            <td class="p-3">${limit.windowMs / 1000 / 60} min</td>
                                            <td class="p-3">
                                                <span class="badge badge-info">${limit.max}</span>
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div class="card">
                        <h4 class="text-lg font-semibold mb-4 border-b pb-2">Top Endpoints by Usage</h4>
                        <div class="overflow-x-auto">
                            <table class="w-full text-left border-collapse">
                                <thead>
                                    <tr class="bg-surface-light border-b text-muted text-sm">
                                        <th class="p-3">Endpoint</th>
                                        <th class="p-3">Requests</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${this.stats?.topEndpoints?.map(([endpoint, count]) => `
                                        <tr class="border-b hover:bg-surface-light/50 transition-colors">
                                            <td class="p-3 font-mono text-sm">${this.app.escapeHtml(endpoint)}</td>
                                            <td class="p-3">
                                                <span class="badge badge-primary">${count}</span>
                                            </td>
                                        </tr>
                                    `).join('') || '<tr><td colspan="2" class="p-3 text-center text-muted">No data available</td></tr>'}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div class="card mb-6">
                    <h4 class="text-lg font-semibold mb-4 border-b pb-2">Top Endpoints by Errors</h4>
                    <div class="overflow-x-auto">
                        <table class="w-full text-left border-collapse">
                            <thead>
                                <tr class="bg-surface-light border-b text-muted text-sm">
                                    <th class="p-3">Endpoint</th>
                                    <th class="p-3">Errors</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${this.stats?.topErrors?.map(([endpoint, count]) => `
                                    <tr class="border-b hover:bg-surface-light/50 transition-colors">
                                        <td class="p-3 font-mono text-sm">${this.app.escapeHtml(endpoint)}</td>
                                        <td class="p-3">
                                            <span class="badge badge-danger">${count}</span>
                                        </td>
                                    </tr>
                                `).join('') || '<tr><td colspan="2" class="p-3 text-center text-muted">No errors logged</td></tr>'}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
            
            adminContent.innerHTML = html;
            this.setupEventHandlers();
            
        } catch (error) {
            console.error('Error rendering API management:', error);
            adminContent.innerHTML = '<div class="text-center text-red-500">Error loading API management data. Please try again.</div>';
        }
    }

    async fetchData() {
        try {
            const [statsRes, limitsRes] = await Promise.all([
                this.app.api.get('/api-management/stats'),
                this.app.api.get('/api-management/rate-limits')
            ]);
            
            if (statsRes.success) this.stats = statsRes.statistics;
            if (limitsRes.success) this.rateLimits = limitsRes.rateLimits;
            
        } catch (error) {
            console.error('Error fetching API management data:', error);
            throw error;
        }
    }

    setupEventHandlers() {
        document.getElementById('refresh-api-btn')?.addEventListener('click', async () => {
            this.app.showLoading(true, 'Refreshing API stats...');
            await this.render();
            this.app.showToast('API stats refreshed', 'success');
            this.app.showLoading(false);
        });

        document.getElementById('reset-stats-btn')?.addEventListener('click', async () => {
            if (confirm('Are you sure you want to reset all API statistics? This cannot be undone.')) {
                try {
                    const res = await this.app.api.post('/api-management/reset');
                    if (res.success) {
                        this.app.showToast('API statistics reset successfully', 'success');
                        await this.render();
                    }
                } catch (error) {
                    this.app.showToast('Failed to reset statistics', 'error');
                }
            }
        });

        document.getElementById('export-report-btn')?.addEventListener('click', async () => {
            try {
                const response = await fetch('/api/api-management/report?format=csv', {
                    headers: {
                        'Authorization': `Bearer ${this.app.auth.getToken()}`
                    }
                });
                
                if (response.ok) {
                    const blob = await response.blob();
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `api_report_${new Date().toISOString().split('T')[0]}.csv`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    window.URL.revokeObjectURL(url);
                    this.app.showToast('Report exported successfully', 'success');
                } else {
                    throw new Error('Failed to export report');
                }
            } catch (error) {
                this.app.showToast('Failed to export report', 'error');
            }
        });
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = APIManagement;
} else {
    // For browser usage
    window.APIManagement = APIManagement;
}