document.addEventListener('DOMContentLoaded', async () => {
    // Apply Theme
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-mode');
    }

    const stored_user = JSON.parse(localStorage.getItem('user')) || {};

    // Load the sidebar dynamically
    const sidebarContainer = document.getElementById('sidebar-container');
    if (sidebarContainer) {
        try {
            const response = await fetch('sidebar.html');
            sidebarContainer.innerHTML = await response.text();
            
            if (stored_user.profile_pic) {
                const sidebarImg = document.querySelector('.user-pill img');
                if(sidebarImg) sidebarImg.src = stored_user.profile_pic;
            }
            
            // Update Sidebar Text
            if (stored_user.name) {
                const sidebarName = sidebarContainer.querySelector('.user-info .name');
                if (sidebarName) sidebarName.innerHTML = `${stored_user.name} <span class="material-icons verified-icon">verified</span>`;
            }
            if (stored_user.uname) {
                const sidebarHandle = sidebarContainer.querySelector('.user-info .handle');
                if (sidebarHandle) sidebarHandle.innerText = `@${stored_user.uname}`;
            }

            // Add Settings Listener
            const settingsNav = document.getElementById('settings-nav');
            if(settingsNav) settingsNav.addEventListener('click', () => window.location.href = 'settings.html');

            // Add Sidebar Post Button Listener
            const sidebarPostBtn = document.querySelector('.sidebar .tweet-btn');
            if (sidebarPostBtn) {
                sidebarPostBtn.addEventListener('click', () => {
                    document.getElementById('tweet_dialog').style.display = 'block';
                    document.getElementById('backdrop').style.display = 'block';
                });
            }
        } catch (error) {
            console.error('Error loading sidebar:', error);
        }
    }

    // Update Profile Page Avatar
    if (stored_user.profile_pic) {
        const profileImg = document.querySelector('.avatar-overlap');
        if(profileImg) profileImg.src = stored_user.profile_pic;
    }

    // Update Profile Page Text
    if (stored_user.name) {
        const profileName = document.querySelector('.bio-section h3');
        if (profileName) profileName.innerHTML = `${stored_user.name} <span class="material-icons verified-icon">verified</span>`;
    }
    if (stored_user.uname) {
        const profileHandle = document.querySelector('.bio-section .gray');
        if (profileHandle) profileHandle.innerText = `@${stored_user.uname}`;
    }

    // --- TWEET LOGIC ---
    const getTweets = () => JSON.parse(localStorage.getItem('tweets')) || [];
    
    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const seconds = Math.floor((now - date) / 1000);
        
        if (seconds < 60) return 'now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
        return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    };

    const saveTweet = (text) => {
        const tweets = getTweets();
        const newTweet = {
            id: Date.now(),
            text: text,
            timestamp: new Date().toISOString(),
            user: {
                name: stored_user.name || 'User',
                handle: stored_user.uname || 'user',
                avatar: stored_user.profile_pic || 'https://i.pravatar.cc/150?u=default'
            },
            likes: 0,
            retweets: 0,
            comments: [],
            liked: false,
            retweeted: false
        };
        tweets.unshift(newTweet);
        localStorage.setItem('tweets', JSON.stringify(tweets));
        return newTweet;
    };

    const renderProfileFeed = () => {
        const feedContainer = document.getElementById('profile-feed-container');
        if (!feedContainer) return;
        
        const allTweets = getTweets();
        // Filter tweets for the current user (matching handle)
        const myTweets = allTweets.filter(t => t.user.handle === stored_user.uname);

        feedContainer.innerHTML = myTweets.map(tweet => `
            <article class="post" data-id="${tweet.id}">
                <img src="${tweet.user.avatar}" class="avatar-sm" alt="User Avatar">
                <div class="post-content">
                    <div class="post-header">
                        <strong>${tweet.user.name}</strong> <span class="material-icons verified-blue">verified</span> <span class="gray">@${tweet.user.handle} · ${formatTime(tweet.timestamp)}</span>
                    </div>
                    <p class="post-text">${tweet.text}</p>
                    <div class="post-actions">
                        <div class="action-btn" data-action="comment">
                            <span class="material-icons">chat_bubble_outline</span>
                            <span>${tweet.comments ? tweet.comments.length : 0}</span>
                        </div>
                        <div class="action-btn ${tweet.retweeted ? 'retweeted' : ''}" data-action="retweet">
                            <span class="material-icons">repeat</span>
                            <span>${tweet.retweets || 0}</span>
                        </div>
                        <div class="action-btn ${tweet.liked ? 'liked' : ''}" data-action="like">
                            <span class="material-icons">${tweet.liked ? 'favorite' : 'favorite_border'}</span>
                            <span>${tweet.likes || 0}</span>
                        </div>
                        <div class="action-btn"><span class="material-icons">bar_chart</span></div>
                    </div>
                    ${tweet.comments && tweet.comments.length > 0 ? `
                        <div class="comments-section">
                            ${tweet.comments.map(c => `
                                <div class="comment">
                                    <strong>@${c.handle}:</strong> <span>${c.text}</span>
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}
                </div>
            </article>
        `).join('');
    };

    // Profile Feed Interaction Logic
    const feedContainer = document.getElementById('profile-feed-container');
    if (feedContainer) {
        feedContainer.addEventListener('click', (e) => {
            // Handle Action Buttons
            const actionBtn = e.target.closest('.action-btn');
            if (actionBtn) {
                const article = actionBtn.closest('.post');
                const id = parseInt(article.dataset.id);
                const tweets = getTweets();
                const tweet = tweets.find(t => t.id === id);
                
                if (!tweet) return;
                const action = actionBtn.dataset.action;

                if (action === 'comment') {
                    // Toggle Inline Comment Box
                    let inputArea = article.querySelector('.comment-input-area');
                    if (!inputArea) {
                        inputArea = document.createElement('div');
                        inputArea.className = 'comment-input-area active';
                        inputArea.innerHTML = `
                            <input type="text" class="comment-input" placeholder="Post your reply">
                            <button class="reply-btn">Reply</button>
                        `;
                        article.querySelector('.post-content').appendChild(inputArea);
                        inputArea.querySelector('input').focus();
                    } else {
                        inputArea.classList.toggle('active');
                        if (inputArea.classList.contains('active')) inputArea.querySelector('input').focus();
                    }
                    return;
                }

                if (action === 'like') {
                    tweet.liked = !tweet.liked;
                    tweet.likes = tweet.liked ? (tweet.likes || 0) + 1 : (tweet.likes || 0) - 1;
                    localStorage.setItem('tweets', JSON.stringify(tweets));
                    renderProfileFeed();
                } else if (action === 'retweet') {
                    tweet.retweets = (tweet.retweets || 0) + 1;
                    tweet.retweeted = true;
                    localStorage.setItem('tweets', JSON.stringify(tweets));
                    saveTweet(`RT @${tweet.user.handle}: ${tweet.text}`);
                    renderProfileFeed();
                }
                return;
            }

            // Handle Reply Button Click
            if (e.target.classList.contains('reply-btn')) {
                const inputArea = e.target.closest('.comment-input-area');
                const text = inputArea.querySelector('input').value.trim();
                if (text) {
                    const article = e.target.closest('.post');
                    const id = parseInt(article.dataset.id);
                    const tweets = getTweets();
                    const tweet = tweets.find(t => t.id === id);
                
                    if (!tweet.comments) tweet.comments = [];
                    tweet.comments.push({ text: text, handle: stored_user.uname || 'user' });
                    localStorage.setItem('tweets', JSON.stringify(tweets));
                    renderProfileFeed();
                }
            }
        });
    }

    const setupComposer = (inputId, countId, btnId) => {
        const input = document.getElementById(inputId);
        const count = document.getElementById(countId);
        const btn = document.getElementById(btnId);
        
        if (!input || !count || !btn) return;
        input.addEventListener('input', () => {
            const len = input.value.length;
            count.innerText = len > 0 ? `${len}/280` : '';
            btn.disabled = len === 0 || len > 280;
        });
        btn.addEventListener('click', () => {
            saveTweet(input.value);
            input.value = '';
            renderProfileFeed();
            document.getElementById('tweet_dialog').style.display = 'none';
            document.getElementById('backdrop').style.display = 'none';
        });
    };

    setupComposer('dialog-composer-input', 'dialog-char-count', 'dialog-post-btn');
    renderProfileFeed();

    // Close Dialog Logic
    const closeBtns = document.querySelectorAll('.closeButton');
    closeBtns.forEach(btn => btn.addEventListener('click', () => {
        document.getElementById('tweet_dialog').style.display = 'none';
        document.getElementById('backdrop').style.display = 'none';
    }));

    // Edit Profile Picture Logic
    const editPicInput = document.getElementById('edit-profile-pic');
    if (editPicInput) {
        editPicInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    const base64String = event.target.result;
                    stored_user.profile_pic = base64String;
                    localStorage.setItem('user', JSON.stringify(stored_user));
                    
                    // Update image on page immediately
                    const profileImg = document.querySelector('.avatar-overlap');
                    if(profileImg) profileImg.src = base64String;
                    
                    // Also update sidebar if possible
                    const sidebarImg = document.querySelector('.user-pill img');
                    if(sidebarImg) sidebarImg.src = base64String;

                    // Update stored tweets in localStorage
                    const tweets = JSON.parse(localStorage.getItem('tweets')) || [];
                    tweets.forEach(t => {
                        if(t.user.handle === stored_user.uname) {
                            t.user.avatar = base64String;
                        }
                    });
                    localStorage.setItem('tweets', JSON.stringify(tweets));

                    // Re-render feeds to show changes
                    renderProfileFeed();
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // Wait a moment for sidebar to load, then attach listeners
    // In a real app, we'd use a callback or promise, but for now:
    setTimeout(() => {
        const homeNav = document.getElementById('home-nav');
        const profileNav = document.getElementById('profile-nav');

        if (homeNav) {
            homeNav.classList.remove('active'); // We are not on home
            homeNav.addEventListener('click', () => window.location.href = 'index.html');
        }
        if (profileNav) profileNav.classList.add('active'); // We are on profile
    }, 100);
});