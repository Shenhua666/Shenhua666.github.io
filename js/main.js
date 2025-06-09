// 全局变量
let isDarkMode = false;
const musicState = {
    playing: false,
    currentTime: 0,
    audio: new Audio('music/MoreanP - Ephemeral Memories.mp3')
};
musicState.audio.volume = 0.2;

// DOM加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 初始化深色模式
    initTheme();
    
    // 初始化音乐播放器
    initMusicPlayer();
    
    // 初始化浮动按钮
    initFloatingButtons();
    
    // 页面特定初始化
    const currentPage = window.location.pathname.split('/').pop();
    switch(currentPage) {
        case 'index.html':
            initHomePage();
            break;
        case 'download.html':
            initDownloadPage();
            break;
        case 'contact.html':
            initContactPage();
            break;
    }
});

// 初始化主题
function initTheme() {
    const themeToggle = document.querySelector('.theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
    
    // 检查本地存储或系统偏好
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
        enableDarkMode();
    }
}

// 切换主题
function toggleTheme() {
    if (isDarkMode) {
        disableDarkMode();
    } else {
        enableDarkMode();
    }
}

// 启用深色模式
function enableDarkMode() {
    document.documentElement.setAttribute('data-theme', 'dark');
    document.querySelector('.theme-toggle span').textContent = '☀️';
    localStorage.setItem('theme', 'dark');
    isDarkMode = true;
}

// 禁用深色模式
function disableDarkMode() {
    document.documentElement.removeAttribute('data-theme');
    document.querySelector('.theme-toggle span').textContent = '🌙';
    localStorage.setItem('theme', 'light');
    isDarkMode = false;
}

// 初始化音乐播放器
function initMusicPlayer() {
    const musicPlayer = document.querySelector('.music-player');
    if (!musicPlayer) return;

    // 从sessionStorage恢复音乐状态
    const savedState = sessionStorage.getItem('musicState');
    if (savedState) {
        const state = JSON.parse(savedState);
        musicState.playing = state.playing;
        musicState.currentTime = state.currentTime;
        musicState.audio.currentTime = state.currentTime;
    }

    // 获取当前音乐名（去掉路径和后缀，解码URL编码）
    const musicName = decodeURIComponent(musicState.audio.src.split('/').pop().split('.')[0]);
    
    // 更新悬停提示函数
    const updateTooltip = () => {
        if (musicState.playing) {
            musicPlayer.title = `正在播放: ${musicName}\n点击暂停`;
        } else {
            musicPlayer.title = '点击播放';
        }
    };
    
    // 初始设置
    updateTooltip();
    
    // 监听播放状态变化
    musicState.audio.addEventListener('play', updateTooltip);
    musicState.audio.addEventListener('pause', updateTooltip);
    
    musicPlayer.addEventListener('click', toggleMusic);
    
    // 设置音频循环
    musicState.audio.loop = true;
    
    // 自动播放音乐（带静音自动恢复）
    const tryAutoPlay = () => {
        if (musicState.playing) {
            // 先静音尝试播放
            musicState.audio.muted = true;
            const playPromise = musicState.audio.play();
            
            if (playPromise !== undefined) {
                playPromise
                    .then(() => {
                        // 播放成功后再取消静音
                        setTimeout(() => {
                            musicState.audio.muted = false;
                            document.querySelector('.record').style.animationPlayState = 'running';
                        }, 1000);
                    })
                    .catch(e => {
                        console.log('自动播放被阻止:', e);
                        // 用户交互后重试
                        document.addEventListener('click', () => {
                            musicState.audio.play()
                                .then(() => {
                                    document.querySelector('.record').style.animationPlayState = 'running';
                                })
                                .catch(e => console.log('用户交互后播放仍失败:', e));
                        }, { once: true });
                    });
            }
        }
    };
    
    // 延迟执行确保DOM完全加载
    setTimeout(tryAutoPlay, 500);

    // 保存音乐状态到sessionStorage
    musicState.audio.addEventListener('timeupdate', () => {
        musicState.currentTime = musicState.audio.currentTime;
        sessionStorage.setItem('musicState', JSON.stringify(musicState));
    });

    // 创建音符粒子效果
    createMusicParticles();
}

