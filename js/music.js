// 背景音乐播放器
const musicState = {
  playing: false,
  currentTime: 0,
  audio: new Audio('music/Otokaze - 夏恋.mp3')
};
musicState.audio.volume = 0.2;
musicState.audio.loop = true;

document.addEventListener('DOMContentLoaded', function () {
  initMusicPlayer();
});

// 以真实音频状态同步视觉（唱片旋转 + 粒子 + 柔光）
function applyMusicState() {
  const musicPlayer = document.querySelector('.music-player');
  const record = document.querySelector('.record');
  if (record) record.classList.toggle('paused', !musicState.playing);
  if (musicPlayer) {
    musicPlayer.classList.toggle('playing', musicState.playing);
    if (musicState.playing) {
      const name = decodeURIComponent(musicState.audio.src.split('/').pop().split('.')[0]);
      musicPlayer.title = '正在播放: ' + name + '\n点击暂停';
    } else {
      musicPlayer.title = '点击播放';
    }
  }
}

function initMusicPlayer() {
  const musicPlayer = document.querySelector('.music-player');
  if (!musicPlayer) return;

  // 恢复上次播放进度
  try {
    const saved = JSON.parse(sessionStorage.getItem('musicState'));
    if (saved && typeof saved.currentTime === 'number' && saved.currentTime > 0) {
      musicState.currentTime = saved.currentTime;
      musicState.audio.currentTime = saved.currentTime;
    }
  } catch (e) { /* 忽略损坏的状态 */ }

  // 以真实音频事件为准同步状态
  musicState.audio.addEventListener('play', () => { musicState.playing = true; applyMusicState(); });
  musicState.audio.addEventListener('pause', () => { musicState.playing = false; applyMusicState(); });
  musicState.audio.addEventListener('ended', () => { musicState.playing = false; applyMusicState(); });

  musicPlayer.addEventListener('click', toggleMusic);

  // 记录进度
  musicState.audio.addEventListener('timeupdate', () => {
    musicState.currentTime = musicState.audio.currentTime;
    sessionStorage.setItem('musicState', JSON.stringify({ currentTime: musicState.audio.currentTime }));
  });

  createMusicParticles();
  applyMusicState();

  // 自动播放：除非用户本次会话内主动暂停过
  let userPaused = false;
  try { userPaused = sessionStorage.getItem('musicUserPaused') === '1'; } catch (e) {}
  if (!userPaused) autoPlay();
}

function toggleMusic() {
  if (musicState.playing) {
    musicState.audio.pause();
    try { sessionStorage.setItem('musicUserPaused', '1'); } catch (e) {}
  } else {
    const p = musicState.audio.play();
    if (p && typeof p.catch === 'function') {
      p.catch(() => {
        // 播放被拦截：'play' 事件可能已触发，需回退状态
        if (!musicState.audio.paused) return;
        musicState.playing = false;
        applyMusicState();
      });
    }
    try { sessionStorage.setItem('musicUserPaused', '0'); } catch (e) {}
  }
}

function autoPlay() {
  // 直接尝试播放；若被浏览器自动播放策略拦截，则在用户首次交互时启动
  const p = musicState.audio.play();
  if (p && typeof p.catch === 'function') {
    p.catch(() => {
      const start = () => {
        musicState.audio.play().catch(() => {
          if (musicState.audio.paused) {
            musicState.playing = false;
            applyMusicState();
          }
        });
        document.removeEventListener('click', start);
        document.removeEventListener('touchstart', start);
        document.removeEventListener('keydown', start);
      };
      document.addEventListener('click', start, { once: true });
      document.addEventListener('touchstart', start, { once: true });
      document.addEventListener('keydown', start, { once: true });
    });
  }
}

// 唱片周围音符粒子：播放时持续飘散，暂停时立即停止并清空
function createMusicParticles() {
  const container = document.createElement('div');
  container.className = 'music-particles';
  Object.assign(container.style, {
    position: 'fixed',
    left: '20px',
    bottom: '20px',
    width: '44px',
    height: '140px',
    pointerEvents: 'none',
    overflow: 'visible',
    zIndex: '998'
  });
  document.body.appendChild(container);

  let spawnTimer = null;

  const stopParticles = () => {
    if (spawnTimer) { clearInterval(spawnTimer); spawnTimer = null; }
    container.querySelectorAll('.music-particle').forEach(el => el.remove());
  };

  const startParticles = () => {
    if (spawnTimer) return;
    spawnTimer = setInterval(() => {
      const p = document.createElement('div');
      p.className = 'music-particle';
      const size = 4 + Math.random() * 3;
      // 从唱片中心区域冒出（唱片水平范围约 7-37px，纵向中心约 36px）
      const x = 7 + Math.random() * 30;
      p.style.cssText = 'position:absolute;left:' + x + 'px;bottom:36px;width:' + size + 'px;height:' + size +
        'px;border-radius:50%;background:var(--primary,#2563eb);box-shadow:0 0 8px var(--primary,#2563eb);';
      container.appendChild(p);
      const dur = 800 + Math.random() * 900;
      const drift = (Math.random() - 0.5) * 40;
      p.animate(
        [
          { transform: 'translate(0,0) scale(1)', opacity: 1 },
          { transform: 'translate(' + drift.toFixed(1) + 'px,-105px) scale(0.25)', opacity: 0 }
        ],
        { duration: dur, easing: 'ease-out' }
      );
      setTimeout(() => p.remove(), dur);
    }, 170);
  };

  musicState.audio.addEventListener('play', startParticles);
  musicState.audio.addEventListener('pause', stopParticles);
  musicState.audio.addEventListener('ended', stopParticles);
}
