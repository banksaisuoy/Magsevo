const AIFeaturesManagement = {
    init: async function() {
        console.log('AI Features Management Initialized');
        this.container = document.getElementById('ai-features-content') || document.getElementById('admin-content');
        if (!this.container) return;

        await this.loadSettings();
        this.render();
    },

    loadSettings: async function() {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const response = await fetch('/api/settings', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                this.settings = await response.json();
            } else {
                this.settings = {};
            }
        } catch (e) {
            console.error('Failed to load settings', e);
            this.settings = {};
        }
    },

    render: function() {
        const apiKey = this.settings.gemini_api_key || '';
        const model = this.settings.gemini_model || 'gemini-1.5-flash';

        const html = `
            <div class="container-fluid">
                <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
                    <h1 class="h2">AI Settings</h1>
                </div>

                <div class="row">
                    <div class="col-md-6">
                        <div class="card shadow-sm mb-4">
                            <div class="card-header py-3">
                                <h6 class="m-0 font-weight-bold text-primary">Google Gemini Configuration</h6>
                            </div>
                            <div class="card-body">
                                <p class="text-muted mb-3">Configure the AI model used for generating video descriptions and tags.</p>

                                <div class="mb-3">
                                    <label for="gemini-api-key" class="form-label">API Key</label>
                                    <div class="input-group">
                                        <input type="password" class="form-control" id="gemini-api-key" value="${apiKey}" placeholder="Enter Gemini API Key">
                                        <button class="btn btn-outline-secondary" type="button" onclick="AIFeaturesManagement.toggleVisibility('gemini-api-key')">
                                            <i class="fas fa-eye"></i>
                                        </button>
                                    </div>
                                    <small class="form-text text-muted">Get your key from Google AI Studio.</small>
                                </div>

                                <div class="mb-3">
                                    <label for="gemini-model" class="form-label">Model Selection</label>
                                    <input type="text" class="form-control" id="gemini-model" value="${model}" list="gemini-models-list" placeholder="Select or type model name">
                                    <datalist id="gemini-models-list">
                                        <option value="gemini-1.5-flash">Gemini 1.5 Flash (Fast)</option>
                                        <option value="gemini-1.5-pro">Gemini 1.5 Pro (Powerful)</option>
                                        <option value="gemini-2.0-flash-exp">Gemini 2.0 Flash (Experimental)</option>
                                        <option value="gemini-pro">Gemini 1.0 Pro</option>
                                    </datalist>
                                    <small class="form-text text-muted">You can type a custom model name if it's not listed (e.g. gemini-3-pro-preview).</small>
                                </div>

                                <button onclick="AIFeaturesManagement.saveSettings()" class="btn btn-primary">
                                    <i class="fas fa-save me-2"></i>Save Settings
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.container.innerHTML = html;
    },

    toggleVisibility: function(id) {
        const input = document.getElementById(id);
        if (input.type === 'password') {
            input.type = 'text';
        } else {
            input.type = 'password';
        }
    },

    saveSettings: async function() {
        const apiKey = document.getElementById('gemini-api-key').value;
        const model = document.getElementById('gemini-model').value;
        const token = localStorage.getItem('token');

        try {
            const response = await fetch('/api/settings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    gemini_api_key: apiKey,
                    gemini_model: model
                })
            });

            const result = await response.json();
            if (result.success) {
                alert('AI Settings Saved Successfully!');
            } else {
                alert('Error saving settings: ' + (result.error || 'Unknown error'));
            }
        } catch (e) {
            console.error(e);
            alert('Error saving settings');
        }
    }
};

window.AIFeaturesManagement = AIFeaturesManagement;