// 切换音乐播放状态
function toggleMusic() {
    const record = document.querySelector('.record');
    if (musicState.playing) {
        musicState.audio.pause();
        record.style.animationPlayState = 'paused';
    } else {
        musicState.audio.play().catch(e => console.log('播放失败:', e));
        record.style.animationPlayState = 'running';
    }
    musicState.playing = !musicState.playing;
    sessionStorage.setItem('musicState', JSON.stringify(musicState));
}

// 创建音符粒子效果
function createMusicParticles() {
    const container = document.createElement('div');
    container.className = 'music-particles';
    container.style.position = 'fixed';
    container.style.bottom = '56px';  // 20px (唱片位置) + 36px (唱片高度)
    container.style.left = '20px';
    container.style.width = '36px';   // 与唱片宽度一致
    container.style.height = '100px'; // 缩短高度使粒子更集中
    container.style.pointerEvents = 'none';
    container.style.overflow = 'hidden';
    document.body.appendChild(container);

    // 当音乐播放时创建粒子
    musicState.audio.addEventListener('play', () => {
        const interval = setInterval(() => {
            if (!musicState.playing) {
                clearInterval(interval);
                return;
            }

            const particle = document.createElement('div');
            particle.style.position = 'absolute';
            particle.style.width = '4px';
            particle.style.height = '4px';
            particle.style.backgroundColor = '#1e88e5';
            particle.style.borderRadius = '50%';
            particle.style.left = `${Math.random() * 36}px`;
            particle.style.bottom = '0';
            container.appendChild(particle);

            // 动画
            const duration = 1 + Math.random() * 2;
            particle.animate([
                { bottom: '0', opacity: 1 },
                { bottom: '200px', opacity: 0 }
            ], {
                duration: duration * 1000,
                easing: 'linear'
            });

            // 移除粒子
            setTimeout(() => {
                particle.remove();
            }, duration * 1000);
        }, 200);
    });
}

// 初始化浮动按钮
function initFloatingButtons() {
    // 主页书本按钮
    const bookBtn = document.querySelector('.book-btn');
    if (bookBtn) {
        bookBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.open('https://blog.mietianshenhua.online', '_blank');
        });
    }
    
    // 火箭按钮（返回顶部）
    const rocketBtn = document.querySelector('.rocket-btn');
    if (rocketBtn) {
        // 初始状态检查
        rocketBtn.style.display = window.scrollY > window.innerHeight ? 'flex' : 'none';
        
        window.addEventListener('scroll', () => {
            if (window.scrollY > window.innerHeight) {
                rocketBtn.style.display = 'flex';
                // 从房子图标位置飞出
                rocketBtn.style.transform = 'translateY(60px) scale(0.5)';
                rocketBtn.style.opacity = '0';
                setTimeout(() => {
                    rocketBtn.style.transition = 'all 0.5s ease-out';
                    rocketBtn.style.transform = 'translateY(0) scale(1)';
                    rocketBtn.style.opacity = '1';
                }, 10);
            } else {
                rocketBtn.style.display = 'none';
            }
        });
        
        rocketBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
    
    // 主页按钮
    const homeBtn = document.querySelector('.home-btn');
    if (homeBtn) {
        homeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = 'index.html';
        });
    }

    // 移动端菜单按钮
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('show');
            mobileMenuBtn.classList.toggle('active');
        });
    }
}

// 初始化主页
function initHomePage() {
    const articlesContainer = document.querySelector('.articles-container');
    if (!articlesContainer) return;

    // 添加滚动到底部检测
    articlesContainer.addEventListener('scroll', function() {
        const { scrollTop, scrollHeight, clientHeight } = this;
        const isAtBottom = scrollHeight - scrollTop <= clientHeight + 5;
        
        if (isAtBottom) {
            this.classList.add('at-bottom');
            setTimeout(() => this.classList.remove('at-bottom'), 500);
        }
    });
    
    // 立即渲染文章内容
    loadArticlesConfig();
    
    // 延迟加载其他内容确保文章优先显示
    setTimeout(() => {
        loadPlatformIcons();
        loadFriendAvatars();
        fetchIPInfo();
    }, 100);
}

