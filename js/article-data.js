const articlesConfig = {
            articles: [
                {
                    id: 5,
                    title: "NatFrp内网穿透实现我的世界联机", 
                    summary: "使用NatFrp实现我的世界联机，无需公网IP。详细教程介绍如何配置和使用NatFrp进行内网穿透，实现低延迟的Minecraft联机体验。",
                    image: "md/004/natfrp.png",
                    date: "2025-06-09",
                    url: "https://blog.mietianshenhua.online/2025/06/09/natfrp%E8%81%94%E6%9C%BA%E6%95%99%E7%A8%8B/"
                },
                {
                    id: 4,
                    title: "IPv6公网联机教程",
                    summary: "Minecraft IPv6公网联机教程：操作简单，未来已来，低延迟联机新方案！本教程详细介绍如何利用IPv6公网地址实现Minecraft联机，无需第三方工具。",
                    image: "md/003/ipv6.png",
                    date: "2025-05-25",
                    url: "https://blog.mietianshenhua.online/2025/05/25/IPv6%E5%85%AC%E7%BD%91%E8%81%94%E6%9C%BA/"
                },
                {
                    id: 3,
                    title: "IPv4公网联机教程", 
                    summary: "Minecraft IPv4公网联机教程：稳定低延迟的联机方式。本教程指导你如何通过IPv4公网IP实现Minecraft服务器搭建和远程联机。",
                    image: "md/002/ipv4.png",
                    date: "2025-05-24",
                    url: "https://blog.mietianshenhua.online/2025/05/24/IPv4%E5%85%AC%E7%BD%91%E8%81%94%E6%9C%BA/"
                },
                {
                    id: 2,
                    title: "关于Forge的下载和安装",
                    summary: "详细教程介绍如何下载Forge并安装到客户端或服务器中。包含常见问题解决和版本选择建议。",
                    image: "md/001/forge.png",
                    date: "2025-02-02",
                    url: "https://www.bilibili.com/opus/339053862336318094"
                },
                {
                    id: 1,
                    title: "Windows的安装教程",
                    summary: "新手小白都能看得懂的装系统教程。从制作启动盘到系统安装，一步步指导你完成Windows系统的安装过程。",
                    image: "md/000/win.png",
                    date: "2022-10-27",
                    url: "https://blog.mietianshenhua.online/2022/10/27/Windows%E7%9A%84%E5%AE%89%E8%A3%85/"
                }
            ]
        };
        
        // 确保DOM完全加载后初始化
        document.addEventListener('DOMContentLoaded', () => {
            console.log('DOM fully loaded and parsed');
            initHomePage();
            
            // 添加导航切换事件
            document.querySelectorAll('.nav-item').forEach(item => {
                item.addEventListener('click', function() {
                    // 更新激活状态
                    document.querySelectorAll('.nav-item').forEach(el => {
                        el.classList.remove('active');
                    });
                    this.classList.add('active');
                    
                    // 如果点击的是首页，重新渲染文章
                    if (this.textContent === '首页') {
                        renderArticles();
                    }
                });
            });
        });
        
        // 初始化主页
        function initHomePage() {
            console.log('Initializing home page...');
            
            const articlesContainer = document.querySelector('.articles-container');
            if (!articlesContainer) {
                console.error('Articles container not found!');
                return;
            }
            
            // 立即渲染文章内容
            renderArticles();
            
            // 添加滚动到底部检测
            articlesContainer.addEventListener('scroll', function() {
                const { scrollTop, scrollHeight, clientHeight } = this;
                const isAtBottom = scrollHeight - scrollTop <= clientHeight + 5;
                
                if (isAtBottom) {
                    this.classList.add('at-bottom');
                    setTimeout(() => this.classList.remove('at-bottom'), 500);
                }
            });
            
            // 延迟加载其他内容确保文章优先显示
            setTimeout(() => {
                console.log('Loading additional content...');
                // 这里可以加载其他内容
            }, 100);
        }
        
        // 渲染文章列表
        function createArticleElement(article, isEven) {
            const articleElement = document.createElement('div');
            articleElement.className = `article ${isEven ? 'even' : 'odd'}`;
            articleElement.dataset.id = article.id;
            
            // 使用模板字符串创建文章内容
            articleElement.innerHTML = `
                <div class="article-image">
                    <img src="${article.image}" alt="${article.title}" 
                         onerror="this.src='data:image/svg+xml;charset=utf-8,%3Csvg xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22 width%3D%22800%22 height%3D%22400%22 viewBox%3D%220 0 800 400%22%3E%3Crect fill%3D%22%23f0f0f0%22 width%3D%22800%22 height%3D%22400%22%2F%3E%3Ctext fill%3D%22%23999%22 font-family%3D%22Arial%22 font-size%3D%2240%22 x%3D%22400%22 y%3D%22200%22 text-anchor%3D%22middle%22 dominant-baseline%3D%22middle%22%3E图片加载失败%3C%2Ftext%3E%3C%2Fsvg%3E'">
                </div>
                <div class="article-content">
                    <h3>${article.title}</h3>
                    <p>${article.summary}</p>
                    <div class="article-meta">
                        <span><i class="far fa-calendar"></i> ${article.date}</span>
                    </div>
                </div>
            `;
            
            // 根据奇偶设置不同布局
            articleElement.style.flexDirection = isEven ? 'row' : 'row-reverse';
            
            return articleElement;
        }
        
        function renderArticles() {
            console.log('Rendering articles...');
            const articlesContainer = document.querySelector('.articles-container');
            
            if (articlesContainer) {
                // 临时显示加载状态
                articlesContainer.innerHTML = `
                    <div class="loading-container">
                        <div class="loading-spinner"></div>
                        <p>正在加载文章内容...</p>
                    </div>
                `;
                
                // 短暂延迟后渲染实际内容（模拟网络请求）
                setTimeout(() => {
                    if (articlesConfig.articles && articlesConfig.articles.length > 0) {
                        articlesContainer.innerHTML = '';
                        
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
                        
                        console.log('Articles rendered successfully');
                    } else {
                        // 没有文章时显示提示
                        articlesContainer.innerHTML = `
                            <div class="empty-placeholder">
                                <i class="fas fa-exclamation-triangle" style="font-size: 3rem;"></i>
                                <h3>暂无文章内容</h3>
                                <p>请稍后再试或联系管理员</p>
                            </div>
                        `;
                        console.warn('No articles to render!');
                    }
                }, 300); // 模拟网络延迟
            } else {
                console.error('Articles container not found during rendering!');
            }
        }
        
        // 强制重新加载文章（用于调试）
        function forceReloadArticles() {
            console.log('Force reloading articles...');
            renderArticles();
        }
        
        // 添加缓存清除参数（防止GitHub缓存）
        const cacheBuster = '?v=' + new Date().getTime();
        document.querySelectorAll('script').forEach(script => {
            if (script.src) {
                script.src += cacheBuster;
            }
        });