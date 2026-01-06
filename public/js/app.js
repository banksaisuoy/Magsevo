// Global variables
let currentCategory = 'All';
let currentUser = null;
const API_URL = '/api';

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadCategories();
    loadVideos();
    loadFeaturedVideos();
});

// Load Categories
async function loadCategories() {
    try {
        const response = await fetch(`${API_URL}/categories`);
        const categories = await response.json();
        const list = document.getElementById('categoryList');
        // Clear existing except "All"
        list.innerHTML = '<li class="active" onclick="filterByCategory(\'All\')">All</li>';

        const select = document.getElementById('videoCategory');
        if (select) select.innerHTML = ''; // Clear select for upload modal

        categories.forEach(cat => {
            // Nav Item
            const li = document.createElement('li');
            li.textContent = cat.name;
            li.onclick = () => filterByCategory(cat.name);
            list.appendChild(li);

            // Select Option
            if (select) {
                const option = document.createElement('option');
                option.value = cat.id;
                option.textContent = cat.name;
                select.appendChild(option);
            }
        });
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

// Load Videos
async function loadVideos(search = '') {
    try {
        let url = `${API_URL}/videos?`;
        if (currentCategory !== 'All') url += `category=${encodeURIComponent(currentCategory)}&`;
        if (search) url += `search=${encodeURIComponent(search)}`;

        const response = await fetch(url);
        const videos = await response.json();
        renderVideos(videos, 'videoGrid');
    } catch (error) {
        console.error('Error loading videos:', error);
    }
}

// Load Featured Videos
async function loadFeaturedVideos() {
    try {
        const response = await fetch(`${API_URL}/videos/featured`);
        const videos = await response.json();
        renderVideos(videos, 'featuredGrid');
    } catch (error) {
        console.error('Error loading featured videos:', error);
    }
}

// Render Video Grid
function renderVideos(videos, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';

    if (videos.length === 0) {
        container.innerHTML = '<p>No videos found.</p>';
        return;
    }

    videos.forEach(video => {
        const card = document.createElement('div');
        card.className = 'video-card';
        card.onclick = () => playVideo(video);

        card.innerHTML = `
            <img src="${video.thumbnailUrl || 'https://via.placeholder.com/300x169'}" class="video-thumbnail" alt="${video.title}">
            <div class="video-info">
                <span class="video-title">${video.title}</span>
                <div class="video-meta">
                    <span><i class="fas fa-eye"></i> ${video.views}</span>
                    <span>${new Date(video.created_at).toLocaleDateString()}</span>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

function filterByCategory(category) {
    currentCategory = category;
    // Update active state
    document.querySelectorAll('#categoryList li').forEach(li => {
        li.classList.toggle('active', li.textContent === category);
    });
    loadVideos();
}

function searchVideos() {
    const query = document.getElementById('searchInput').value;
    loadVideos(query);
}

function playVideo(video) {
    // Simple alert for now, in real app would open a player modal or page
    window.open(video.videoUrl, '_blank');
    // Increment view count
    fetch(`${API_URL}/videos/${video.id}/view`, { method: 'POST' });
}
