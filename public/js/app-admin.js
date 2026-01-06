// User Authentication & Admin Logic

function checkAuth() {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (token && userStr) {
        currentUser = JSON.parse(userStr);
        document.getElementById('loginBtn').style.display = 'none';
        document.getElementById('userInfo').style.display = 'block';
        document.getElementById('userName').textContent = currentUser.username;

        if (currentUser.role === 'admin') {
            document.getElementById('adminPanel').style.display = 'block';
            loadAdminVideos();
        }
    }
}

async function handleLogin(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            closeModal('loginModal');
            window.location.reload();
        } else {
            alert('Login failed');
        }
    } catch (error) {
        console.error('Login error:', error);
    }
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.reload();
}

// Admin Functions
async function loadAdminVideos() {
    // Reuse the loadVideos logic but render differently if needed
    // For simplicity, we just list them in the admin panel
    try {
        const response = await fetch(`${API_URL}/videos`); // Get all
        const videos = await response.json();
        const container = document.getElementById('adminVideoList');
        container.innerHTML = '<h3>Manage Videos</h3>';

        const list = document.createElement('ul');
        videos.forEach(video => {
            const item = document.createElement('li');
            item.innerHTML = `
                ${video.title}
                <button onclick="deleteVideo(${video.id})" style="background: red; font-size: 0.8rem; padding: 2px 5px;">Delete</button>
            `;
            list.appendChild(item);
        });
        container.appendChild(list);
    } catch (error) {
        console.error('Error loading admin videos:', error);
    }
}

async function handleUpload(event) {
    event.preventDefault();
    const formData = new FormData();
    formData.append('title', document.getElementById('videoTitle').value);
    formData.append('description', document.getElementById('videoDesc').value);
    formData.append('categoryId', document.getElementById('videoCategory').value);
    formData.append('isFeatured', document.getElementById('isFeatured').checked);

    const videoFile = document.getElementById('videoFile').files[0];
    const thumbnailFile = document.getElementById('thumbnailFile').files[0];

    if (videoFile) formData.append('video', videoFile);
    if (thumbnailFile) formData.append('thumbnail', thumbnailFile);

    try {
        const response = await fetch(`${API_URL}/videos`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: formData
        });

        if (response.ok) {
            alert('Upload successful');
            closeModal('uploadModal');
            loadVideos();
            loadAdminVideos();
        } else {
            const err = await response.json();
            alert('Upload failed: ' + err.error);
        }
    } catch (error) {
        console.error('Upload error:', error);
    }
}

async function deleteVideo(id) {
    if (!confirm('Are you sure?')) return;

    try {
        const response = await fetch(`${API_URL}/videos/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (response.ok) {
            loadVideos();
            loadAdminVideos();
        }
    } catch (error) {
        console.error('Delete error:', error);
    }
}
