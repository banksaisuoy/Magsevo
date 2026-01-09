document.addEventListener('DOMContentLoaded', () => {
    // Wait for VisionHub to be exposed
    const waitForVisionHub = setInterval(() => {
        if (window.VisionHub) {
            clearInterval(waitForVisionHub);
            initBridge();
        }
    }, 100);

    function initBridge() {
        const { apiFetch, showToast, showModal, hideModal, showConfirmModal } = window.VisionHub;

        // Mock App object for legacy modules
        const mockApp = {
            api: {
                get: async (url) => {
                    const res = await apiFetch('/api' + url);
                    if (res.ok) return res.json();
                    throw new Error(res.statusText);
                },
                post: async (url, body) => {
                    const res = await apiFetch('/api' + url, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(body)
                    });
                    if (res.ok) return res.json();
                    throw new Error(res.statusText);
                },
                put: async (url, body) => {
                    const res = await apiFetch('/api' + url, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(body)
                    });
                    if (res.ok) return res.json();
                    throw new Error(res.statusText);
                },
                delete: async (url) => {
                    const res = await apiFetch('/api' + url, { method: 'DELETE' });
                    if (res.ok) return res.json();
                    throw new Error(res.statusText);
                }
            },
            showLoading: (show, msg) => {
                // We don't have a loading overlay in the new UI yet, use toast?
                // Or implement a simple one.
                if (show) {
                    showToast(msg || 'Loading...', 2000, 'info');
                }
            },
            showToast: (msg, type) => {
                // Legacy types: info, success, error, warning
                // New types: neutral, success, error
                let newType = 'neutral';
                if (type === 'error' || type === 'danger') newType = 'error';
                if (type === 'success') newType = 'success';
                showToast(msg, 3000, newType);
            },
            showConfirmationModal: (msg, onConfirm) => {
                // New showConfirmModal takes a callback(bool)
                // We need to adapt it
                // But the new one has hardcoded text "Are you sure you want to delete?"
                // The legacy modules pass a custom message.
                // We need to hack the new confirm modal text.
                const confirmText = document.getElementById('confirm-text');
                if (confirmText) confirmText.textContent = msg;

                showConfirmModal((confirmed) => {
                    if (confirmed) onConfirm();
                });
            }
        };

        // Initialize AdminModules
        // Note: AdminModules class is loaded from js/admin/adminModules.js
        if (typeof AdminModules !== 'undefined') {
            window.adminModulesInstance = new AdminModules(mockApp);
            console.log('AdminModules initialized via bridge');
        } else {
            console.error('AdminModules class not found');
        }

        // Handle Legacy Admin Buttons
        const legacyModal = document.getElementById('legacy-admin-modal');
        const legacyTitle = document.getElementById('legacy-admin-title');
        const adminPanelModal = document.getElementById('admin-panel-modal');

        document.querySelectorAll('.legacy-admin-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const module = btn.dataset.legacyModule;
                const title = btn.querySelector('span').textContent;

                if (adminPanelModal) hideModal(adminPanelModal);
                if (legacyModal) {
                    legacyTitle.textContent = title;
                    showModal(legacyModal);

                    if (window.adminModulesInstance) {
                        window.adminModulesInstance.renderModule(module);
                    }
                }
            });
        });
    }
});
