document.addEventListener('DOMContentLoaded', async () => {
    const stored_user = JSON.parse(localStorage.getItem('user')) || {};
    const sidebarContainer = document.getElementById('sidebar-container');
    const feedContainer = document.getElementById('profile-feed-container');
    const editPicInput = document.getElementById('edit-profile-pic');
    const closeBtns = document.querySelectorAll('.closeButton');
    const profileImg = document.querySelector('.avatar-overlap');
    const profileName = document.querySelector('.bio-section h3');
    const profileHandle = document.querySelector('.bio-section .gray');
    const dialogImg = document.querySelector('.composer-area .avatar-sm');
    let homeNav;
    let profileNav;

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
                avatar: stored_user.profile_pic || ''
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

    const renderProfileFeed = () => {
        if (!feedContainer) return;
        const allTweets = getTweets();
        const myTweets = allTweets.filter(t => t.user.handle === stored_user.uname);

        feedContainer.innerHTML = myTweets.map(tweet => `
            <article class="post" data-id="${tweet.id}">
                ${tweet.user.avatar 
                    ? `<img src="${tweet.user.avatar}" class="avatar-sm" alt="User Avatar">` 
                    : `<div class="avatar-sm placeholder-icon"><span class="material-icons">account_circle</span></div>`}
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

    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-mode');
    }

    if (feedContainer) {
        feedContainer.addEventListener('click', (e) => {
            const actionBtn = e.target.closest('.action-btn');
            if (actionBtn) {
                const article = actionBtn.closest('.post');
                const id = parseInt(article.dataset.id);
                const tweets = getTweets();
                const tweet = tweets.find(t => t.id === id);
                
                if (!tweet) return;
                const action = actionBtn.dataset.action;

                if (action === 'comment') {
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

    if (sidebarContainer) {
        try {
            const response = await fetch('sidebar.html');
            sidebarContainer.innerHTML = await response.text();
            
            const sidebarImg = document.querySelector('.user-pill .avatar-vsm');
            if (sidebarImg) {
                if (stored_user.profile_pic) {
                    if (sidebarImg.tagName === 'IMG') {
                        sidebarImg.src = stored_user.profile_pic;
                    } else {
                        const img = document.createElement('img');
                        img.className = 'avatar-vsm';
                        img.src = stored_user.profile_pic;
                        sidebarImg.replaceWith(img);
                    }
                } else {
                    const div = document.createElement('div');
                    div.className = 'avatar-vsm placeholder-icon';
                    div.innerHTML = '<span class="material-icons">account_circle</span>';
                    sidebarImg.replaceWith(div);
                }
            }
            
            if (stored_user.name) {
                const sidebarName = sidebarContainer.querySelector('.user-info .name');
                if (sidebarName) sidebarName.innerHTML = `${stored_user.name} <span class="material-icons verified-icon">verified</span>`;
            }
            if (stored_user.uname) {
                const sidebarHandle = sidebarContainer.querySelector('.user-info .handle');
                if (sidebarHandle) sidebarHandle.innerText = `@${stored_user.uname}`;
            }

            const settingsNav = document.getElementById('settings-nav');
            if(settingsNav) settingsNav.addEventListener('click', () => window.location.href = 'settings.html');

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

    if (profileImg) {
        if (stored_user.profile_pic) {
            if (profileImg.tagName === 'IMG') {
                profileImg.src = stored_user.profile_pic;
            } else {
                profileImg.src = stored_user.profile_pic;
            }
        } else {
            const div = document.createElement('div');
            div.className = 'avatar-overlap placeholder-icon';
            div.innerHTML = '<span class="material-icons">account_circle</span>';
            profileImg.replaceWith(div);
        }
    }

    if (dialogImg) {
        if (stored_user.profile_pic) {
            if (dialogImg.tagName === 'IMG') {
                dialogImg.src = stored_user.profile_pic;
            } else {
                const img = document.createElement('img');
                img.className = 'avatar-sm';
                img.alt = 'User Avatar';
                img.src = stored_user.profile_pic;
                dialogImg.replaceWith(img);
            }
        } else {
            const div = document.createElement('div');
            div.className = 'avatar-sm placeholder-icon';
            div.innerHTML = '<span class="material-icons">account_circle</span>';
            dialogImg.replaceWith(div);
        }
    }

    if (stored_user.name && profileName) {
        profileName.innerHTML = `${stored_user.name} <span class="material-icons verified-icon">verified</span>`;
    }
    if (stored_user.uname && profileHandle) {
        profileHandle.innerText = `@${stored_user.uname}`;
    }

    setupComposer('dialog-composer-input', 'dialog-char-count', 'dialog-post-btn');
    renderProfileFeed();

    closeBtns.forEach(btn => btn.addEventListener('click', () => {
        document.getElementById('tweet_dialog').style.display = 'none';
        document.getElementById('backdrop').style.display = 'none';
    }));

    if (editPicInput) {
        editPicInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    const base64String = event.target.result;
                    stored_user.profile_pic = base64String;
                    localStorage.setItem('user', JSON.stringify(stored_user));
                    
                    let currentProfileImg = document.querySelector('.avatar-overlap');
                    if(currentProfileImg) {
                        if (currentProfileImg.tagName !== 'IMG') {
                            const img = document.createElement('img');
                            img.className = 'avatar-overlap';
                            img.alt = 'Profile Avatar';
                            currentProfileImg.replaceWith(img);
                            currentProfileImg = img;
                        }
                        currentProfileImg.src = base64String;
                    }
                    
                    const sidebarImg = document.querySelector('.user-pill .avatar-vsm');
                    if(sidebarImg && sidebarImg.tagName === 'IMG') sidebarImg.src = base64String;
                    else if (sidebarImg) {
                    }

                    const dialogImg = document.querySelector('.composer-area .avatar-sm');
                    if (dialogImg && dialogImg.tagName === 'IMG') {
                        dialogImg.src = base64String;
                    } else if (dialogImg) {
                    }

                    const tweets = JSON.parse(localStorage.getItem('tweets')) || [];
                    tweets.forEach(t => {
                        if(t.user.handle === stored_user.uname) {
                            t.user.avatar = base64String;
                        }
                    });
                    localStorage.setItem('tweets', JSON.stringify(tweets));
                    renderProfileFeed();
                };
                reader.readAsDataURL(file);
            }
        });
    }

    setTimeout(() => {
        homeNav = document.getElementById('home-nav');
        profileNav = document.getElementById('profile-nav');

        if (homeNav) {
            homeNav.classList.remove('active');
            homeNav.addEventListener('click', () => window.location.href = 'index.html');
        }
        if (profileNav) profileNav.classList.add('active');
    }, 100);
});