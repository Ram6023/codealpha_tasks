// Instagram Clone JavaScript
const API_URL = 'http://localhost:3000/api';

// State
let currentUser = null;
let currentPage = 'home';
let posts = [];
let stories = [];
let pollingInterval = null;

// DOM Elements
const authScreen = document.getElementById('authScreen');
const mainApp = document.getElementById('mainApp');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const switchLink = document.getElementById('switchLink');
const switchText = document.getElementById('switchText');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    setupEventListeners();
});

// Setup Event Listeners
function setupEventListeners() {
    // Auth forms
    loginForm.addEventListener('submit', handleLogin);
    registerForm.addEventListener('submit', handleRegister);

    // Switch between login/register
    switchLink.addEventListener('click', (e) => {
        e.preventDefault();
        toggleAuthForms();
    });

    // Navigation
    document.querySelectorAll('.nav-icon[data-page]').forEach(icon => {
        icon.addEventListener('click', (e) => {
            e.preventDefault();
            const page = icon.dataset.page;
            navigateToPage(page);
        });
    });

    // Create post button
    document.getElementById('createPostBtn').addEventListener('click', (e) => {
        e.preventDefault();
        openCreatePostModal();
    });

    // Create post modal
    document.getElementById('closeCreateModal').addEventListener('click', closeCreatePostModal);
    document.getElementById('selectFilesBtn').addEventListener('click', () => {
        document.getElementById('fileInput').click();
    });
    document.getElementById('fileInput').addEventListener('change', handleFileSelect);
    document.getElementById('sharePostBtn').addEventListener('click', handleSharePost);

    // Search
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSearch(e.target.value);
    });

    // Sidebar Switch / Logout
    document.querySelector('.btn-switch').addEventListener('click', handleLogout);
    document.querySelector('.profile-info-header .fa-cog').addEventListener('click', handleLogout);

    // Edit Profile
    document.querySelector('.btn-edit-profile').addEventListener('click', openEditProfileModal);
}

// Handle Logout
function handleLogout() {
    localStorage.removeItem('token');
    currentUser = null;
    showToast('Logged out successfully', 'success');
    showAuthScreen();
}

// Toast Notification
function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
        <span>${message}</span>
    `;
    container.appendChild(toast);

    // Remove after 3 seconds
    setTimeout(() => {
        toast.style.animation = 'toastFadeOut 0.3s ease forwards';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Story Viewer Logic
let storyTimer = null;
function openStory(username) {
    const modal = document.getElementById('storyViewerModal');
    const progressFill = document.querySelector('.story-progress-fill');

    document.getElementById('storyViewerUsername').textContent = username;
    document.getElementById('storyViewerAvatar').textContent = username[0].toUpperCase();

    modal.classList.add('active');

    // Animate Progress
    progressFill.style.width = '0%';
    setTimeout(() => progressFill.style.width = '100%', 50);

    // Auto Close
    if (storyTimer) clearTimeout(storyTimer);
    storyTimer = setTimeout(() => {
        closeStoryViewer();
    }, 5000);
}

function closeStoryViewer() {
    const modal = document.getElementById('storyViewerModal');
    modal.classList.remove('active');
    if (storyTimer) clearTimeout(storyTimer);
}

document.getElementById('closeStoryViewer').addEventListener('click', closeStoryViewer);

// Handle Search
async function handleSearch(query) {
    if (!query.trim()) return;
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/users/search?q=${encodeURIComponent(query)}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
            const users = await response.json();
            if (users.length > 0) {
                showToast(`Found user: ${users[0].username}`, 'success');
                // Could navigate to mock profile
            } else {
                showToast('No users found', 'error');
            }
        }
    } catch (error) {
        console.error('Search error', error);
        showToast('Search failed', 'error');
    }
}

// Edit Profile Modal Logic (Reuse Create Modal or create new one? We'll use a prompt for simplicity now, or create dynamic modal)
async function openEditProfileModal() {
    const newName = prompt("Enter new Full Name:", currentUser.fullName);
    const newBio = prompt("Enter new Bio:", currentUser.bio);

    if (newName !== null && newBio !== null) {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/users/me`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ full_name: newName, bio: newBio })
            });

            if (response.ok) {
                // Update local state and UI
                currentUser.fullName = newName;
                currentUser.bio = newBio;
                updateUserProfile();
            }
        } catch (error) {
            console.error('Update profile error', error);
        }
    }
}


