// 全局主题与浮动控件
let isDarkMode = false;

document.addEventListener('DOMContentLoaded', function () {
  initTheme();
  initFloatingButtons();
});

// ---------- 主题 ----------
function initTheme() {
  const themeToggle = document.querySelector('.theme-toggle');
  if (themeToggle) themeToggle.addEventListener('click', toggleTheme);

  const savedTheme = localStorage.getItem('theme');
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
    enableDarkMode();
  } else {
    disableDarkMode();
  }
}

function toggleTheme() {
  isDarkMode ? disableDarkMode() : enableDarkMode();
}

function enableDarkMode() {
  document.documentElement.setAttribute('data-theme', 'dark');
  setThemeIcon('sun');
  localStorage.setItem('theme', 'dark');
  isDarkMode = true;
}

function disableDarkMode() {
  document.documentElement.removeAttribute('data-theme');
  setThemeIcon('moon');
  localStorage.setItem('theme', 'light');
  isDarkMode = false;
}

// 切换主题图标（使用内联 SVG）
function setThemeIcon(name) {
  const span = document.querySelector('.theme-toggle span');
  if (span && window.ICONS) span.innerHTML = window.ICONS[name];
}

// ---------- 浮动按钮 / 导航 ----------
function initFloatingButtons() {
  // 书本按钮 → 博客
  const bookBtn = document.querySelector('.book-btn');
  if (bookBtn) {
    bookBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.open('https://blog.mietianshenhua.online', '_blank');
    });
  }

  // 返回顶部（火箭）
  const rocketBtn = document.querySelector('.rocket-btn');
  if (rocketBtn) {
    const updateRocket = () => {
      if (window.scrollY > window.innerHeight * 0.6) {
        rocketBtn.style.display = 'flex';
      } else {
        rocketBtn.style.display = 'none';
      }
    };
    updateRocket();
    window.addEventListener('scroll', updateRocket, { passive: true });
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

  // 移动端菜单
  const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
  const navLinks = document.querySelector('.nav-links');
  if (mobileMenuBtn && navLinks) {
    mobileMenuBtn.addEventListener('click', () => {
      navLinks.classList.toggle('show');
      mobileMenuBtn.classList.toggle('active');
    });
    // 点击链接后收起菜单
    navLinks.addEventListener('click', (e) => {
      if (e.target.tagName === 'A') {
        navLinks.classList.remove('show');
        mobileMenuBtn.classList.remove('active');
      }
    });
  }
}

// ---------- 屏蔽双击/长按弹出的浏览器菜单（避免干扰粒子互动） ----------
document.addEventListener('dblclick', function (e) { e.preventDefault(); });
document.addEventListener('contextmenu', function (e) {
  if (e.pointerType === 'touch') e.preventDefault();
});
