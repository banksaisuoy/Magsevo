// VisionHub - Video Content Management System
// Frontend Application Logic

// Global application state
const App = {
    // HTML Escape utility
    escapeHtml(str) {
        if (str == null) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    },

    // State management
    state: {
        currentUser: null,
        currentPage: 'home',
        currentVideoId: null,
        isAdminPanelOpen: false,
        currentAdminTab: 'users',
        currentSort: 'newest',
        siteSettings: {
            siteName: 'VisionHub',
            primaryColor: '#2a9d8f'
        },
        allVideos: [],
        featuredVideos: [],
        currentFeaturedIndex: 0,
        featuredIntervalId: null,
        isLoading: false
    },

    // DOM elements
    elements: {
        root: null,
        toastContainer: null,
        modalContainer: null,
        loadingOverlay: null
    },

    // API configuration
    apiBase: '/api',

    // Mock Data Fallbacks
        mockData: {
        videos: [
            { id: 101, title: 'Getting Started with UI Design', description: 'Learn the fundamentals of user interface design and create stunning web applications.', thumbnailUrl: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?q=80&w=800&auto=format&fit=crop', videoUrl: 'https://www.youtube.com/watch?v=aqz-KE-bpKQ', views: 12500, isFeatured: 1, categoryId: 1, categoryName: 'Design', created_at: new Date().toISOString() },
            { id: 102, title: 'Advanced JavaScript Concepts', description: 'Deep dive into closures, prototypes, and asynchronous programming in modern JavaScript.', thumbnailUrl: 'https://images.unsplash.com/photo-1555099962-4199c345e5dd?q=80&w=800&auto=format&fit=crop', videoUrl: 'https://www.youtube.com/watch?v=aqz-KE-bpKQ', views: 8900, isFeatured: 1, categoryId: 2, categoryName: 'Development', created_at: new Date().toISOString() },
            { id: 103, title: 'Mastering CSS Grid', description: 'A complete guide to building complex layouts with CSS Grid.', thumbnailUrl: 'https://images.unsplash.com/photo-1507721999472-8ed4421c4af2?q=80&w=800&auto=format&fit=crop', videoUrl: 'https://www.youtube.com/watch?v=aqz-KE-bpKQ', views: 4200, isFeatured: 0, categoryId: 2, categoryName: 'Development', created_at: new Date().toISOString() },
            { id: 104, title: 'Photography Basics', description: 'Understanding exposure, composition, and lighting for better photos.', thumbnailUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=800&auto=format&fit=crop', videoUrl: 'https://www.youtube.com/watch?v=aqz-KE-bpKQ', views: 15600, isFeatured: 0, categoryId: 3, categoryName: 'Photography', created_at: new Date().toISOString() },
            { id: 105, title: 'Marketing Strategies for 2024', description: 'How to grow your audience and build a brand online.', thumbnailUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800&auto=format&fit=crop', videoUrl: 'https://www.youtube.com/watch?v=aqz-KE-bpKQ', views: 3200, isFeatured: 0, categoryId: 4, categoryName: 'Business', created_at: new Date().toISOString() }
        ],
        categories: [
            { id: 1, name: 'Design' },
            { id: 2, name: 'Development' },
            { id: 3, name: 'Photography' },
            { id: 4, name: 'Business' }
        ],
        comments: [
            { id: 1, videoId: 101, userId: 'user', text: 'This was incredibly helpful! Thank you.', created_at: new Date().toISOString() },
            { id: 2, videoId: 101, userId: 'admin', text: 'Glad you enjoyed it.', created_at: new Date().toISOString() }
        ],
        reports: [
            { id: 1, videoId: 101, reason: 'Spam', description: 'This looks like spam.', reporter: 'user', created_at: new Date().toISOString(), status: 'pending' },
            { id: 2, videoId: 102, reason: 'Inappropriate', description: 'Not suitable.', reporter: 'user2', created_at: new Date().toISOString(), status: 'resolved' }
        ],
        logs: [
            { id: 1, action: 'LOGIN', userId: 'admin', details: 'Admin logged in', created_at: new Date().toISOString() },
            { id: 2, action: 'CREATE_VIDEO', userId: 'admin', details: 'Created video 101', created_at: new Date().toISOString() }
        ],
        users: [
            { username: 'admin', role: 'admin', created_at: new Date().toISOString() },
            { username: 'user', role: 'user', created_at: new Date().toISOString() }
        ],
        groups: [],
        permissions: [],
        passwordPolicy: {}
    },


    // Initialize the application
    async init() {
        console.log('App initialization started');
        this.elements.root = document.getElementById('root');
        this.elements.toastContainer = document.getElementById('toast-container');
        this.elements.modalContainer = document.getElementById('modal-container');
        this.elements.loadingOverlay = document.getElementById('loading-overlay');

        console.log('DOM elements initialized');

        // Check for existing authentication
        const token = localStorage.getItem('authToken');
        console.log('Auth token found:', !!token);
        if (token) {
            try {
                const response = await this.api.get('/auth/verify');
                console.log('Auth verification response:', response);
                if (response.success) {
                    this.state.currentUser = response.user;
                    console.log('User authenticated:', this.state.currentUser);
                }
            } catch (error) {
                // Token is invalid, remove it
                localStorage.removeItem('authToken');
                console.log('Invalid token, removed from localStorage');
            }
        }

        // Load initial data
        console.log('Loading initial data');
        await this.loadInitialData();

        // Start the application
        console.log('Rendering app');
        this.render();
        console.log('App rendered');

        // Set up event listeners
        console.log('Setting up event listeners');
        this.setupEventListeners();
        console.log('Event listeners set up');
    },

    // API methods
    api: {
        async request(endpoint, options = {}) {
            const token = localStorage.getItem('authToken');
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { 'Authorization': `Bearer ${token}` })
                },
                ...options
            };

            if (config.body && typeof config.body === 'object') {
                config.body = JSON.stringify(config.body);
            }

            try {
                const response = await fetch(`${App.apiBase}${endpoint}`, config);
                const data = await response.json();

                if (!response.ok) {
                    // Mute warning for /auth/verify failing gracefully when invalid token exists
                    if (endpoint !== '/auth/verify') {
                        console.warn(`API request to ${endpoint} failed: ${data.error || response.statusText}`);
                    }
                    throw new Error(data.error || 'Request failed');
                }

                return data;
            } catch (error) {
                if (endpoint !== '/auth/verify') {
                    console.warn(`API request to ${endpoint} failed. Using mock fallback...`, error.message);
                }

                // Mock Fallbacks
                if (endpoint === '/auth/verify') {
                    if (token === 'mock-token-user') return { success: true, user: { username: 'user', role: 'user' } };
                    if (token === 'mock-token-admin') return { success: true, user: { username: 'admin', role: 'admin' } };
                    throw new Error('Invalid mock token');
                }

                if (endpoint === '/auth/login') {
                    const body = JSON.parse(config.body);
                    if (body.username === 'admin' && body.password === '123456') {
                        return { success: true, token: 'mock-token-admin', user: { username: 'admin', role: 'admin' } };
                    } else if (body.username === 'user' && body.password === '123456') {
                        return { success: true, token: 'mock-token-user', user: { username: 'user', role: 'user' } };
                    }
                    throw new Error('Invalid mock credentials');
                }

                if (endpoint === '/videos') {
                    return { success: true, videos: App.mockData.videos };
                }

                if (endpoint.startsWith('/videos/search')) {
                    return { success: true, videos: App.mockData.videos };
                }

                if (endpoint.startsWith('/videos/')) {
                    if (endpoint.endsWith('/view')) return { success: true };
                    const videoId = parseInt(endpoint.split('/').pop());
                    const video = App.mockData.videos.find(v => v.id === videoId);
                    if (video) return { success: true, video };
                    throw new Error('Mock video not found');
                }

                if (endpoint === '/categories') {
                    return { success: true, categories: App.mockData.categories };
                }

                if (endpoint === '/reports' || endpoint.startsWith('/reports?')) {
                    return { success: true, reports: App.mockData.reports };
                }

                if (endpoint === '/logs' || endpoint.startsWith('/logs?')) {
                    return { success: true, logs: App.mockData.logs };
                }

                if (endpoint === '/users') {
                    return { success: true, users: App.mockData.users };
                }

                if (endpoint === '/favorites') {
                    // Just return first two as favorites for mock
                    return { success: true, favorites: [App.mockData.videos[0], App.mockData.videos[1]] };
                }

                if (endpoint.startsWith('/favorites/')) {
                    if (options.method === 'DELETE') return { success: true };
                    if (options.method === 'POST') return { success: true };
                    return { success: true, isFavorited: true };
                }

                if (endpoint.startsWith('/comments/video/')) {
                    const videoId = parseInt(endpoint.split('/').pop());
                    const comments = App.mockData.comments.filter(c => c.videoId === videoId);
                    return { success: true, comments };
                }


                if (endpoint === '/settings') {
                    return { success: true, settings: { siteName: 'VisionHub', primaryColor: '#2a9d8f' } };
                }

                if (endpoint === '/auth/logout') {
                    return { success: true };
                }

                if (endpoint === '/comments') {
                    return { success: true, comments: App.mockData.comments || [] };
                }

                if (endpoint.startsWith('/comments/')) {
                    return { success: true, comments: App.mockData.comments || [] };
                }

                if (endpoint === '/tags' || endpoint.startsWith('/tags/')) {
                    return { success: true, tags: [{id: 1, name: 'Mock Tag', color: '#2563eb'}] };
                }

                if (endpoint === '/reports') {
                    return { success: true };
                }

                if (endpoint === '/report-reasons') {
                    return { success: true, reasons: [{reason: 'Inappropriate content'}, {reason: 'Spam'}, {reason: 'Copyright violation'}, {reason: 'Misleading content'}, {reason: 'Violence or harmful content'}, {reason: 'Hate speech'}, {reason: 'Other'}] };
                }

                if (endpoint === '/logs') return { success: true, logs: App.mockData.logs || [] };
                if (endpoint === '/groups') return { success: true, groups: App.mockData.groups || [] };
                if (endpoint === '/permissions') return { success: true, permissions: App.mockData.permissions || [] };
                if (endpoint === '/password-policy') return { success: true, policy: App.mockData.passwordPolicy || {} };
                if (endpoint === '/health') return { success: true, health: { status: 'ok', uptime: 1000 } };
                if (endpoint === '/api/health') return { success: true, health: { status: 'ok', uptime: 1000 } };



                if (endpoint === '/health/overview') return { success: true, overview: { overall: 'healthy' } };
                if (endpoint === '/health/metrics') return { success: true, metrics: {} };
                if (endpoint === '/health/alerts') return { success: true, alerts: [] };
                if (endpoint === '/video-compression/status') return { success: true, status: { enabled: true } };
                if (endpoint === '/ai/status') return { success: true, status: { enabled: true } };
                if (endpoint === '/backups/status') return { success: true, status: { scheduleEnabled: true } };
                if (endpoint === '/backups/list') return { success: true, backups: [] };

                // Default fallback for unhandled endpoints
                return { success: true };
            }
        },

        async get(endpoint) {
            return this.request(endpoint);
        },

        async post(endpoint, data) {
            return this.request(endpoint, {
                method: 'POST',
                body: data
            });
        },

        async put(endpoint, data) {
            return this.request(endpoint, {
                method: 'PUT',
                body: data
            });
        },

        async delete(endpoint) {
            return this.request(endpoint, {
                method: 'DELETE'
            });
        }
    },

    // Load initial data from the server
    async loadInitialData() {
        try {
            this.showLoading(true);

            const settingsResponse = await this.api.get('/settings');
            if (settingsResponse.success) {
                this.state.siteSettings = {
                    ...this.state.siteSettings,
                    ...settingsResponse.settings
                };
                this.applySettings();
                console.log('Site settings loaded:', this.state.siteSettings);
            }

            await this.loadAllVideos();
        } catch (error) {
            console.error('Error loading initial data:', error);
        } finally {
            this.showLoading(false);
        }
    },

    // Load all videos from the server
    async loadAllVideos() {
        try {
            console.log('Loading all videos');
            const response = await this.api.get('/videos');
            console.log('Videos response:', response);

            if (response.success) {
                this.state.allVideos = response.videos || [];
                console.log('All videos loaded:', this.state.allVideos.length);

                this.state.allVideos.forEach((video, index) => {
                    if (index < 5) {

                    }
                });

                this.state.featuredVideos = this.state.allVideos.filter(v => {

                    const isFeatured = v.isFeatured === true || v.isFeatured === 1 || v.isFeatured === '1';
                    if (isFeatured && this.state.featuredVideos && this.state.featuredVideos.length < 5) {
                        console.log('Found featured video:', v.id, v.title);
                    }
                    return isFeatured;
                });

                console.log('Featured videos count:', this.state.featuredVideos.length);
                console.log('First few featured videos:', this.state.featuredVideos.slice(0, 3));
            } else {
                console.error('Failed to load videos, response:', response);
            }
        } catch (error) {
            console.error('Error loading videos:', error);
            this.showToast('Failed to load videos', 'error');
        }
    },

    // Apply site settings to the UI
    applySettings() {
        document.getElementById('site-title').textContent = this.state.siteSettings.siteName;
        document.documentElement.style.setProperty('--primary-color', this.state.siteSettings.primaryColor);
    },

    // Navigate to a different page
    navigateTo(page, data = null) {
        console.log('Navigating to page:', page, 'with data:', data);
        console.log('Current featuredIntervalId before clearing:', this.state.featuredIntervalId);
        if (this.state.featuredIntervalId) {
            console.log('Clearing existing interval:', this.state.featuredIntervalId);
            clearInterval(this.state.featuredIntervalId);
            this.state.featuredIntervalId = null;
        }

        this.state.currentPage = page;

        if (page === 'video') {
            this.state.currentVideoId = data;
        } else if (page === 'admin') {
            this.state.isAdminPanelOpen = true;
            this.state.currentAdminTab = data || 'users';
        } else {
            this.state.isAdminPanelOpen = false;
        }

        this.render();

    },

    // Render the current page
    render() {
        console.log('Rendering app, current page:', this.state.currentPage, 'user:', this.state.currentUser);
        console.log('Featured interval ID during render:', this.state.featuredIntervalId);
        if (!this.state.currentUser) {

            this.renderLoginPage();
        } else {
            console.log('Rendering main app for user:', this.state.currentUser.username);
            switch (this.state.currentPage) {
                case 'home':

                    this.renderHomePage();
                    break;
                case 'video':
                    console.log('Rendering video page for video ID:', this.state.currentVideoId);
                    this.renderVideoPage(this.state.currentVideoId);
                    break;
                case 'admin':

                    this.renderAdminPage();
                    break;
                case 'favorites':

                    this.renderFavoritesPage();
                    break;
                default:

                    this.renderHomePage();
            }
        }
        this.applySettings();
    },

    // Render the login page
    renderLoginPage() {
        const loginHtml = `
            <div class="min-h-screen flex items-center justify-center bg-[#020817] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(42,157,143,0.3),rgba(255,255,255,0))] p-4">
                <div class="w-full max-w-md bg-[#0f172a]/80 backdrop-blur-xl border border-[#1e293b] p-8 rounded-xl shadow-2xl animate-fade-in-up">
                    <div class="text-center mb-8">
                        <h2 class="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-emerald-400">Welcome Back</h2>
                        <p class="text-sm text-gray-400 mt-2">Enter your credentials to access your account</p>
                    </div>
                    <form id="login-form" class="space-y-5">
                        <div class="space-y-2">
                            <label for="username" class="text-sm font-medium text-gray-200">Username</label>
                            <input type="text" id="username" name="username" class="flex h-10 w-full rounded-md border border-gray-700 bg-gray-900/50 px-3 py-2 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all" placeholder="Enter username" required>
                        </div>
                        <div class="space-y-2">
                            <label for="password" class="text-sm font-medium text-gray-200">Password</label>
                            <input type="password" id="password" name="password" class="flex h-10 w-full rounded-md border border-gray-700 bg-gray-900/50 px-3 py-2 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all" placeholder="••••••••" required>
                        </div>
                        <button type="submit" class="w-full inline-flex items-center justify-center rounded-md text-sm font-medium transition-all h-10 px-4 py-2 bg-gradient-to-r from-teal-500 to-emerald-600 text-white hover:from-teal-400 hover:to-emerald-500 hover:shadow-[0_0_20px_rgba(42,157,143,0.4)] active:scale-95">
                            Sign In <i class="fas fa-arrow-right ml-2 text-xs"></i>
                        </button>
                        <div id="login-message" class="text-sm text-rose-500 text-center font-medium hidden mt-4"></div>
                        <div class="text-center mt-6 p-4 rounded-lg bg-gray-800/30 border border-gray-800/50">
                            <p class="text-xs text-gray-400 mb-1">Demo Accounts:</p>
                            <div class="flex justify-center gap-4 text-xs font-mono text-gray-300">
                                <span>admin / 123456</span>
                                <span>user / 123456</span>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        `;

        this.elements.root.innerHTML = loginHtml;
        document.getElementById('login-form').addEventListener('submit', (e) => this.handleLogin(e));
    },

    // Render the main application layout
    renderMainApp() {

        const isAdmin = this.state.currentUser?.role === 'admin';
        const mainAppHtml = `
            <header class="sticky top-0 z-50 w-full border-b border-[#1e293b] bg-[#020817]/80 backdrop-blur-md supports-[backdrop-filter]:bg-[#020817]/60 p-4 mb-8 shadow-sm">
                <div class="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                    <div class="flex items-center gap-6 w-full md:w-auto">
                        <div class="flex items-center gap-2 cursor-pointer group" id="site-title-link">
                            <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-400 to-emerald-600 flex items-center justify-center text-white font-bold shadow-lg group-hover:scale-105 transition-transform">V</div>
                            <h1 class="text-2xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-100 to-gray-400">
                                ${this.state.siteSettings.siteName}
                            </h1>
                        </div>
                        <div class="relative hidden md:flex items-center w-72">
                            <i class="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm"></i>
                            <input type="text" id="search-input" placeholder="Search for videos..." class="flex h-9 w-full rounded-full border border-gray-800 bg-gray-900/50 px-3 py-1 text-sm shadow-inner transition-all placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 pl-9 hover:border-gray-700">
                        </div>
                    </div>
                    <div class="flex items-center gap-3 w-full md:w-auto justify-end">
                        <button id="favorites-button" class="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-teal-500 border border-gray-800 bg-transparent hover:bg-gray-800 text-gray-300 h-9 px-4 py-2 hover:text-white">
                            <i class="fas fa-heart mr-2 text-rose-500"></i> Favorites
                        </button>
                        ${isAdmin ? `
                            <button id="admin-panel-toggle" class="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-teal-500 bg-gray-800 text-gray-200 hover:bg-gray-700 hover:text-white h-9 w-9 border border-gray-700">
                                <i class="fas fa-cog"></i>
                            </button>
                        ` : ''}
                        <button id="logout-button" class="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-teal-500 border border-gray-800 bg-transparent hover:bg-rose-950/30 hover:border-rose-900/50 text-gray-300 h-9 px-4 py-2 hover:text-rose-400">
                            <i class="fas fa-sign-out-alt mr-2"></i> Log Out
                        </button>
                    </div>
                </div>
            </header>
            <div id="content" class="max-w-7xl mx-auto px-4 md:px-8 pb-12 animate-fade-in-up"></div>
        `;

        this.elements.root.innerHTML = mainAppHtml;

        document.getElementById('site-title-link').addEventListener('click', () => this.navigateTo('home'));
        if (isAdmin) {
            document.getElementById('admin-panel-toggle').addEventListener('click', () => this.navigateTo('admin'));
        }
        document.getElementById('logout-button').addEventListener('click', () => this.handleLogout());
        document.getElementById('favorites-button').addEventListener('click', () => this.navigateTo('favorites'));
        document.getElementById('search-input').addEventListener('input', (e) => this.handleSearch(e));
    },

    // Start the featured video carousel
    startFeaturedCarousel() {
        console.log('startFeaturedCarousel called, featuredVideos length:', this.state.featuredVideos.length);
        console.log('Current featuredIntervalId:', this.state.featuredIntervalId);

        if (this.state.featuredIntervalId) {
            console.log('Clearing existing carousel interval:', this.state.featuredIntervalId);
            clearInterval(this.state.featuredIntervalId);
            this.state.featuredIntervalId = null;
        }

        if (this.state.featuredVideos && this.state.featuredVideos.length > 1) {
            console.log('Starting featured carousel with', this.state.featuredVideos.length, 'videos');
            this.updateFeaturedVideo();

            this.state.featuredIntervalId = setInterval(() => {
                console.log('Carousel interval triggered at:', new Date().toISOString());
                this.updateFeaturedVideo();
            }, 5000);
            console.log('New carousel interval ID:', this.state.featuredIntervalId);
        } else {
            console.log('Not enough featured videos to start carousel, count:',
                this.state.featuredVideos ? this.state.featuredVideos.length : 0);
        }
    },

    // Update the featured video in the carousel
    updateFeaturedVideo() {

        if (!this.state.featuredVideos || this.state.featuredVideos.length === 0) {

            return;
        }

        console.log('Updating featured video, current index:', this.state.currentFeaturedIndex);

        this.state.currentFeaturedIndex = (this.state.currentFeaturedIndex + 1) % this.state.featuredVideos.length;
        const featuredVideo = this.state.featuredVideos[this.state.currentFeaturedIndex];
        console.log('New index:', this.state.currentFeaturedIndex, 'Video:', featuredVideo);

        const featuredSection = document.getElementById('featured-section');
        console.log('Featured section element:', featuredSection);

        if (featuredSection && featuredVideo) {
            const newHtml = `
                <div class="hero-section cursor-pointer group fade-in glass-panel rounded-2xl" data-video-id="${featuredVideo.id}">
                    <img loading="lazy" src="${featuredVideo.thumbnailUrl}" alt="${this.escapeHtml(featuredVideo.title)}" class="hero-bg group-hover:scale-105 transition-transform duration-700" onerror="this.src='https://images.unsplash.com/photo-1616469829581-73993eb86b02?q=80&w=800&auto=format&fit=crop'">
                    <div class="hero-overlay"></div>
                    <div class="hero-content">
                        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 border border-primary/50 text-[var(--primary-color)] text-sm font-semibold mb-4 backdrop-blur-sm" style="color: var(--primary-color); border-color: var(--primary-color); background-color: rgba(42, 157, 143, 0.2);">
                            <i class="fas fa-star"></i> Featured
                        </div>
                        <h2 class="hero-title">${this.escapeHtml(featuredVideo.title)}</h2>
                        <p class="hero-description">${this.escapeHtml(featuredVideo.description)}</p>
                        <div class="flex items-center gap-4 mt-6">
                            <button class="magnificent-button">
                                <i class="fas fa-play mr-2"></i> Watch Now
                            </button>
                            <span class="text-gray-300 text-sm flex items-center gap-2">
                                <i class="fas fa-eye"></i> ${featuredVideo.views} views
                            </span>
                        </div>
                    </div>
                </div>
            `;
            console.log('Setting featured section HTML:', newHtml);
            featuredSection.innerHTML = newHtml;

        } else {

        }
    },

    // Render the home page
    async renderHomePage(filteredVideos = null) {
        console.log('renderHomePage called, filteredVideos:', !!filteredVideos);
        this.renderMainApp();
        const contentDiv = document.getElementById('content');

        let videosToRender = [...(filteredVideos || this.state.allVideos)];
        const hasFeatured = this.state.featuredVideos && this.state.featuredVideos.length > 0 && !filteredVideos;

        // Apply sorting
        videosToRender.sort((a, b) => {
            switch(this.state.currentSort) {
                case 'newest':
                    return new Date(b.created_at || 0) - new Date(a.created_at || 0);
                case 'oldest':
                    return new Date(a.created_at || 0) - new Date(b.created_at || 0);
                case 'views-most':
                    return (b.views || 0) - (a.views || 0);
                case 'views-least':
                    return (a.views || 0) - (b.views || 0);
                case 'name-asc':
                    return (a.title || '').localeCompare(b.title || '');
                case 'name-desc':
                    return (b.title || '').localeCompare(a.title || '');
                default:
                    return 0;
            }
        });

        console.log('Rendering home page, featured videos count:',
            this.state.featuredVideos ? this.state.featuredVideos.length : 0,
            'hasFeatured:', hasFeatured);

        const trendingVideos = [...videosToRender]
            .sort((a, b) => b.views - a.views)
            .slice(0, 4);

        let categories = [];
        try {
            const response = await this.api.get('/categories');
            if (response.success) {
                categories = response.categories;
            }
        } catch (error) {
            console.error('Error loading categories:', error);
        }

        const categoriesHtml = categories.map(cat => `
            <div class="card cursor-pointer" data-category-id="${cat.id}">
                <h3 class="text-xl font-bold text-primary">${this.escapeHtml(cat.name)}</h3>
                <p class="text-sm text-secondary mt-2">
                    ${videosToRender.filter(v => v.categoryId === cat.id).length} videos
                </p>
            </div>
        `).join('');

        const homepageHtml = `
            <div class="space-y-8">
                ${hasFeatured ? `
                    <section id="featured-section">
                        <!-- Featured video will be rendered here -->
                    </section>
                ` : ''}

                ${trendingVideos.length > 0 && !filteredVideos ? `
                    <section>
                        <h2 class="text-2xl font-bold mb-4">Trending Videos</h2>
                        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            ${trendingVideos.map(video => `
                                <div class="group relative rounded-xl border border-gray-800 bg-[#0f172a]/50 p-2 hover:bg-[#1e293b]/50 transition-all duration-300 hover:shadow-2xl hover:shadow-teal-900/20 hover:-translate-y-1 cursor-pointer flex flex-col h-full" data-video-id="${video.id}">
                                    <div class="relative overflow-hidden rounded-lg aspect-video">
                                        <img loading="lazy" src="${video.thumbnailUrl}" alt="${this.escapeHtml(video.title)}" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" onerror="this.src='https://images.unsplash.com/photo-1616469829581-73993eb86b02?q=80&w=800&auto=format&fit=crop'">
                                        <div class="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
                                        <div class="absolute bottom-2 right-2 bg-black/80 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-md font-medium"><i class="fas fa-play text-[10px] mr-1"></i> Play</div>
                                    </div>
                                    <div class="p-3 flex-grow flex flex-col justify-between">
                                        <h3 class="font-semibold text-gray-100 line-clamp-2 leading-snug group-hover:text-teal-400 transition-colors">${this.escapeHtml(video.title)}</h3>
                                        <p class="text-xs text-gray-400 mt-2 flex items-center gap-2"><i class="fas fa-eye"></i> ${video.views.toLocaleString()} views</p>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </section>
                ` : ''}

                ${!filteredVideos ? `
                    <section>
                        <h2 class="text-2xl font-bold mb-4">Categories</h2>
                        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                            ${categoriesHtml}
                        </div>
                    </section>
                ` : ''}

                <section>
                    <div class="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
                        <h2 class="text-2xl font-bold">${filteredVideos ? 'Search Results' : 'All Videos'}</h2>
                        <div class="flex items-center gap-2">
                            <label for="video-sort" class="text-sm text-secondary font-medium whitespace-nowrap">Sort by:</label>
                            <select id="video-sort" class="form-select text-sm py-1 pl-3 pr-8 bg-[var(--surface-dark)] border-[var(--border-color)]">
                                <option value="newest" ${this.state.currentSort === 'newest' ? 'selected' : ''}>Newest First</option>
                                <option value="oldest" ${this.state.currentSort === 'oldest' ? 'selected' : ''}>Oldest First</option>
                                <option value="views-most" ${this.state.currentSort === 'views-most' ? 'selected' : ''}>Most Views</option>
                                <option value="views-least" ${this.state.currentSort === 'views-least' ? 'selected' : ''}>Least Views</option>
                                <option value="name-asc" ${this.state.currentSort === 'name-asc' ? 'selected' : ''}>Name (A-Z)</option>
                                <option value="name-desc" ${this.state.currentSort === 'name-desc' ? 'selected' : ''}>Name (Z-A)</option>
                            </select>
                        </div>
                    </div>
                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        ${videosToRender.length > 0 ? videosToRender.map(video => `
                                <div class="group relative rounded-xl border border-gray-800 bg-[#0f172a]/50 p-2 hover:bg-[#1e293b]/50 transition-all duration-300 hover:shadow-2xl hover:shadow-teal-900/20 hover:-translate-y-1 cursor-pointer flex flex-col h-full" data-video-id="${video.id}">
                                    <div class="relative overflow-hidden rounded-lg aspect-video">
                                        <img loading="lazy" src="${video.thumbnailUrl}" alt="${this.escapeHtml(video.title)}" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" onerror="this.src='https://images.unsplash.com/photo-1616469829581-73993eb86b02?q=80&w=800&auto=format&fit=crop'">
                                        <div class="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
                                        <div class="absolute bottom-2 right-2 bg-black/80 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-md font-medium"><i class="fas fa-play text-[10px] mr-1"></i> Play</div>
                                    </div>
                                    <div class="p-3 flex-grow flex flex-col justify-between">
                                        <h3 class="font-semibold text-gray-100 line-clamp-2 leading-snug group-hover:text-teal-400 transition-colors">${this.escapeHtml(video.title)}</h3>
                                        <div class="flex items-center justify-between mt-2">
                                            <p class="text-xs text-gray-400 flex items-center gap-1"><i class="fas fa-folder"></i> ${video.categoryName}</p>
                                            <p class="text-xs text-gray-400"><i class="fas fa-eye"></i> ${video.views || 0}</p>
                                        </div>
                                    </div>
                                </div>
                        `).join('') : '<div class="text-center text-muted col-span-full py-12 border border-dashed border-gray-800 rounded-xl bg-gray-900/30">No videos found</div>'}
                    </div>
                </section>
            </div>
        `;

        contentDiv.innerHTML = homepageHtml;

        if (hasFeatured) {

            const featuredSection = document.getElementById('featured-section');
            if (featuredSection) {

                featuredSection.addEventListener('click', (e) => {

                    let target = e.target;
                    while (target && target !== featuredSection) {
                        if (target.dataset && target.dataset.videoId) {
                            const videoId = target.dataset.videoId;
                            console.log('Clicked featured video with ID (delegated):', videoId);
                            if (videoId) {
                                this.navigateTo('video', videoId);
                                break;
                            }
                        }
                        target = target.parentElement;
                    }
                });
            }

            setTimeout(() => {

                if (this.state.featuredVideos && this.state.featuredVideos.length > 1) {

                    this.startFeaturedCarousel();
                } else {
                    console.log('Still not enough featured videos to start carousel, count:',
                        this.state.featuredVideos ? this.state.featuredVideos.length : 0);
                }
            }, 100);
        }

        document.querySelectorAll('.video-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const videoId = e.currentTarget.dataset.videoId;
                if (videoId) {
                    this.navigateTo('video', videoId);
                }
            });
        });

        document.querySelectorAll('[data-category-id]').forEach(card => {
            card.addEventListener('click', (e) => {
                const categoryId = e.currentTarget.dataset.categoryId;
                const categoryVideos = this.state.allVideos.filter(v => v.categoryId == categoryId);
                this.renderHomePage(categoryVideos);
            });
        });

        const sortSelect = document.getElementById('video-sort');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.state.currentSort = e.target.value;
                this.renderHomePage(filteredVideos);
            });
        }
    }
};

Object.assign(App, {

    async renderVideoPage(videoId) {
        this.renderMainApp();
        const contentDiv = document.getElementById('content');

        try {

            console.log('Fetching video with ID:', videoId);
            const videoResponse = await this.api.get(`/videos/${videoId}`);

            if (!videoResponse.success) {
                contentDiv.innerHTML = `<div class="text-center text-error">Video not found: ${videoResponse.error || 'Unknown error'}</div>`;
                return;
            }

            const video = videoResponse.video;

            try {
                await this.api.post(`/videos/${videoId}/view`);
            } catch (error) {
                console.error('Error recording view:', error);
            }

            const relatedVideos = this.state.allVideos
                .filter(v => v.categoryId === video.categoryId && v.id != videoId)
                .slice(0, 4);

            let isFavorited = false;
            try {
                const favResponse = await this.api.get(`/favorites/${videoId}`);
                isFavorited = favResponse.isFavorited;
            } catch (error) {
                console.error('Error checking favorite status:', error);
            }

            let videoEmbedHtml;
            try {
                videoEmbedHtml = this.getVideoEmbed(video.videoUrl);
            } catch (error) {
                console.error('Error generating video embed:', error);
                videoEmbedHtml = `<div class="text-center text-error">Error loading video player: ${error.message}</div>`;
            }

            const videoPageHtml = `
                <div class="theater-mode-container">
                    <div class="lg:col-span-2">
                        <div class="card p-0 overflow-hidden" style="border: none;">
                            <div class="video-player-container">
                                ${videoEmbedHtml}
                            </div>
                            <div class="video-controls p-2 bg-gray-900 flex justify-center gap-4">
                                <button id="skip-back-btn" class="btn-icon btn-secondary hover:bg-gray-700" title="Skip back 10s">
                                    <i class="fas fa-backward"></i>
                                </button>
                                <button id="skip-forward-btn" class="btn-icon btn-secondary hover:bg-gray-700" title="Skip forward 10s">
                                    <i class="fas fa-forward"></i>
                                </button>
                            </div>
                            <div class="p-6">
                                <div class="flex items-start justify-between mb-4">
                                    <h1 class="text-3xl font-bold">${this.escapeHtml(video.title)}</h1>
                                    <div class="flex space-x-2">
                                        <button id="favorite-btn" class="btn ${isFavorited ? 'btn-danger' : 'btn-secondary'} flex items-center gap-2" data-id="${video.id}">
                                            <i class="${isFavorited ? 'fas' : 'far'} fa-heart"></i> ${isFavorited ? 'Favorited' : 'Favorite'}
                                        </button>
                                        <button id="report-btn" class="btn btn-secondary flex items-center gap-2" data-id="${video.id}">
                                            <i class="fas fa-flag"></i> Report
                                        </button>
                                    </div>
                                </div>
                                <div class="flex items-center gap-4 text-sm text-secondary mb-6 pb-6 border-b border-[var(--border-color)]">
                                    <span class="flex items-center gap-1"><i class="fas fa-folder"></i> ${video.categoryName}</span>
                                    <span class="flex items-center gap-1"><i class="fas fa-eye"></i> ${video.views.toLocaleString()} views</span>
                                </div>
                                <div class="text-gray-300 leading-relaxed mb-4">
                                    ${this.escapeHtml(video.description) || 'No description available for this video.'}
                                </div>
                            </div>
                        </div>

                        <div id="comments-section" class="comments-section mt-8 card">
                            <h2 class="text-2xl font-bold mb-6 flex items-center gap-2"><i class="fas fa-comments text-primary"></i> Comments</h2>
                            <form id="comment-form" class="comment-form mb-8">
                                <div class="form-group flex gap-4">
                                    <div class="comment-avatar hidden sm:flex">${this.state.currentUser ? this.state.currentUser.username.charAt(0).toUpperCase() : '?'}</div>
                                    <div class="flex-1">
                                        <textarea id="comment-text" class="form-textarea w-full p-4 rounded-xl border border-[var(--border-color)] bg-[var(--surface-dark)] text-white focus:border-primary focus:ring-1 focus:ring-primary transition-all" rows="3" placeholder="Add a comment..." required></textarea>
                                        <div class="flex justify-end mt-2">
                                            <button type="submit" class="magnificent-button rounded-full px-6">Comment</button>
                                        </div>
                                    </div>
                                </div>
                            </form>
                            <div id="comments-list" class="space-y-4"></div>
                        </div>
                    </div>

                    <div class="lg:col-span-1">
                        <div class="card border-0 bg-transparent lg:bg-[var(--surface-dark)] lg:border lg:border-[var(--border-color)] p-0 lg:p-6 sticky top-24">
                            <h2 class="text-xl font-bold mb-6 hidden lg:block">Related Videos</h2>
                            <div class="space-y-4">
                                ${relatedVideos.length > 0 ? relatedVideos.map(video => `
                                    <div class="flex items-start space-x-3 p-2 -mx-2 rounded-lg cursor-pointer hover:bg-[var(--surface-light)] transition-colors group" data-video-id="${video.id}">
                                        <div class="relative w-32 shrink-0 rounded-lg overflow-hidden">
                                            <img loading="lazy" class="w-full h-20 object-cover group-hover:scale-105 transition-transform" src="${video.thumbnailUrl}" alt="${this.escapeHtml(video.title)}" onerror="this.src='https://images.unsplash.com/photo-1616469829581-73993eb86b02?q=80&w=800&auto=format&fit=crop'">
                                            <div class="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
                                        </div>
                                        <div class="flex-1 min-w-0">
                                            <h4 class="font-semibold text-sm line-clamp-2 leading-snug group-hover:text-primary transition-colors">${this.escapeHtml(video.title)}</h4>
                                            <p class="text-xs text-secondary mt-1">${video.categoryName}</p>
                                            <p class="text-xs text-secondary mt-1">${video.views} views</p>
                                        </div>
                                    </div>
                                `).join('') : '<p class="text-muted text-sm text-center py-4 border border-dashed border-[var(--border-color)] rounded-lg">No related videos found</p>'}
                            </div>
                        </div>
                    </div>
                </div>
            `;

            contentDiv.innerHTML = videoPageHtml;

            document.getElementById('favorite-btn').addEventListener('click', (e) => this.handleFavorite(e));
            document.getElementById('report-btn').addEventListener('click', (e) => this.handleReport(e));
            document.getElementById('comment-form').addEventListener('submit', (e) => this.handlePostComment(e));
            document.getElementById('skip-back-btn').addEventListener('click', () => this.skipVideo(-10));
            document.getElementById('skip-forward-btn').addEventListener('click', () => this.skipVideo(10));

            document.querySelectorAll('[data-video-id]').forEach(element => {
                element.addEventListener('click', (e) => {
                    const videoId = e.currentTarget.dataset.videoId;
                    if (videoId) {
                        this.navigateTo('video', videoId);
                    }
                });
            });

            this.loadComments(videoId);

        } catch (error) {
            console.error('Error rendering video page:', error);

            let errorMessage = 'Error loading video';
            if (error.message) {
                errorMessage += ': ' + error.message;
            } else if (error.toString) {
                errorMessage += ': ' + error.toString();
            }
            contentDiv.innerHTML = `<div class="text-center text-error">${errorMessage}</div>`;
        }
    },

    async renderFavoritesPage() {
        this.renderMainApp();
        const contentDiv = document.getElementById('content');

        try {
            const response = await this.api.get('/favorites');
            const favorites = response.success ? response.favorites : [];

            const favoritesHtml = `
                <div class="space-y-8">
                    <section>
                        <h2 class="text-2xl font-bold mb-4">My Favorites</h2>
                        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            ${favorites.length > 0 ? favorites.map(video => `
                                <div class="group relative rounded-xl border border-gray-800 bg-[#0f172a]/50 p-2 hover:bg-[#1e293b]/50 transition-all duration-300 hover:shadow-2xl hover:shadow-teal-900/20 hover:-translate-y-1 cursor-pointer flex flex-col h-full" data-video-id="${video.id}">
                                    <div class="relative overflow-hidden rounded-lg aspect-video">
                                        <img loading="lazy" src="${video.thumbnailUrl}" alt="${this.escapeHtml(video.title)}" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" onerror="this.src='https://images.unsplash.com/photo-1616469829581-73993eb86b02?q=80&w=800&auto=format&fit=crop'">
                                        <div class="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
                                        <div class="absolute top-2 right-2 text-rose-500 bg-black/60 rounded-full p-1.5 backdrop-blur-sm"><i class="fas fa-heart text-xs"></i></div>
                                        <div class="absolute bottom-2 right-2 bg-black/80 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-md font-medium"><i class="fas fa-play text-[10px] mr-1"></i> Play</div>
                                    </div>
                                    <div class="p-3 flex-grow flex flex-col justify-between">
                                        <h3 class="font-semibold text-gray-100 line-clamp-2 leading-snug group-hover:text-teal-400 transition-colors">${this.escapeHtml(video.title)}</h3>
                                        <div class="flex items-center justify-between mt-2">
                                            <p class="text-xs text-gray-400 flex items-center gap-1"><i class="fas fa-folder"></i> ${video.categoryName}</p>
                                            <p class="text-xs text-gray-400"><i class="fas fa-eye"></i> ${video.views || 0}</p>
                                        </div>
                                    </div>
                                </div>
                            `).join('') : '<div class="text-center text-muted col-span-full py-12 border border-dashed border-gray-800 rounded-xl bg-gray-900/30">You don\'t have any videos in your favorites yet</div>'}
                        </div>
                    </section>
                </div>
            `;

            contentDiv.innerHTML = favoritesHtml;

            document.querySelectorAll('.video-card').forEach(card => {
                card.addEventListener('click', (e) => {
                    this.navigateTo('video', e.currentTarget.dataset.videoId);
                });
            });
        } catch (error) {
            console.error('Error loading favorites:', error);
            contentDiv.innerHTML = '<div class="text-center text-error">Error loading favorites</div>';
        }
    },

    async renderAdminPage() {
        this.renderMainApp();
        const contentDiv = document.getElementById('content');
        const isAdmin = this.state.currentUser?.role === 'admin';

        if (!isAdmin) {
            contentDiv.innerHTML = '<div class="text-center text-error">You do not have permission to access this page</div>';
            return;
        }

                const adminPanelHtml = `
            <div class="admin-panel border-0 bg-transparent shadow-none p-0">
                <div class="flex items-center justify-between mb-8">
                    <h2 class="text-3xl font-bold flex items-center gap-3"><i class="fas fa-cog text-primary"></i> Admin Dashboard</h2>
                </div>

                <div class="flex flex-col md:flex-row gap-8">
                    <!-- Sidebar Tabs -->
                    <div class="md:w-64 shrink-0">
                        <div class="bg-[var(--surface-dark)] border border-[var(--border-color)] rounded-xl overflow-hidden sticky top-24">
                            <div class="p-4 border-b border-[var(--border-color)]">
                                <p class="text-xs font-semibold text-secondary uppercase tracking-wider mb-2">Management</p>
                                <div class="flex flex-col space-y-1">
                                    <button class="nav-tab w-full text-left px-4 py-2.5 rounded-lg transition-colors flex items-center gap-3 ${this.state.currentAdminTab === 'users' ? 'active bg-[var(--primary-color)]/10 text-primary' : 'hover:bg-[var(--surface-light)]'}" data-tab="users">
                                        <i class="fas fa-users w-5"></i> Users
                                    </button>
                                    <button class="nav-tab w-full text-left px-4 py-2.5 rounded-lg transition-colors flex items-center gap-3 ${this.state.currentAdminTab === 'videos' ? 'active bg-[var(--primary-color)]/10 text-primary' : 'hover:bg-[var(--surface-light)]'}" data-tab="videos">
                                        <i class="fas fa-video w-5"></i> Videos
                                    </button>
                                    <button class="nav-tab w-full text-left px-4 py-2.5 rounded-lg transition-colors flex items-center gap-3 ${this.state.currentAdminTab === 'categories' ? 'active bg-[var(--primary-color)]/10 text-primary' : 'hover:bg-[var(--surface-light)]'}" data-tab="categories">
                                        <i class="fas fa-folder w-5"></i> Categories
                                    </button>
                                </div>
                            </div>

                            <div class="p-4 border-b border-[var(--border-color)]">
                                <p class="text-xs font-semibold text-secondary uppercase tracking-wider mb-2">Security & Access</p>
                                <div class="flex flex-col space-y-1">
                                    <button class="nav-tab w-full text-left px-4 py-2.5 rounded-lg transition-colors flex items-center gap-3 ${this.state.currentAdminTab === 'groups' ? 'active bg-[var(--primary-color)]/10 text-primary' : 'hover:bg-[var(--surface-light)]'}" data-tab="groups">
                                        <i class="fas fa-users-cog w-5"></i> Groups & Teams
                                    </button>
                                    <button class="nav-tab w-full text-left px-4 py-2.5 rounded-lg transition-colors flex items-center gap-3 ${this.state.currentAdminTab === 'permissions' ? 'active bg-[var(--primary-color)]/10 text-primary' : 'hover:bg-[var(--surface-light)]'}" data-tab="permissions">
                                        <i class="fas fa-key w-5"></i> Permissions
                                    </button>
                                    <button class="nav-tab w-full text-left px-4 py-2.5 rounded-lg transition-colors flex items-center gap-3 ${this.state.currentAdminTab === 'password-policy' ? 'active bg-[var(--primary-color)]/10 text-primary' : 'hover:bg-[var(--surface-light)]'}" data-tab="password-policy">
                                        <i class="fas fa-shield-alt w-5"></i> Password Policy
                                    </button>
                                </div>
                            </div>

                            <div class="p-4 border-b border-[var(--border-color)]">
                                <p class="text-xs font-semibold text-secondary uppercase tracking-wider mb-2">System</p>
                                <div class="flex flex-col space-y-1">
                                    <button class="nav-tab w-full text-left px-4 py-2.5 rounded-lg transition-colors flex items-center gap-3 ${this.state.currentAdminTab === 'reports' ? 'active bg-[var(--primary-color)]/10 text-primary' : 'hover:bg-[var(--surface-light)]'}" data-tab="reports">
                                        <i class="fas fa-flag w-5"></i> Reports & Logs
                                    </button>
                                    <button class="nav-tab w-full text-left px-4 py-2.5 rounded-lg transition-colors flex items-center gap-3 ${this.state.currentAdminTab === 'report-reasons' ? 'active bg-[var(--primary-color)]/10 text-primary' : 'hover:bg-[var(--surface-light)]'}" data-tab="report-reasons">
                                        <i class="fas fa-list w-5"></i> Report Reasons
                                    </button>
                                    <button class="nav-tab w-full text-left px-4 py-2.5 rounded-lg transition-colors flex items-center gap-3 ${this.state.currentAdminTab === 'ai-features' ? 'active bg-[var(--primary-color)]/10 text-primary' : 'hover:bg-[var(--surface-light)]'}" data-tab="ai-features">
                                        <i class="fas fa-robot w-5"></i> AI Features
                                    </button>
                                    <button class="nav-tab w-full text-left px-4 py-2.5 rounded-lg transition-colors flex items-center gap-3 ${this.state.currentAdminTab === 'video-compression' ? 'active bg-[var(--primary-color)]/10 text-primary' : 'hover:bg-[var(--surface-light)]'}" data-tab="video-compression">
                                        <i class="fas fa-compress w-5"></i> Video Compression
                                    </button>
                                    <button class="nav-tab w-full text-left px-4 py-2.5 rounded-lg transition-colors flex items-center gap-3 ${this.state.currentAdminTab === 'system-health' ? 'active bg-[var(--primary-color)]/10 text-primary' : 'hover:bg-[var(--surface-light)]'}" data-tab="system-health">
                                        <i class="fas fa-heartbeat w-5"></i> System Health
                                    </button>
                                    <button class="nav-tab w-full text-left px-4 py-2.5 rounded-lg transition-colors flex items-center gap-3 ${this.state.currentAdminTab === 'backup-system' ? 'active bg-[var(--primary-color)]/10 text-primary' : 'hover:bg-[var(--surface-light)]'}" data-tab="backup-system">
                                        <i class="fas fa-save w-5"></i> Backup System
                                    </button>
                                </div>
                            </div>

                            <div class="p-4">
                                <button class="nav-tab w-full text-left px-4 py-2.5 rounded-lg transition-colors flex items-center gap-3 ${this.state.currentAdminTab === 'settings' ? 'active bg-[var(--primary-color)]/10 text-primary' : 'hover:bg-[var(--surface-light)]'}" data-tab="settings">
                                    <i class="fas fa-sliders-h w-5"></i> Site Settings
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Content Area -->
                    <div class="flex-1">
                        <div id="admin-content" class="bg-[var(--surface-dark)] border border-[var(--border-color)] rounded-xl p-6 min-h-[500px]"></div>
                    </div>
                </div>
            </div>
        `;

        contentDiv.innerHTML = adminPanelHtml;

        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.state.currentAdminTab = e.target.dataset.tab;
                this.renderAdminPage();
            });
        });

        const adminModules = new AdminModules(this);
        adminModules.renderModule(this.state.currentAdminTab);
    },

    async handleLogin(event) {
        event.preventDefault();
        const formData = new FormData(event.target);
        const username = formData.get('username');
        const password = formData.get('password');

        const loginMessage = document.getElementById('login-message');
        loginMessage.classList.add('hidden');

        try {
            this.showLoading(true);
            const response = await this.api.post('/auth/login', { username, password });

            if (response.success) {
                localStorage.setItem('authToken', response.token);
                this.state.currentUser = response.user;
                await this.loadAllVideos();
                this.render();
                this.showToast('Login successful!', 'success');
            }
        } catch (error) {
            loginMessage.textContent = error.message;
            loginMessage.classList.remove('hidden');
        } finally {
            this.showLoading(false);
        }
    },

    async handleLogout() {
        try {
            await this.api.post('/auth/logout');
        } catch (error) {
            console.error('Logout error:', error);
        }

        localStorage.removeItem('authToken');
        this.state.currentUser = null;
        this.state.currentPage = 'home';
        this.render();
        this.showToast('Logged out successfully', 'info');
    },

    async handleSearch(event) {
        const query = event.target.value.toLowerCase().trim();
        if (query.length > 2) {
            try {
                const response = await this.api.get(`/videos/search?q=${encodeURIComponent(query)}`);
                if (response.success) {
                    this.renderHomePage(response.videos);
                }
            } catch (error) {
                console.error('Search error:', error);
            }
        } else if (query.length === 0) {
            this.renderHomePage(null);
        }
    },

    async handleFavorite(event) {
        const videoId = event.currentTarget.dataset.id;
        const button = event.currentTarget;

        try {
            const isFavorited = button.classList.contains('btn-danger');

            if (isFavorited) {
                await this.api.delete(`/favorites/${videoId}`);
                button.classList.remove('btn-danger');
                button.classList.add('btn-secondary');
                this.showToast('Removed from favorites', 'info');
            } else {
                await this.api.post(`/favorites/${videoId}`);
                button.classList.remove('btn-secondary');
                button.classList.add('btn-danger');
                this.showToast('Added to favorites', 'success');
            }
        } catch (error) {
            console.error('Favorite error:', error);
            this.showToast('Error updating favorites', 'error');
        }
    },

    async handleReport(event) {
        const videoId = event.currentTarget.dataset.id;
        this.showReportModal(videoId);
    },

    async handlePostComment(event) {
        event.preventDefault();
        const text = document.getElementById('comment-text').value.trim();

        if (!text) return;

        try {
            await this.api.post('/comments', {
                videoId: this.state.currentVideoId,
                text
            });

            document.getElementById('comment-text').value = '';
            this.loadComments(this.state.currentVideoId);
            this.showToast('Comment posted successfully', 'success');
        } catch (error) {
            console.error('Comment error:', error);
            this.showToast('Error posting comment', 'error');
        }
    },

    getVideoEmbed(url) {
        // Handle empty or invalid URLs
        if (!url || typeof url !== 'string') {
            return '<div class="text-center text-error">No valid video URL provided</div>';
        }

        // Trim whitespace
        url = url.trim();

        // Check if URL is empty after trimming
        if (!url) {
            return '<div class="text-center text-error">No video URL provided</div>';
        }

        try {
            if (url.includes('youtube.com/watch')) {
                const parsedUrl = new URL(url);
                const videoId = parsedUrl.searchParams.get("v");
                if (!videoId) {
                    throw new Error('Invalid YouTube URL - missing video ID');
                }
                return `<iframe class="absolute top-0 left-0 w-full h-full" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
            } else if (url.includes('youtu.be/')) {
                // Handle YouTube short URLs
                const videoId = url.split('/').pop().split('?')[0];
                if (!videoId) {
                    throw new Error('Invalid YouTube short URL');
                }
                return `<iframe class="absolute top-0 left-0 w-full h-full" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
            } else if (url.includes('drive.google.com/file/d/')) {
                // Handle Google Drive URLs
                const videoId = url.split('/d/')[1].split('/')[0];
                if (!videoId) {
                    throw new Error('Invalid Google Drive URL');
                }
                return `<iframe class="absolute top-0 left-0 w-full h-full" src="https://drive.google.com/file/d/${videoId}/preview" frameborder="0" allowfullscreen></iframe>`;
            } else {
                // For other URLs, try to use them directly as video sources
                // Add additional validation for the URL
                try {
                    new URL(url); // This will throw if URL is invalid
                    return `<video class="absolute top-0 left-0 w-full h-full" controls><source src="${url}" type="video/mp4">Your browser does not support the video tag.</video>`;
                } catch (urlError) {
                    throw new Error('Invalid video URL format');
                }
            }
        } catch (error) {
            console.error('Error processing video URL:', error);
            return `<div class="text-center text-error">Error processing video: ${error.message}</div>`;
        }
    },

    skipVideo(seconds) {
        const video = document.querySelector('video');
        if (video) {
            video.currentTime += seconds;
            this.showToast(`Skipped ${seconds > 0 ? 'forward' : 'backward'} ${Math.abs(seconds)} seconds`, 'info');
        } else {
            this.showToast('Video controls not available for embedded content', 'warning');
        }
    },

    showLoading(show) {
        const overlay = this.elements.loadingOverlay;
        if (show) {
            overlay.classList.remove('hidden');
        } else {
            overlay.classList.add('hidden');
        }
    },

    showToast(message, type = 'info', duration = 3000) {
        const toast = document.createElement('div');
        toast.className = `toast-message toast-${type}`;
        toast.textContent = message;

        this.elements.toastContainer.appendChild(toast);

        setTimeout(() => toast.classList.add('show'), 10);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, duration);
    },

    showModal(content) {
        this.elements.modalContainer.innerHTML = content;
        this.elements.modalContainer.classList.remove('hidden');
    },

    hideModal() {
        this.elements.modalContainer.classList.add('hidden');
        this.elements.modalContainer.innerHTML = '';
    },

    showConfirmationModal(message, onConfirm) {
        const modalHtml = `
            <div class="modal-content">
                <p class="text-center mb-6">${message}</p>
                <div class="modal-footer">
                    <button id="modal-cancel-btn" class="btn btn-secondary">Cancel</button>
                    <button id="modal-confirm-btn" class="btn btn-danger">Confirm</button>
                </div>
            </div>
        `;

        this.showModal(modalHtml);

        document.getElementById('modal-confirm-btn').onclick = () => {
            onConfirm();
            this.hideModal();
        };
        document.getElementById('modal-cancel-btn').onclick = () => this.hideModal();
    },

    async showReportModal(videoId) {
        try {
            // Load available report reasons
            const response = await this.api.get('/report-reasons');
            const reasons = response.success ? response.reasons : [];

            const modalHtml = `
                <div class="modal-content">
                    <h3 class="modal-title">Report Video</h3>
                    <form id="report-form">
                        <div class="form-group">
                            <label for="report-reason" class="form-label">Reason for reporting:</label>
                            <select id="report-reason" class="form-select" required>
                                <option value="">Select a reason</option>
                                ${reasons.map(reason => `
                                    <option value="${reason.reason}">${reason.reason}</option>
                                `).join('')}
                            </select>
                        </div>
                        <div class="form-group hidden" id="custom-reason-group">
                            <label for="custom-reason-text" class="form-label">Please specify:</label>
                            <textarea id="custom-reason-text" class="form-textarea" rows="3" placeholder="Please describe the issue..."></textarea>
                        </div>
                        <div class="modal-footer">
                            <button type="button" id="modal-cancel-btn" class="btn btn-secondary">Cancel</button>
                            <button type="submit" class="btn btn-danger">Submit Report</button>
                        </div>
                    </form>
                </div>
            `;

            this.showModal(modalHtml);

            document.getElementById('report-reason').addEventListener('change', (e) => {
                const customGroup = document.getElementById('custom-reason-group');
                if (e.target.value === 'Other') {
                    customGroup.classList.remove('hidden');
                    document.getElementById('custom-reason-text').required = true;
                } else {
                    customGroup.classList.add('hidden');
                    document.getElementById('custom-reason-text').required = false;
                }
            });

            document.getElementById('report-form').addEventListener('submit', async (e) => {
                e.preventDefault();
                const reason = document.getElementById('report-reason').value;
                const customReason = document.getElementById('custom-reason-text').value;

                try {
                    await this.api.post('/reports', {
                        videoId,
                        reason,
                        customReason: reason === 'Other' ? customReason : null
                    });
                    this.hideModal();
                    this.showToast('Report submitted successfully', 'success');
                } catch (error) {
                    console.error('Report error:', error);
                    this.showToast('Error submitting report', 'error');
                }
            });

            document.getElementById('modal-cancel-btn').onclick = () => this.hideModal();
        } catch (error) {
            console.error('Error loading report reasons:', error);
            this.showToast('Error loading report form', 'error');
        }
    },

    setupEventListeners() {

        this.elements.modalContainer.addEventListener('click', (e) => {
            if (e.target === this.elements.modalContainer) {
                this.hideModal();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideModal();
            }
        });
    },

    async loadComments(videoId) {
        try {
            const response = await this.api.get(`/comments/video/${videoId}`);
            const comments = response.success ? response.comments : [];
            const commentsList = document.getElementById('comments-list');

            if (comments.length === 0) {
                commentsList.innerHTML = '<p class="text-center text-muted">No comments yet</p>';
                return;
            }

            const commentsHtml = comments.map(comment => `
                <div class="comment-item">
                    <div class="comment-header">
                        <span class="comment-author">${this.escapeHtml(comment.userId)}</span>
                        <span class="comment-date">${new Date(comment.created_at).toLocaleDateString()}</span>
                    </div>
                    <p class="comment-text">${this.escapeHtml(comment.text)}</p>
                </div>
            `).join('');

            commentsList.innerHTML = commentsHtml;
        } catch (error) {
            console.error('Error loading comments:', error);
        }
    }
});

// Initialize the application when the DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        App.init();
    });
} else {
    App.init();
}