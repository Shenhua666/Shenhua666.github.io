// 确保在DOM加载完成后执行
        document.addEventListener('DOMContentLoaded', function() {
            // 设备类型检测
            function isMobileDevice() {
                return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            }
            
            // 获取DOM元素
            const wechatBtn = document.querySelector('.wechat-QR');
            const wechatBubble = document.querySelector('.wechat-bubble');
            const mobileRedirect = document.querySelector('.mobile-redirect');
            const redirectBtn = document.getElementById('wechat-redirect-btn');
            const copyAccountBtn = document.getElementById('copy-account-btn');
            const copySuccessMsg = document.getElementById('copy-success-msg');
            const themeToggle = document.querySelector('.theme-toggle');
            const testBtn = document.getElementById('test-btn');
            const successMsg = document.getElementById('success-msg');
            
            let isDarkMode = false;
            
            if (wechatBtn) {
                // 微信公众号气泡功能
                wechatBtn.addEventListener('click', function(e) {
                    e.stopPropagation(); // 阻止事件冒泡
                    
                    if (isMobileDevice()) {
                        // 移动设备 - 显示跳转提示
                        mobileRedirect.classList.add('show');
                    } else {
                        // PC设备 - 显示气泡
                        wechatBubble.classList.toggle('show');
                    }
                });
            }
            
            if (redirectBtn) {
                // 移动端跳转按钮
                redirectBtn.addEventListener('click', function(e) {
                    // 关闭提示层
                    mobileRedirect.classList.remove('show');
                });
            }
            
            // 复制公众号名称功能
            if (copyAccountBtn) {
                copyAccountBtn.addEventListener('click', function() {
                    navigator.clipboard.writeText('灭天神话666的小基地')
                        .then(() => {
                            copySuccessMsg.style.display = 'block';
                            setTimeout(() => {
                                copySuccessMsg.style.display = 'none';
                            }, 3000);
                        })
                        .catch(err => {
                            alert('复制失败，请手动复制：灭天神话666的小基地');
                        });
                });
            }
            // 主题切换功能
            themeToggle.addEventListener('click', function() {
                if (isDarkMode) {
                    document.documentElement.removeAttribute('data-theme');
                    themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
                    isDarkMode = false;
                } else {
                    document.documentElement.setAttribute('data-theme', 'dark');
                    themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
                    isDarkMode = true;
                }
            });
            
            // 点击气泡外部关闭气泡
            document.addEventListener('click', function(e) {
                if (wechatBubble && !wechatBtn.contains(e.target) && !wechatBubble.contains(e.target)) {
                    wechatBubble.classList.remove('show');
                }
                
                // 点击移动提示层外部关闭
                if (mobileRedirect.classList.contains('show') && 
                    !document.querySelector('.redirect-content').contains(e.target)) {
                    mobileRedirect.classList.remove('show');
                }
            });
        });