// UI Helper Functions
function showLoginModal() {
    document.getElementById('loginModal').style.display = 'block';
}

function showUploadModal() {
    document.getElementById('uploadModal').style.display = 'block';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Close modal when clicking outside
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
}
