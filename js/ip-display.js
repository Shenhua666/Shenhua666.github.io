// 访问 IP 信息展示（多个备用 API，自动降级）
function isLocalEnvironment() {
  const h = window.location.hostname;
  return h === 'localhost' || h === '127.0.0.1' || h === '[::1]' ||
    h.startsWith('192.168.') || h.startsWith('10.') ||
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(h);
}

// 根据 IP 字符串判断 IPv4 / IPv6
function detectIpVersion(ip) {
  if (!ip || ip === '未知') return '未知';
  if (ip.indexOf(':') !== -1) return 'IPv6';
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(ip)) return 'IPv4';
  return '未知';
}

// 本地环境下的协议判定（127.0.0.1 -> IPv4，[::1] -> IPv6）
function localIpType() {
  const h = window.location.hostname;
  return h.indexOf(':') !== -1 ? 'IPv6 (内网)' : 'IPv4 (内网)';
}

document.addEventListener('DOMContentLoaded', fetchIPInfo);

function fetchIPInfo() {
  const container = document.getElementById('ipContainer');
  if (!container) return;

  if (isLocalEnvironment()) {
    setTimeout(() => {
      container.innerHTML =
        item('network', 'IP地址', '内网访问') +
        item('globe', '网络类型', localIpType()) +
        item('mapPin', '位置', '本地调试环境') +
        item('server', '运营商', '本地网络');
    }, 500);
    return;
  }

  const apis = [
    { url: 'https://ipapi.co/json/', name: 'ipapi.co' },
    { url: 'https://ipinfo.io/json', name: 'ipinfo.io' },
    { url: 'https://freeipapi.com/api/json', name: 'freeipapi.com' },
    { url: 'https://api.ipgeolocation.io/ipgeo?apiKey=demo', name: 'ipgeolocation.io' }
  ];

  let idx = 0;
  const next = () => {
    if (idx >= apis.length) {
      container.innerHTML = `<div class="error">${window.ICONS.alert}<div>无法获取 IP 信息，请检查网络后刷新</div></div>`;
      return;
    }
    const api = apis[idx++];
    fetch(api.url)
      .then((r) => { if (!r.ok) throw new Error('bad'); return r.json(); })
      .then((data) => {
        const ip = data.ip || data.IPv4 || '未知';
        let region = data.city || data.region || data.region_name || data.state || '';
        const country = data.country_name || data.country || '';
        if (region && country) region = region + ', ' + country;
        else if (!region) region = country || '未知';
        const isp = data.org || data.isp || (data.asn && data.asn.org) || '未知';
        const versionRaw = data.version || data.ipVersion;
        const ipType = versionRaw ? 'IPv' + versionRaw : detectIpVersion(ip);

        container.innerHTML =
          item('network', 'IP地址', ip) +
          item('globe', '网络类型', ipType) +
          item('mapPin', '位置', region) +
          item('server', '运营商', isp) +
          `<div class="api-status"><span class="status-indicator status-active"></span>数据来源：${api.name}</div>`;
      })
      .catch(() => next());
  };
  next();
}

function item(icon, label, value) {
  return `<div class="info-item"><div class="info-label">${window.ICONS[icon] || ''}${label}</div><div class="info-value">${value}</div></div>`;
}