// Toggle Auth Forms
function toggleAuthForms() {
    const isLogin = loginForm.classList.contains('active');

    if (isLogin) {
        loginForm.classList.remove('active');
        registerForm.classList.add('active');
        switchText.innerHTML = 'Have an account? <a href="#" id="switchLink">Log in</a>';
    } else {
        registerForm.classList.remove('active');
        loginForm.classList.add('active');
        switchText.innerHTML = 'Don\'t have an account? <a href="#" id="switchLink">Sign up</a>';
    }

    // Re-attach event listener
    document.getElementById('switchLink').addEventListener('click', (e) => {
        e.preventDefault();
        toggleAuthForms();
    });
}

// Check Authentication
async function checkAuth() {
    const token = localStorage.getItem('token');
    if (token) {
        try {
            const response = await fetch(`${API_URL}/auth/me`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                currentUser = await response.json();
                showMainApp();
            } else {
                localStorage.removeItem('token');
                showAuthScreen();
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            showAuthScreen();
        }
    } else {
        showAuthScreen();
    }
}

// Handle Login
async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const errorEl = document.getElementById('loginError');

    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('token', data.token);
            currentUser = data.user;
            showMainApp();
        } else {
            showToast(data.message || 'Login failed', 'error');
        }
    } catch (error) {
        showToast('Connection error. Please try again.', 'error');
    }
}

// Handle Register
async function handleRegister(e) {
    e.preventDefault();
    const email = document.getElementById('registerEmail').value;
    const fullName = document.getElementById('registerFullName').value;
    const username = document.getElementById('registerUsername').value;
    const password = document.getElementById('registerPassword').value;
    const errorEl = document.getElementById('registerError');

    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, username, password, fullName })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('token', data.token);
            currentUser = data.user;
            showMainApp();
        } else {
            showToast(data.message || 'Registration failed', 'error');
        }
    } catch (error) {
        showToast('Connection error. Please try again.', 'error');
    }
}

// Show Auth Screen
function showAuthScreen() {
    authScreen.style.display = 'flex';
    mainApp.style.display = 'none';
    if (pollingInterval) clearInterval(pollingInterval);
}

// Show Main App
function showMainApp() {
    authScreen.style.display = 'none';
    mainApp.style.display = 'block';
    updateUserProfile();
    loadStories();
    loadPosts();
    loadSuggestions();

    // Start Polling for Real-Time updates
    startPolling();
}

// Update Badges
async function updateBadges() {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
        const response = await fetch(`${API_URL}/notifications/unread-count`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const data = await response.json();

            const msgBadge = document.getElementById('msgBadge');
            const notifBadge = document.getElementById('notifBadge');

            if (data.messages > 0) {
                msgBadge.textContent = data.messages;
                msgBadge.style.display = 'block';
            } else {
                msgBadge.style.display = 'none';
            }

            if (data.notifications > 0) {
                notifBadge.textContent = data.notifications;
                notifBadge.style.display = 'block';
            } else {
                notifBadge.style.display = 'none';
            }
        }
    } catch (error) {
        console.error('Badge update error:', error);
    }
}

// Start Polling
function startPolling() {
    if (pollingInterval) clearInterval(pollingInterval);
    updateBadges();
    pollingInterval = setInterval(() => {
        updateBadges();
        if (currentPage === 'messages') loadMessages();
        if (currentPage === 'activity') loadActivity();
    }, 5000); // Poll every 5 seconds
}