// 获取IP信息
function fetchIPInfo() {
    const ipContainer = document.querySelector('.ip-info');
    if (!ipContainer) return;

    // 显示加载状态
    ipContainer.innerHTML = '<div class="loading">获取IP信息中...</div>';

    // 使用国内可靠的API
    fetch('https://ip.useragentinfo.com/json')
        .then(res => res.json())
        .then(data => {
            ipContainer.innerHTML = `
                <div>IP: ${data.ip}</div>
                <div>位置: ${data.city || '未知'}, ${data.province || '未知'}</div>
                <div>运营商: ${data.isp || '未知'}</div>
            `;
        })
        .catch(error => {
            console.error('IP查询失败:', error);
            // 备用方案: 使用纯IP查询
            fetch('https://api.ipify.org?format=json')
                .then(res => res.json())
                .then(ipData => {
                    ipContainer.innerHTML = `
                        <div>IP: ${ipData.ip}</div>
                        <div>位置: 未知</div>
                        <div>运营商: 未知</div>
                    `;
                })
                .catch(e => {
                    console.error('备用API也失败:', e);
                    ipContainer.innerHTML = '<div class="error">无法获取IP信息</div>';
                });
        });
}

// 加载文章数据
let articlesConfig = {};

function loadArticlesConfig() {
    // 直接使用本地数据
    articlesConfig = {
        articles: [
            {
                id: 5,
                title: "NatFrp内网穿透实现我的世界联机", 
                summary: "使用NatFrp实现我的世界联机，无需公网IP。",
                image: "md/004/natfrp.png",
                date: "2025-06-09",
                url: "https://blog.mietianshenhua.online/2025/06/09/natfrp%E8%81%94%E6%9C%BA%E6%95%99%E7%A8%8B/"
            },
            {
                id: 4,
                title: "IPv6公网联机教程",
                summary: "Minecraft IPv6公网联机教程：操作简单，未来已来，低延迟联机新方案！",
                image: "md/003/ipv6.png",
                date: "2025-05-25",
                url: "https://blog.mietianshenhua.online/2025/05/25/IPv6%E5%85%AC%E7%BD%91%E8%81%94%E6%9C%BA/"
            },
            {
                id: 3,
                title: "IPv4公网联机教程", 
                summary: "Minecraft IPv4公网联机教程：稳定低延迟的联机方式。",
                image: "md/002/ipv4.png",
                date: "2025-05-24",
                url: "https://blog.mietianshenhua.online/2025/05/24/IPv4%E5%85%AC%E7%BD%91%E8%81%94%E6%9C%BA/"
            },
            {
                id: 2,
                title: "关于Forge的下载和安装",
                summary: "下载Forge安装到客户端或服务器中。",
                image: "md/001/forge.png",
                date: "2025-02-02",
                url: "https://www.bilibili.com/opus/339053862336318094"
            },
            {
                id: 1,
                title: "Windows的安装教程",
                summary: "新手小白都能看得懂的装系统教程",
                image: "md/000/win.png",
                date: "2022-10-27",
                url: "https://blog.mietianshenhua.online/2022/10/27/Windows%E7%9A%84%E5%AE%89%E8%A3%85/"
            },
        ]
    };
    renderArticles();
}

// 渲染文章列表
function createArticleElement(article, isEven) {
    const articleElement = document.createElement('div');
    articleElement.className = `article ${isEven ? 'even' : 'odd'}`;
    
    articleElement.innerHTML = `
        <div class="article-image">
            <img src="${article.image}" alt="${article.title}" onerror="this.src='assets/404.png'">
        </div>
        <div class="article-content">
            <h3>${article.title}</h3>
            <p>${article.summary}</p>
            <div class="article-meta">
                <span>${article.date}</span>
            </div>
        </div>
    `;
    
    // 根据奇偶设置不同布局
    if (isEven) {
        articleElement.style.flexDirection = 'row';
    } else {
        articleElement.style.flexDirection = 'row-reverse';
    }
    
    return articleElement;
}

function renderArticles() {
    const articlesContainer = document.querySelector('.articles-container');
    
    if (articlesContainer) {
        articlesContainer.innerHTML = '';
        
        if (articlesConfig.articles && articlesConfig.articles.length > 0) {
            articlesConfig.articles.forEach((article, index) => {
                const articleElement = createArticleElement(article, index % 2 === 0);
                articlesContainer.appendChild(articleElement);
                
                // 添加点击事件
                articleElement.addEventListener('click', () => {
                    if (article.url.startsWith('http')) {
                        window.open(article.url, '_blank');
                    } else {
                        window.location.href = article.url;
                    }
                });
            });
        } else {
            const emptyPlaceholder = document.createElement('div');
            emptyPlaceholder.className = 'empty-placeholder';
            emptyPlaceholder.style.flex = '1';
            articlesContainer.appendChild(emptyPlaceholder);
        }
    }
}



