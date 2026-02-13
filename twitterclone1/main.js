document.addEventListener('DOMContentLoaded', async () => {
    // Apply Theme
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-mode');
    }

    let stored_user = JSON.parse(localStorage.getItem('user')) || {};
    
    const updateImages = (src) => {
        const imgs = document.querySelectorAll('.user-pill img, .composer .avatar-sm');
        imgs.forEach(img => img.src = src);
    };

    const updateUserText = () => {
        const sidebarName = document.querySelector('.sidebar .user-info .name');
        const sidebarHandle = document.querySelector('.sidebar .user-info .handle');
        
        if (sidebarName && stored_user.name) sidebarName.innerHTML = `${stored_user.name} <span class="material-icons verified-icon">verified</span>`;
        if (sidebarHandle && stored_user.uname) sidebarHandle.innerText = `@${stored_user.uname}`;
    };

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

    const renderFeed = () => {
        const feedContainer = document.getElementById('feed-container');
        if (!feedContainer) return;
        
        const tweets = getTweets();
        feedContainer.innerHTML = tweets.map(tweet => `
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

    // Feed Interaction Logic (Like, Retweet, Comment)
    const mainFeed = document.querySelector('.feed');
    if (mainFeed) {
        mainFeed.addEventListener('click', (e) => {
            // Handle Action Buttons
            const actionBtn = e.target.closest('.action-btn');
            if (actionBtn) {
                const article = actionBtn.closest('.post');
                const id = article.dataset.id;
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

                // Handle Dynamic vs Static Tweets
                if (id && !id.startsWith('demo')) {
                    const tweets = getTweets();
                    const tweet = tweets.find(t => t.id == id);
                    
                    if (!tweet) return;

                    if (action === 'like') {
                        tweet.liked = !tweet.liked;
                        tweet.likes = tweet.liked ? (tweet.likes || 0) + 1 : (tweet.likes || 0) - 1;
                        localStorage.setItem('tweets', JSON.stringify(tweets));
                    } else if (action === 'retweet') {
                        tweet.retweets = (tweet.retweets || 0) + 1;
                        tweet.retweeted = true;
                        localStorage.setItem('tweets', JSON.stringify(tweets));
                        saveTweet(`RT @${tweet.user.handle}: ${tweet.text}`);
                    }
                    renderFeed();
                } else {
                    // Static Demo Tweet Logic (UI Only)
                    if (action === 'like') {
                        const isLiked = actionBtn.classList.toggle('liked');
                        const countSpan = actionBtn.querySelector('span:last-child');
                        let count = parseInt(countSpan.innerText) || 0;
                        countSpan.innerText = isLiked ? count + 1 : (count > 0 ? count - 1 : '');
                        
                        actionBtn.querySelector('.material-icons').innerText = isLiked ? 'favorite' : 'favorite_border';
                    } else if (action === 'retweet') {
                        actionBtn.classList.toggle('retweeted');
                        const countSpan = actionBtn.querySelector('span:last-child');
                        let count = parseInt(countSpan.innerText) || 0;
                        countSpan.innerText = count + 1;

                        // Create a new tweet from this demo tweet
                        const text = article.querySelector('.post-text').innerText;
                        const handleText = article.querySelector('.post-header .gray').innerText;
                        const handle = handleText.split('·')[0].trim();
                        saveTweet(`RT ${handle}: ${text}`);
                        renderFeed();
                    }
                }
                return;
            }

            // Handle Reply Button Click
            if (e.target.classList.contains('reply-btn')) {
                const inputArea = e.target.closest('.comment-input-area');
                const text = inputArea.querySelector('input').value.trim();
                if (!text) return;

                const article = e.target.closest('.post');
                const id = article.dataset.id;

                if (id && !id.startsWith('demo')) {
                    const tweets = getTweets();
                    const tweet = tweets.find(t => t.id == id);
                    
                    if (tweet) {
                        if (!tweet.comments) tweet.comments = [];
                        tweet.comments.push({ text: text, handle: stored_user.uname || 'user' });
                        localStorage.setItem('tweets', JSON.stringify(tweets));
                        renderFeed();
                    }
                } else {
                    // Static Comment Append
                    let commentsSection = article.querySelector('.comments-section');
                    if (!commentsSection) {
                        commentsSection = document.createElement('div');
                        commentsSection.className = 'comments-section';
                        article.querySelector('.post-content').appendChild(commentsSection);
                    }
                    commentsSection.innerHTML += `<div class="comment"><strong>@${stored_user.uname || 'user'}:</strong> <span>${text}</span></div>`;
                    
                    // Update count
                    const commentBtn = article.querySelector('[data-action="comment"] span:last-child');
                    if(commentBtn) {
                        let c = parseInt(commentBtn.innerText) || 0;
                        commentBtn.innerText = c + 1;
                    }
                    inputArea.classList.remove('active');
                    inputArea.querySelector('input').value = '';
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
            
            if (len > 280) {
                count.classList.add('limit-exceeded');
                btn.disabled = true;
            } else {
                count.classList.remove('limit-exceeded');
                btn.disabled = len === 0;
            }
        });

        btn.addEventListener('click', () => {
            saveTweet(input.value);
            input.value = '';
            count.innerText = '';
            btn.disabled = true;
            renderFeed();
            // If it's the dialog, close it
            document.getElementById('tweet_dialog').style.display = 'none';
            document.getElementById('backdrop').style.display = 'none';
        });
    };

    // Load the sidebar dynamically
    const sidebarContainer = document.getElementById('sidebar-container');
    if (sidebarContainer) {
        try {
            const response = await fetch('sidebar.html');
            sidebarContainer.innerHTML = await response.text();
            
            if (stored_user.profile_pic) {
                updateImages(stored_user.profile_pic);
            }
            updateUserText();

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

    // Update composer image on load
    if (stored_user.profile_pic) {
        updateImages(stored_user.profile_pic);
    }

    // Initialize Composers and Feed
    setupComposer('home-composer-input', 'home-char-count', 'home-post-btn');
    setupComposer('dialog-composer-input', 'dialog-char-count', 'dialog-post-btn');
    renderFeed();

    // --- ONBOARDING LOGIC (Moved from profile.js) ---
    const close_btn = document.querySelectorAll('.closeButton');
    const pp = document.getElementById('pp');
    const preview_img = document.getElementById('preview_img');
    const uname = document.getElementById('username');
    const un_invalid = document.getElementById('invalid');
    const pick_pp = document.getElementById('pick_pp');
    const pick_un = document.getElementById('pick_un');
    const un_submit = document.getElementById('submit_un');
    const un_skip = document.getElementById('skip_un');
    const pp_skip = document.getElementById('skip_pp');
    const pp_submit = document.getElementById('submit_pp');
    const skip = document.querySelectorAll('.skip');
    const backdrop = document.getElementById('backdrop');
    
    let profile_pic = '';
    let username = '';

    // Show dialogs if data is missing
    if (pick_un && !stored_user.uname) {
        pick_un.style.display = 'block';
        
        if(backdrop) backdrop.style.display = 'block';
    }
    if (pick_pp && !stored_user.profile_pic) {
        pick_pp.style.display = 'block';
        if(backdrop) backdrop.style.display = 'block';
    }

    // Event Listeners for Dialogs
    if (close_btn) {
        close_btn.forEach(btn => {
            btn.addEventListener('click', () => {
                if(pick_pp) pick_pp.style.display = 'none';
                if(pick_un) pick_un.style.display = 'none';
                if(backdrop) backdrop.style.display = 'none';
                document.getElementById('tweet_dialog').style.display = 'none';
            });
        });
    }

    if (pp) {
        pp.addEventListener('change', () => {
            const file = pp.files[0];
            
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const base64String = e.target.result;
                    preview_img.src = base64String;
                    preview_img.style.display = 'block';
                    profile_pic = base64String; // Store Base64 string instead of File object
                    pp_skip.style.display = 'none';
                    pp_submit.style.display = "block";
                };
                reader.readAsDataURL(file);
            }
        });
    }

    if (uname) {
        uname.addEventListener('input', () => {
            const u = uname.value;
            const username_pattern = /^[a-zA-Z0-9_]{3,15}$/;
            
            if (username_pattern.test(u)) {
                un_invalid.style.display = 'none';
                un_skip.style.display = 'none';
                un_submit.style.display = 'block';
            } else {
                un_invalid.style.display = 'block';
                un_skip.style.display = 'block';
                un_submit.style.display = 'none';
            }
        });
    }

    if (skip) {
        skip.forEach(btn => {
            btn.addEventListener('click', () => {
                if (pick_pp) pick_pp.style.display = 'none';
                if (pick_un) pick_un.style.display = 'none';
                if (backdrop) backdrop.style.display = 'none';
            });
        });
    }

    if (un_submit) {
        un_submit.addEventListener('click', () => {
            username = uname.value;
            stored_user.uname = username;
            localStorage.setItem('user', JSON.stringify(stored_user));
            updateUserText();
            if (pick_un) pick_un.style.display = 'none';
            if (backdrop) backdrop.style.display = 'none';
        });
    }

    if (pp_submit) {
        pp_submit.addEventListener('click', () => {
            stored_user.profile_pic = profile_pic;
            localStorage.setItem('user', JSON.stringify(stored_user));
            updateImages(profile_pic);
            if (pick_pp) pick_pp.style.display = 'none';
            if (backdrop) backdrop.style.display = 'none';
        });
    }
    // --- END ONBOARDING LOGIC ---

    const homeNav = document.getElementById('home-nav');
    const profileNav = document.getElementById('profile-nav');
    const homeView = document.getElementById('home-view');
    const headerTitle = document.getElementById('header-title');

    function showProfile() {
        // Redirect to the separate profile page
        window.location.href = 'profile.html';
    }

    function showHome() {
        // Already on home, maybe scroll to top
        window.scrollTo(0, 0);
    }

    if(profileNav) profileNav.addEventListener('click', showProfile);
    if(homeNav) homeNav.addEventListener('click', showHome);
});