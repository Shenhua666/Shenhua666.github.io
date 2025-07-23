// 判断是否为本地环境
function isLocalEnvironment() {
    const hostname = window.location.hostname;
    // 检测常见本地地址
    return hostname === 'localhost' || 
           hostname === '127.0.0.1' || 
           hostname === '[::1]' ||
           hostname.startsWith('192.168.') ||
           hostname.startsWith('10.') ||
           /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(hostname);
}

// 获取IP信息
function fetchIPInfo() {
    const ipContainer = document.getElementById('ipContainer');
    if (!ipContainer) return;

    // 检查本地环境
    if (isLocalEnvironment()) {
        setTimeout(() => {
            ipContainer.innerHTML = `
                <div class="local-info">
                    <div class="info-item">
                        <div class="info-label"><i class="fas fa-laptop-code"></i> IP地址</div>
                        <div class="info-value">内网访问</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label"><i class="fas fa-map-marker-alt"></i> 位置</div>
                        <div class="info-value">本地调试环境</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label"><i class="fas fa-server"></i> 运营商</div>
                        <div class="info-value">本地网络</div>
                    </div>
                </div>
            `;
        }, 800);
        return;
    }

    // 使用多个备用API
    const apis = [
        {
            url: 'https://ipapi.co/json/',
            name: 'ipapi.co'
        },
        {
            url: 'https://ipinfo.io/json',
            name: 'ipinfo.io'
        },
        {
            url: 'https://freeipapi.com/api/json',
            name: 'freeipapi.com'
        },
        {
            url: 'https://api.ipgeolocation.io/ipgeo?apiKey=demo',
            name: 'ipgeolocation.io'
        }
    ];

    let currentApiIndex = 0;
    
    const tryNextApi = () => {
        if (currentApiIndex >= apis.length) {
            // 所有API都尝试失败
            ipContainer.innerHTML = `
                <div class="error">
                    <i class="fas fa-exclamation-triangle"></i>
                    <div>无法获取IP信息</div>
                    <p style="margin-top:10px;font-size:0.9rem">所有API请求均失败，请检查网络或稍后再试</p>
                </div>
            `;
            return;
        }
        
        const api = apis[currentApiIndex];
        currentApiIndex++;
        
        fetch(api.url)
            .then(response => {
                if (!response.ok) throw new Error('API响应错误');
                return response.json();
            })
            .then(data => {
                // 解析不同API返回的数据结构
                const ip = data.ip || data.IPv4 || '未知';
                let city = data.city || '未知';
                let region = data.region || data.region_name || data.state || '未知';
                const country = data.country_name || data.country || '未知';
                const isp = data.org || data.isp || data.asn?.org || '未知';
                
                // 处理位置信息
                if (data.city && data.region && data.country) {
                    region = `${data.city}, ${data.region}, ${data.country}`;
                } else if (data.country) {
                    region = `${city}, ${country}`;
                }
                
                // 更新UI显示IP信息
                ipContainer.innerHTML = `
                    <div class="info-item">
                        <div class="info-label"><i class="fas fa-network-wired"></i> IP地址：</div>
                        <div class="info-value">${ip}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label"><i class="fas fa-map-marker-alt"></i> 位置：</div>
                        <div class="info-value">${region}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label"><i class="fas fa-server"></i> 运营商：</div>
                        <div class="info-value">${isp}</div>
                    </div>
                `;
                
                // 更新API状态显示
                updateApiStatus(api.name, true);
            })
            .catch(error => {
                console.warn(`API ${api.name} 请求失败:`, error);
                updateApiStatus(api.name, false);
                tryNextApi(); // 尝试下一个API
            });
    };

    // 开始尝试第一个API
    tryNextApi();
}

// 更新API状态显示
function updateApiStatus(apiName, isActive) {
    const statusContainer = document.querySelector('.info-card:nth-child(2) p');
    if (!statusContainer) return;
    
    const statusElement = document.createElement('div');
    statusElement.className = 'api-status';
    
    const indicator = document.createElement('span');
    indicator.className = `status-indicator ${isActive ? 'status-active' : 'status-inactive'}`;
    
    const text = document.createElement('span');
    text.textContent = `${apiName}: ${isActive ? '正常' : '失败'}`;
    
    statusElement.appendChild(indicator);
    statusElement.appendChild(text);
    
    // 添加到状态容器中
    statusContainer.parentNode.insertBefore(statusElement, statusContainer.nextSibling);
}

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', fetchIPInfo);