// Update User Profile
function updateUserProfile() {
    const initial = currentUser.username[0].toUpperCase();

    // Update all avatar elements
    document.querySelectorAll('#navAvatar span, #yourStoryAvatar, #sidebarAvatar span, #profileAvatar span, #createPostAvatar span').forEach(el => {
        el.textContent = initial;
    });

    // Update username elements
    document.getElementById('sidebarUsername').textContent = currentUser.username;
    document.getElementById('sidebarFullName').textContent = currentUser.fullName || currentUser.username;
    document.getElementById('currentUsername').textContent = currentUser.username;
    document.getElementById('profileUsername').textContent = currentUser.username;
    document.getElementById('profileFullName').textContent = currentUser.fullName || currentUser.username;
    document.getElementById('profileBio').textContent = currentUser.bio || 'No bio yet';
    document.getElementById('createPostUsername').textContent = currentUser.username;

    // Update stats
    document.getElementById('postsCount').textContent = currentUser.posts_count || 0;
    document.getElementById('followersCount').textContent = currentUser.followers_count || 0;
    document.getElementById('followingCount').textContent = currentUser.following_count || 0;
}

// Navigate to Page
function navigateToPage(page) {
    currentPage = page;

    // Update nav icons
    document.querySelectorAll('.nav-icon').forEach(icon => {
        icon.classList.remove('active');
    });
    document.querySelector(`.nav-icon[data-page="${page}"]`)?.classList.add('active');

    // Show page
    document.querySelectorAll('.page').forEach(p => {
        p.classList.remove('active');
    });
    document.getElementById(`${page}Page`).classList.add('active');

    // Load page-specific content
    if (page === 'explore') loadExplore();
    if (page === 'messages') loadMessages();
    if (page === 'activity') loadActivity();
    if (page === 'profile') loadProfile();
}

// Load Stories
async function loadStories() {
    const token = localStorage.getItem('token');

    try {
        const response = await fetch(`${API_URL}/users/suggestions`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const users = await response.json();
            renderStories(users);
        }
    } catch (error) {
        console.error('Load stories error:', error);
    }
}

// Render Stories
function renderStories(users) {
    const container = document.getElementById('storiesContainer');
    // Keep "Your Story"
    const yourStory = container.firstElementChild;
    container.innerHTML = '';

    // Add "Your Story" back if it existed, otherwise create it
    if (yourStory && yourStory.classList.contains('your-story')) {
        container.appendChild(yourStory);
    } else {
        const div = document.createElement('div');
        div.className = 'story-item your-story';
        div.innerHTML = `
            <div class="story-avatar">
                <div class="avatar-circle">
                    <span id="yourStoryAvatar">${currentUser.username[0].toUpperCase()}</span>
                </div>
                <div class="add-story-btn"><i class="fas fa-plus"></i></div>
            </div>
            <span class="story-username">Your Story</span>
        `;
        container.appendChild(div);
    }

    // Add others
    users.slice(0, 10).forEach(user => {
        const storyEl = document.createElement('div');
        storyEl.className = 'story-item';
        storyEl.onclick = () => openStory(user.username);
        storyEl.innerHTML = `
            <div class="story-avatar">
                <div class="avatar-circle">
                    <span>${user.username[0].toUpperCase()}</span>
                </div>
            </div>
            <span class="story-username">${user.username}</span>
        `;
        container.appendChild(storyEl);
    });
}

// Load Posts
async function loadPosts() {
    const token = localStorage.getItem('token');

    try {
        const response = await fetch(`${API_URL}/posts`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            posts = await response.json();
            renderPosts();
        }
    } catch (error) {
        console.error('Load posts error:', error);
    }
}

