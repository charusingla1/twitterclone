document.addEventListener('DOMContentLoaded', async () => {
    const stored_user = JSON.parse(localStorage.getItem('user')) || {};
    const currentTheme = localStorage.getItem('theme') || 'light';
    const sidebarContainer = document.getElementById('sidebar-container');
    const themeBtn = document.getElementById('theme-btn');
    const themeText = document.getElementById('theme-text');
    const saveUsernameBtn = document.getElementById('save_username');
    const usernameInput = document.getElementById('set_username');
    const usernameMsg = document.getElementById('username_msg');
    const savePwdBtn = document.getElementById('save_pwd');
    const currPwd = document.getElementById('curr_pwd');
    const newPwd = document.getElementById('new_pwd');
    const pwdMsg = document.getElementById('pwd_msg');
    const signOutBtn = document.getElementById('sign_out_btn');
    const deleteAccBtn = document.getElementById('delete_acc');

    const getTweets = () => JSON.parse(localStorage.getItem('tweets')) || [];
    
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
            document.getElementById('tweet_dialog').style.display = 'none';
            document.getElementById('backdrop').style.display = 'none';
        });
    };

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

            const dialogImg = document.querySelector('.composer-area .avatar-sm');
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

            if (stored_user.name) {
                const sidebarName = sidebarContainer.querySelector('.user-info .name');
                if (sidebarName) sidebarName.innerHTML = `${stored_user.name} <span class="material-icons verified-icon">verified</span>`;
            }
            if (stored_user.uname) {
                const sidebarHandle = sidebarContainer.querySelector('.user-info .handle');
                if (sidebarHandle) sidebarHandle.innerText = `@${stored_user.uname}`;
            }

            const homeNav = document.getElementById('home-nav');
            const profileNav = document.getElementById('profile-nav');
            const settingsNav = document.getElementById('settings-nav');

            if (homeNav) {
                homeNav.classList.remove('active');
                homeNav.addEventListener('click', () => window.location.href = 'index.html');
            }
            if (profileNav) profileNav.addEventListener('click', () => window.location.href = 'profile.html');
            if (settingsNav) settingsNav.classList.add('active');

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

    if (currentTheme === 'dark') {
        document.body.classList.add('dark-mode');
        if(themeText) themeText.innerText = "Switch to Light Mode";
    }

    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            if (document.body.classList.contains('dark-mode')) {
                localStorage.setItem('theme', 'dark');
                if(themeText) themeText.innerText = "Switch to Light Mode";
            } else {
                localStorage.setItem('theme', 'light');
                if(themeText) themeText.innerText = "Switch to Dark Mode";
            }
        });
    }

    if (saveUsernameBtn) {
        saveUsernameBtn.addEventListener('click', () => {
            const newName = usernameInput.value.trim();
            const username_pattern = /^[a-zA-Z0-9_]{3,15}$/;
            
            if (username_pattern.test(newName)) {
                stored_user.uname = newName;
                localStorage.setItem('user', JSON.stringify(stored_user));
                usernameMsg.style.color = 'green';
                usernameMsg.innerText = "Username updated successfully!";
                usernameMsg.style.display = 'block';
                setTimeout(() => location.reload(), 1000);
            } else {
                usernameMsg.style.color = 'red';
                usernameMsg.innerText = "Invalid username (3-15 chars, letters/numbers/_)";
                usernameMsg.style.display = 'block';
            }
        });
    }

    if (savePwdBtn) {
        savePwdBtn.addEventListener('click', () => {
            if (currPwd.value !== stored_user.password) {
                pwdMsg.style.color = 'red';
                pwdMsg.innerText = "Incorrect current password!";
                pwdMsg.style.display = 'block';
            } else if (newPwd.value.length < 8) {
                pwdMsg.style.color = 'red';
                pwdMsg.innerText = "New password must be at least 8 characters!";
                pwdMsg.style.display = 'block';
            } else {
                stored_user.password = newPwd.value;
                localStorage.setItem('user', JSON.stringify(stored_user));
                pwdMsg.style.color = 'green';
                pwdMsg.innerText = "Password updated successfully!";
                pwdMsg.style.display = 'block';
                currPwd.value = '';
                newPwd.value = '';
            }
        });
    }

    if (signOutBtn) {
        signOutBtn.addEventListener('click', () => {
            localStorage.removeItem('user');
            localStorage.setItem('signedOut', 'true');
            window.location.href = 'login.html';
        });
    }

    if (deleteAccBtn) {
        deleteAccBtn.addEventListener('click', () => {
            if (confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
                localStorage.removeItem('user');
                localStorage.removeItem('tweets');
                window.location.href = 'login.html';
            }
        });
    }

    setupComposer('dialog-composer-input', 'dialog-char-count', 'dialog-post-btn');
    document.querySelectorAll('.closeButton').forEach(btn => btn.addEventListener('click', () => {
        document.getElementById('tweet_dialog').style.display = 'none';
        document.getElementById('backdrop').style.display = 'none';
    }));
});