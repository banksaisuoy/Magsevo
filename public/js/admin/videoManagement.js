// VisionHub - Video Management Module
// This file contains video management functionality for the admin panel

class VideoManagement {
    constructor(app) {
        this.app = app;
    }

    async render() {
        const adminContent = document.getElementById('admin-content');
        
        const videos = this.app.state.allVideos;
        
        const tableHtml = `
            <div class="flex justify-end mb-4">
                <button id="add-video-btn" class="btn btn-primary">Add New Video</button>
            </div>
            <div class="table-container">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Video</th>
                            <th>Category</th>
                            <th>Views</th>
                            <th>Status</th>
                            <th class="text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${videos.map(video => `
                            <tr>
                                <td>
                                    <div class="flex items-center space-x-3">
                                        <img class="video-thumbnail" src="${video.thumbnailUrl}" alt="${video.title}">
                                        <span class="font-medium">${video.title}</span>
                                    </div>
                                </td>
                                <td>${video.categoryName}</td>
                                <td>${video.views}</td>
                                <td>
                                    <span class="badge ${video.isFeatured ? 'badge-featured' : 'badge-regular'}">
                                        ${video.isFeatured ? 'Featured' : 'Regular'}
                                    </span>
                                </td>
                                <td class="text-right">
                                    <div class="action-buttons">
                                        <button class="btn btn-sm btn-secondary edit-video-btn" data-id="${video.id}">Edit</button>
                                        <button class="btn btn-sm btn-danger delete-video-btn" data-id="${video.id}">Delete</button>
                                    </div>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
        
        adminContent.innerHTML = tableHtml;
        
        document.getElementById('add-video-btn').addEventListener('click', () => this.showVideoForm());
        document.querySelectorAll('.edit-video-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleEditVideo(e));
        });
        document.querySelectorAll('.delete-video-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleDeleteVideo(e));
        });
    }

    async handleEditVideo(event) {
        const videoId = event.currentTarget.dataset.id;
        const video = this.app.state.allVideos.find(v => v.id == videoId);
        if (video) {
            this.showVideoForm(video);
        }
    }

    async handleDeleteVideo(event) {
        const videoId = event.currentTarget.dataset.id;
        
        this.app.showConfirmationModal(
            'Are you sure you want to delete this video?',
            async () => {
                try {
                    await this.app.api.delete(`/videos/${videoId}`);
                    this.app.showToast('Video deleted successfully', 'success');
                    await this.app.loadAllVideos();
                    this.render();
                } catch (error) {
                    console.error('Error deleting video:', error);
                    this.app.showToast('Error deleting video', 'error');
                }
            }
        );
    }

    async showVideoForm(video = null) {
        try {
            const response = await this.app.api.get('/categories');
            const categories = response.success ? response.categories : [];
            
            const formTitle = video ? 'Edit Video' : 'Add New Video';
            const modalHtml = `
                <div class="modal-content" style="max-width: 40rem;">
                    <h3 class="modal-title">${formTitle}</h3>
                    <form id="video-form" class="space-y-4">
                        <input type="hidden" id="video-id" value="${video ? video.id : ''}">
                        
                        <!-- Video Upload Method Toggle -->
                        <div class="form-group">
                            <label class="form-label">Video Source</label>
                            <div class="flex gap-4">
                                <label class="flex items-center">
                                    <input type="radio" name="video-source" value="url" ${!video || video.videoUrl.startsWith('http') ? 'checked' : ''} class="form-radio">
                                    <span class="ml-2">Video URL</span>
                                </label>
                                <label class="flex items-center">
                                    <input type="radio" name="video-source" value="upload" ${video && !video.videoUrl.startsWith('http') ? 'checked' : ''} class="form-radio">
                                    <span class="ml-2">Upload Video File</span>
                                </label>
                            </div>
                        </div>

                        <div class="form-group">
                            <label for="form-title" class="form-label">Video Title</label>
                            <input type="text" id="form-title" value="${video ? video.title : ''}" class="form-input" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="form-description" class="form-label">Description</label>
                            <textarea id="form-description" class="form-textarea" rows="3" required>${video ? video.description : ''}</textarea>
                        </div>
                        
                        <!-- Video URL Section -->
                        <div class="form-group" id="video-url-section">
                            <label for="form-video-url" class="form-label">Video URL</label>
                            <input type="url" id="form-video-url" value="${video ? video.videoUrl : ''}" class="form-input">
                            <small class="text-muted">Supports YouTube, Google Drive, OneDrive, SharePoint, or direct video URLs</small>
                        </div>
                        
                        <!-- Video Upload Section -->
                        <div class="form-group hidden" id="video-upload-section">
                            <label for="form-video-file" class="form-label">Upload Video File</label>
                            <input type="file" id="form-video-file" accept="video/*" class="form-input">
                            <small class="text-muted">Supported formats: MP4, WebM, AVI, MOV (No size limit)</small>
                            <div id="video-upload-progress" class="hidden">
                                <div class="progress-bar">
                                    <div class="progress-fill" style="width: 0%"></div>
                                </div>
                                <span class="progress-text">Uploading...</span>
                            </div>
                        </div>
                        
                        <!-- Thumbnail Upload Method Toggle -->
                        <div class="form-group">
                            <label class="form-label">Thumbnail Source</label>
                            <div class="flex gap-4">
                                <label class="flex items-center">
                                    <input type="radio" name="thumbnail-source" value="url" ${!video || video.thumbnailUrl.startsWith('http') ? 'checked' : ''} class="form-radio">
                                    <span class="ml-2">Thumbnail URL</span>
                                </label>
                                <label class="flex items-center">
                                    <input type="radio" name="thumbnail-source" value="upload" ${video && !video.thumbnailUrl.startsWith('http') ? 'checked' : ''} class="form-radio">
                                    <span class="ml-2">Upload Thumbnail</span>
                                </label>
                            </div>
                        </div>
                        
                        <!-- Thumbnail URL Section -->
                        <div class="form-group" id="thumbnail-url-section">
                            <label for="form-thumbnail-url" class="form-label">Thumbnail URL</label>
                            <input type="url" id="form-thumbnail-url" value="${video ? video.thumbnailUrl : ''}" class="form-input">
                        </div>
                        
                        <!-- Thumbnail Upload Section -->
                        <div class="form-group hidden" id="thumbnail-upload-section">
                            <label for="form-thumbnail-file" class="form-label">Upload Thumbnail</label>
                            <input type="file" id="form-thumbnail-file" accept="image/*" class="form-input">
                            <small class="text-muted">Supported formats: JPG, PNG, GIF, WebP</small>
                            <div id="thumbnail-upload-progress" class="hidden">
                                <div class="progress-bar">
                                    <div class="progress-fill" style="width: 0%"></div>
                                </div>
                                <span class="progress-text">Uploading...</span>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label for="form-category" class="form-label">Category</label>
                            <select id="form-category" class="form-select" required>
                                ${categories.map(cat => 
                                    `<option value="${cat.id}" ${video && video.categoryId == cat.id ? 'selected' : ''}>${cat.name}</option>`
                                ).join('')}
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label class="flex items-center">
                                <input type="checkbox" id="form-is-featured" ${video && video.isFeatured ? 'checked' : ''} class="form-checkbox">
                                <span class="form-label">Featured Video</span>
                            </label>
                        </div>
                        
                        <div class="modal-footer">
                            <button type="button" id="cancel-btn" class="btn btn-secondary">Cancel</button>
                            <button type="submit" class="btn btn-primary">Save</button>
                        </div>
                    </form>
                </div>
            `;
            
            this.app.showModal(modalHtml);
            
            // Setup form toggles and event listeners
            this.setupVideoFormHandlers(video);
            
            document.getElementById('video-form').addEventListener('submit', (e) => this.handleVideoFormSubmit(e, video));
            document.getElementById('cancel-btn').onclick = () => this.app.hideModal();
        } catch (error) {
            console.error('Error loading categories:', error);
            this.app.showToast('Error loading form data', 'error');
        }
    }

    setupVideoFormHandlers(video) {
        // Video source toggle
        const videoSourceRadios = document.querySelectorAll('input[name="video-source"]');
        const videoUrlSection = document.getElementById('video-url-section');
        const videoUploadSection = document.getElementById('video-upload-section');
        
        // Thumbnail source toggle
        const thumbnailSourceRadios = document.querySelectorAll('input[name="thumbnail-source"]');
        const thumbnailUrlSection = document.getElementById('thumbnail-url-section');
        const thumbnailUploadSection = document.getElementById('thumbnail-upload-section');
        
        const toggleVideoSource = () => {
            const selectedSource = document.querySelector('input[name="video-source"]:checked').value;
            if (selectedSource === 'url') {
                videoUrlSection.classList.remove('hidden');
                videoUploadSection.classList.add('hidden');
                document.getElementById('form-video-url').required = true;
                document.getElementById('form-video-file').required = false;
            } else {
                videoUrlSection.classList.add('hidden');
                videoUploadSection.classList.remove('hidden');
                document.getElementById('form-video-url').required = false;
                document.getElementById('form-video-file').required = !video; // Required only for new videos
            }
        };
        
        const toggleThumbnailSource = () => {
            const selectedSource = document.querySelector('input[name="thumbnail-source"]:checked').value;
            if (selectedSource === 'url') {
                thumbnailUrlSection.classList.remove('hidden');
                thumbnailUploadSection.classList.add('hidden');
                document.getElementById('form-thumbnail-url').required = true;
                document.getElementById('form-thumbnail-file').required = false;
            } else {
                thumbnailUrlSection.classList.add('hidden');
                thumbnailUploadSection.classList.remove('hidden');
                document.getElementById('form-thumbnail-url').required = false;
                document.getElementById('form-thumbnail-file').required = !video; // Required only for new videos
            }
        };
        
        // Initial toggle
        toggleVideoSource();
        toggleThumbnailSource();
        
        // Event listeners
        videoSourceRadios.forEach(radio => {
            radio.addEventListener('change', toggleVideoSource);
        });
        
        thumbnailSourceRadios.forEach(radio => {
            radio.addEventListener('change', toggleThumbnailSource);
        });
    }

    async handleVideoFormSubmit(event, video) {
        event.preventDefault();
        
        try {
            const videoId = document.getElementById('video-id').value;
            const title = document.getElementById('form-title').value;
            const description = document.getElementById('form-description').value;
            const categoryId = document.getElementById('form-category').value;
            const isFeatured = document.getElementById('form-is-featured').checked;
            
            let videoUrl = '';
            let thumbnailUrl = '';
            
            // Handle video source
            const videoSource = document.querySelector('input[name="video-source"]:checked').value;
            if (videoSource === 'url') {
                videoUrl = document.getElementById('form-video-url').value;
            } else {
                const videoFile = document.getElementById('form-video-file').files[0];
                if (videoFile || video) {
                    if (videoFile) {
                        // Upload video file
                        const uploadResult = await this.uploadFiles(videoFile, null);
                        if (uploadResult.success) {
                            videoUrl = uploadResult.videoUrl;
                        } else {
                            throw new Error('Video upload failed');
                        }
                    } else {
                        videoUrl = video.videoUrl; // Keep existing video
                    }
                }
            }
            
            // Handle thumbnail source
            const thumbnailSource = document.querySelector('input[name="thumbnail-source"]:checked').value;
            if (thumbnailSource === 'url') {
                thumbnailUrl = document.getElementById('form-thumbnail-url').value;
            } else {
                const thumbnailFile = document.getElementById('form-thumbnail-file').files[0];
                if (thumbnailFile || video) {
                    if (thumbnailFile) {
                        // Upload thumbnail file
                        const uploadResult = await this.uploadFiles(null, thumbnailFile);
                        if (uploadResult.success) {
                            thumbnailUrl = uploadResult.thumbnailUrl;
                        } else {
                            throw new Error('Thumbnail upload failed');
                        }
                    } else {
                        thumbnailUrl = video.thumbnailUrl; // Keep existing thumbnail
                    }
                }
            }
            
            const videoData = { title, description, thumbnailUrl, videoUrl, categoryId, isFeatured };
            
            if (video) {
                await this.app.api.put(`/videos/${videoId}`, videoData);
                this.app.showToast('Video updated successfully', 'success');
            } else {
                await this.app.api.post('/videos', videoData);
                this.app.showToast('Video created successfully', 'success');
            }
            
            this.app.hideModal();
            await this.app.loadAllVideos();
            this.render();
        } catch (error) {
            console.error('Error saving video:', error);
            this.app.showToast(`Error saving video: ${error.message}`, 'error');
        }
    }

    async uploadFiles(videoFile, thumbnailFile) {
        const formData = new FormData();
        
        if (videoFile) {
            formData.append('video', videoFile);
        }
        if (thumbnailFile) {
            formData.append('thumbnail', thumbnailFile);
        }
        
        try {
            // Show progress for file uploads
            if (videoFile) {
                document.getElementById('video-upload-progress').classList.remove('hidden');
            }
            if (thumbnailFile) {
                document.getElementById('thumbnail-upload-progress').classList.remove('hidden');
            }
            
            const response = await fetch('/api/uploads/video', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: formData
            });
            
            if (!response.ok) {
                throw new Error(`Upload failed: ${response.statusText}`);
            }
            
            const result = await response.json();
            
            // Hide progress indicators
            if (videoFile) {
                document.getElementById('video-upload-progress').classList.add('hidden');
            }
            if (thumbnailFile) {
                document.getElementById('thumbnail-upload-progress').classList.add('hidden');
            }
            
            return result;
        } catch (error) {
            // Hide progress indicators on error
            document.getElementById('video-upload-progress').classList.add('hidden');
            document.getElementById('thumbnail-upload-progress').classList.add('hidden');
            throw error;
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VideoManagement;
}