// Render Posts
function renderPosts() {
    const container = document.getElementById('feedContainer');
    container.innerHTML = '';

    if (posts.length === 0) {
        container.innerHTML = '<p style="text-align: center; padding: 40px; color: var(--text-secondary);">No posts yet. Follow people to see their posts!</p>';
        return;
    }

    posts.forEach(post => {
        const postEl = createPostElement(post);
        container.appendChild(postEl);
    });
}

// Create Post Element
function createPostElement(post) {
    const div = document.createElement('div');
    div.className = 'post';
    div.id = `post-${post.id}`;

    const timeAgo = getTimeAgo(new Date(post.created_at));
    const isLiked = post.user_liked;
    const initial = post.username[0].toUpperCase();
    const isOwner = currentUser && post.user_id === currentUser.id;

    div.innerHTML = `
        <div class="post-header">
            <div class="post-author">
                <div class="post-avatar">
                    <span>${initial}</span>
                </div>
                <div class="post-author-info">
                    <a href="#" class="post-username">${post.username}</a>
                    ${post.location ? `<div class="post-location">${post.location}</div>` : ''}
                </div>
            </div>
            ${isOwner ? `
            <div class="post-options" onclick="deletePost(${post.id})">
                <i class="fas fa-trash-alt" title="Delete Post" style="font-size: 16px; color: var(--error-color);"></i>
            </div>` : `
            <div class="post-options">
                <i class="fas fa-ellipsis-h"></i>
            </div>`}
        </div>
        
        ${post.image_url ? `<img src="${post.image_url}" alt="Post" class="post-image">` : ''}
        
        <div class="post-actions">
            <div class="post-actions-left">
                <button class="action-btn ${isLiked ? 'liked' : ''}" onclick="toggleLike(${post.id})">
                    <i class="${isLiked ? 'fas' : 'far'} fa-heart"></i>
                </button>
                <button class="action-btn">
                    <i class="far fa-comment"></i>
                </button>
                <button class="action-btn">
                    <i class="far fa-paper-plane"></i>
                </button>
            </div>
            <button class="action-btn">
                <i class="far fa-bookmark"></i>
            </button>
        </div>
        
        <div class="post-likes">
            ${post.likes_count || 0} likes
        </div>
        
        ${post.content ? `
        <div class="post-caption">
            <span class="post-caption-username">${post.username}</span>
            ${escapeHtml(post.content)}
        </div>
        ` : ''}
        
        ${post.comments_count > 0 ? `
        <div class="post-comments-link">
            View all ${post.comments_count} comments
        </div>
        ` : ''}
        
        <div class="post-time">${timeAgo}</div>
        
        <div class="post-add-comment">
            <input type="text" placeholder="Add a comment..." onkeypress="handleCommentKeyPress(event, ${post.id})">
            <button disabled>Post</button>
        </div>
    `;

    // Enable/disable post button based on input
    const input = div.querySelector('input');
    const button = div.querySelector('.post-add-comment button');
    input.addEventListener('input', () => {
        button.disabled = !input.value.trim();
    });

    // Add Click listener for Post Comment button
    button.addEventListener('click', async () => {
        const content = input.value.trim();
        if (!content) return;

        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${API_URL}/posts/${post.id}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ content })
            });

            if (response.ok) {
                input.value = '';
                loadPosts(); // Reload to show new comment count/comment
            }
        } catch (error) {
            console.error('Comment error:', error);
        }
    });

    return div;
}

