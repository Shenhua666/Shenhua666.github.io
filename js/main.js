// 全局变量
let isDarkMode = false;
const musicState = {
    playing: false,
    currentTime: 0,
    audio: new Audio('music/Yubel_Q-Audio - The First Summer In Time.mp3')
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





