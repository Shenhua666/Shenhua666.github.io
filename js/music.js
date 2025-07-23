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