// Delete Post
async function deletePost(postId) {
    if (!confirm('Are you sure you want to delete this post?')) return;

    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`${API_URL}/posts/${postId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            // Remove from UI immediately
            const el = document.getElementById(`post-${postId}`);
            if (el) el.remove();

            // Also refresh profile stats if on profile page
            if (currentPage === 'profile') loadProfile();
            showToast('Post deleted', 'success');
        } else {
            showToast('Failed to delete post', 'error');
        }
    } catch (error) {
        console.error('Delete post error:', error);
        showToast('Error deleting post', 'error');
    }
}


// Load Suggestions
async function loadSuggestions() {
    const token = localStorage.getItem('token');

    try {
        const response = await fetch(`${API_URL}/users/suggestions`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const users = await response.json();
            renderSuggestions(users);
        }
    } catch (error) {
        console.error('Load suggestions error:', error);
    }
}

// Render Suggestions
function renderSuggestions(users) {
    const container = document.getElementById('suggestionsContainer');
    container.innerHTML = '';

    users.slice(0, 5).forEach(user => {
        const suggestionEl = document.createElement('div');
        suggestionEl.className = 'suggestion-item';
        suggestionEl.innerHTML = `
            <div class="suggestion-avatar">
                <span>${user.username[0].toUpperCase()}</span>
            </div>
            <div class="suggestion-info">
                <h5>${user.username}</h5>
                <p>Suggested for you</p>
            </div>
            <button class="btn-follow" onclick="followUser(${user.id})">Follow</button>
        `;
        container.appendChild(suggestionEl);
    });
}

// Follow User
async function followUser(userId) {
    const token = localStorage.getItem('token');

    try {
        const response = await fetch(`${API_URL}/users/${userId}/follow`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            loadSuggestions();
            loadPosts(); // Reload posts to see new follower's content
        }
    } catch (error) {
        console.error('Follow user error:', error);
    }
}

// Load Explore
async function loadExplore() {
    const token = localStorage.getItem('token');

    try {
        const response = await fetch(`${API_URL}/posts`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const posts = await response.json();
            renderExplore(posts);
        }
    } catch (error) {
        console.error('Load explore error:', error);
    }
}

// Render Explore
function renderExplore(posts) {
    const container = document.getElementById('exploreGrid');
    container.innerHTML = '';

    // Filter posts that have images
    const imagePosts = posts.filter(p => p.image_url);
    if (imagePosts.length === 0) {
        container.innerHTML = '<p style="color:var(--text-secondary); text-align: center; grid-column: 1/-1;">No explore content yet.</p>';
        return;
    }

    imagePosts.forEach(post => {
        const exploreItem = document.createElement('div');
        exploreItem.className = 'explore-item';
        exploreItem.innerHTML = `
            <img src="${post.image_url}" alt="Post">
            <div class="explore-overlay">
                <div class="explore-stat">
                    <i class="fas fa-heart"></i>
                    <span>${post.likes_count || 0}</span>
                </div>
                <div class="explore-stat">
                    <i class="fas fa-comment"></i>
                    <span>${post.comments_count || 0}</span>
                </div>
            </div>
        `;
        container.appendChild(exploreItem);
    });
}

// Load Messages
async function loadMessages() {
    const token = localStorage.getItem('token');
    const container = document.getElementById('messagesList');

    try {
        const response = await fetch(`${API_URL}/messages/conversations`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const conversations = await response.json();

            if (conversations.length === 0) {
                container.innerHTML = '<div style="padding: 20px; text-align: center; color: var(--text-secondary);">No messages yet.</div>';
                return;
            }

            container.innerHTML = '';
            conversations.forEach(conv => {
                const msgItem = document.createElement('div');
                msgItem.className = 'message-item';
                msgItem.innerHTML = `
                    <div class="message-avatar">
                        <span>${conv.username[0].toUpperCase()}</span>
                    </div>
                    <div class="message-info">
                        <h4>${conv.username}</h4>
                        <div class="message-preview">${conv.last_message || 'Media'}</div>
                    </div>
                `;
                msgItem.addEventListener('click', () => openChat(conv));
                container.appendChild(msgItem);
            });
        }
    } catch (error) {
        console.error('Load messages error:', error);
    }
}

// Open Chat
async function openChat(user) {
    const chatContainer = document.querySelector('.messages-chat');
    chatContainer.innerHTML = `
        <div class="chat-header">
            <div class="chat-header-user">
                <div class="avatar-small"><span>${user.username[0].toUpperCase()}</span></div>
                <span>${user.username}</span>
            </div>
            <i class="fas fa-info-circle"></i>
        </div>
        <div class="chat-messages" id="chatMessages">
            <!-- Messages go here -->
        </div>
        <div class="chat-input-area">
            <i class="far fa-smile"></i>
            <input type="text" id="messageInput" placeholder="Message...">
            <button id="sendMessageBtn">Send</button>
        </div>
    `;

    // Load existing messages
    const token = localStorage.getItem('token');
    const messagesEl = document.getElementById('chatMessages');

    try {
        const response = await fetch(`${API_URL}/messages/${user.id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
            const messages = await response.json();
            messages.forEach(msg => {
                const isMine = msg.sender_id === currentUser.id;
                const msgDiv = document.createElement('div');
                msgDiv.className = isMine ? 'chat-msg mine' : 'chat-msg theirs';
                msgDiv.textContent = msg.content;
                messagesEl.appendChild(msgDiv);
            });
            messagesEl.scrollTop = messagesEl.scrollHeight;
        }
    } catch (e) { console.error(e); }

    // Send Message Handler
    const input = document.getElementById('messageInput');
    const btn = document.getElementById('sendMessageBtn');

    const sendMessage = async () => {
        const content = input.value.trim();
        if (!content) return;

        try {
            const resp = await fetch(`${API_URL}/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ receiver_id: user.id, content })
            });

            if (resp.ok) {
                input.value = '';
                // Optimistically add message
                const msgDiv = document.createElement('div');
                msgDiv.className = 'chat-msg mine';
                msgDiv.textContent = content;
                messagesEl.appendChild(msgDiv);
                messagesEl.scrollTop = messagesEl.scrollHeight;
            }
        } catch (e) { console.error(e); }
    };

    btn.onclick = sendMessage;
    input.onkeypress = (e) => { if (e.key === 'Enter') sendMessage(); };
}

// Load Activity
async function loadActivity() {
    const token = localStorage.getItem('token');
    const todayContainer = document.getElementById('activityToday');
    const weekContainer = document.getElementById('activityWeek');

    // Clear containers
    todayContainer.innerHTML = '';
    weekContainer.innerHTML = '';

    try {
        const response = await fetch(`${API_URL}/notifications`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const notifications = await response.json();
            if (notifications.length === 0) {
                todayContainer.innerHTML = '<p style="color:var(--text-secondary)">No notifications</p>';
                return;
            }

            notifications.forEach(notif => {
                const el = document.createElement('div');
                el.className = 'activity-item';

                let text = '';
                if (notif.type === 'like') text = `liked your post.`;
                if (notif.type === 'comment') text = `commented on your post.`;
                if (notif.type === 'follow') text = `started following you.`;

                el.innerHTML = `
                    <div class="activity-avatar">
                        <span>${notif.actor_username[0].toUpperCase()}</span>
                    </div>
                    <div class="activity-info">
                        <p><span>${notif.actor_username}</span> ${text}</p>
                        <div class="activity-time">${getTimeAgo(new Date(notif.created_at))}</div>
                    </div>
                    ${notif.type === 'follow' ? '<button class="btn-follow">Follow Back</button>' : ''}
                `;

                // Simple logic to separate today vs older (for now just put all in today)
                todayContainer.appendChild(el);
            });
        }
    } catch (e) { console.error(e); }
}

// Load Profile
async function loadProfile() {
    const token = localStorage.getItem('token');

    try {
        const response = await fetch(`${API_URL}/posts`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const allPosts = await response.json();
            const userPosts = allPosts.filter(p => p.user_id === currentUser.id);

            // UPDATE STATS
            document.getElementById('postsCount').textContent = userPosts.length;

            renderProfilePosts(userPosts);
        }
    } catch (error) {
        console.error('Load profile error:', error);
    }
}

// Render Profile Posts
function renderProfilePosts(posts) {
    const container = document.getElementById('profilePosts');
    container.innerHTML = '';

    if (posts.length === 0) {
        container.innerHTML = '<p style="text-align: center; padding: 40px; color: var(--text-secondary); grid-column: 1 / -1;">No posts yet</p>';
        return;
    }

    posts.forEach(post => {
        if (post.image_url) {
            const postItem = document.createElement('div');
            postItem.className = 'profile-post-item';
            postItem.innerHTML = `
                <img src="${post.image_url}" alt="Post">
                <div class="profile-post-overlay">
                    <div class="explore-stat">
                        <i class="fas fa-heart"></i>
                        <span>${post.likes_count || 0}</span>
                    </div>
                    <div class="explore-stat">
                        <i class="fas fa-comment"></i>
                        <span>${post.comments_count || 0}</span>
                    </div>
                </div>
            `;
            container.appendChild(postItem);
        }
    });
}

// Create Post Modal
function openCreatePostModal() {
    document.getElementById('createPostModal').classList.add('active');
}

function closeCreatePostModal() {
    document.getElementById('createPostModal').classList.remove('active');
    document.getElementById('uploadArea').style.display = 'flex';
    document.getElementById('postEditor').style.display = 'none';
    document.getElementById('fileInput').value = '';
    document.getElementById('postCaption').value = '';
}

// Handle File Select
function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
            document.getElementById('uploadArea').style.display = 'none';
            document.getElementById('postEditor').style.display = 'grid';
            document.getElementById('postPreview').innerHTML = `<img src="${e.target.result}" alt="Preview">`;
        };
        reader.readAsDataURL(file);
    }
}

// Handle Share Post
async function handleSharePost() {
    const caption = document.getElementById('postCaption').value;
    const fileInput = document.getElementById('fileInput');
    const token = localStorage.getItem('token');

    if (!fileInput.files[0]) {
        showToast('Please select an image', 'error');
        return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
        const base64Image = e.target.result;

        try {
            const response = await fetch(`${API_URL}/posts`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    content: caption,
                    image_url: base64Image,
                    location: document.querySelector('#postEditor input[type="text"]').value
                })
            });

            if (response.ok) {
                closeCreatePostModal();
                loadPosts();
                loadProfile();
                showToast('Post shared successfully!', 'success');
            }
        } catch (error) {
            console.error('Share post error:', error);
            showToast('Failed to share post', 'error');
        }
    };
    reader.readAsDataURL(fileInput.files[0]);
}

// Utility Functions
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function getTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);

    const intervals = {
        year: 31536000,
        month: 2592000,
        week: 604800,
        day: 86400,
        hour: 3600,
        minute: 60
    };

    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
        const interval = Math.floor(seconds / secondsInUnit);
        if (interval >= 1) {
            return `${interval}${unit[0]} ago`;
        }
    }

    return 'Just now';
}

// Make functions global for onclick handlers
window.toggleLike = toggleLike;
window.handleCommentKeyPress = handleCommentKeyPress;
window.followUser = followUser;
window.openChat = openChat;
// Toggle Like
async function toggleLike(postId) {
    const token = localStorage.getItem('token');

    try {
        const response = await fetch(`${API_URL}/posts/${postId}/like`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            loadPosts();
            // Optional: show subtle heart animation logic here
        }
    } catch (error) {
        console.error('Toggle like error:', error);
    }
}

// Handle Comment Key Press
async function handleCommentKeyPress(event, postId) {
    if (event.key === 'Enter' && event.target.value.trim()) {
        const content = event.target.value.trim();
        const token = localStorage.getItem('token');

        try {
            const response = await fetch(`${API_URL}/posts/${postId}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ content })
            });

            if (response.ok) {
                event.target.value = '';
                loadPosts(); // Reload
            }
        } catch (error) {
            console.error('Comment error:', error);
        }
    }
}
