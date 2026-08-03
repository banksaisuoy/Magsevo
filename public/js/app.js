                                    <button class="nav-tab w-full text-left px-4 py-2.5 rounded-lg transition-colors flex items-center gap-3 ${this.state.currentAdminTab === 'backup-system' ? 'active bg-[var(--primary-color)]/10 text-primary' : 'hover:bg-[var(--surface-light)]'}" data-tab="backup-system">
                                        <i class="fas fa-save w-5"></i> Backup System
                                    </button>
                                    <button class="nav-tab w-full text-left px-4 py-2.5 rounded-lg transition-colors flex items-center gap-3 ${this.state.currentAdminTab === 'api-management' ? 'active bg-[var(--primary-color)]/10 text-primary' : 'hover:bg-[var(--surface-light)]'}" data-tab="api-management">
                                        <i class="fas fa-network-wired w-5"></i> API & Rate Limits
                                    </button>
                                </div>
                            </div>

