// 访问 IP 信息展示：IPv4 / IPv6 双栈探测 + 中文归属地
// 行顺序：网络类型 → IPv4 → IPv6 → 位置 → 运营商
(function () {
  'use strict';

  const state = {
    v4: { done: false, ip: null },
    v6: { done: false, ip: null },
    geo: { done: false, loc: '', isp: '', source: '' }
  };

  // ---------- 探测接口 ----------
  // 每个接口都必须是「只回某一代地址」的，否则无法区分 IPv4 / IPv6
  const V4_APIS = [
    { url: 'https://ipv4.icanhazip.com', json: false, pick: (t) => t },
    { url: 'https://v4.ident.me/.json', json: true, pick: (d) => d.address }
  ];
  const V6_APIS = [
    { url: 'https://ipv6.icanhazip.com', json: false, pick: (t) => t },
    { url: 'https://v6.ident.me/.json', json: true, pick: (d) => d.address },
    { url: 'https://api6.ipify.org?format=json', json: true, pick: (d) => d.ip }
  ];

  // 归属地接口：zxinc 为中文库（国内精度更好），其余为国际通用备用
  const GEO_APIS = [
    {
      name: 'ip.zxinc.org',
      url: (ip) => 'https://ip.zxinc.org/api.php?type=json' + (ip ? '&ip=' + encodeURIComponent(ip) : ''),
      parse: (d) => {
        const g = d && d.data;
        if (!g) return null;
        return {
          loc: String(g.country || '').split(/[\u2013\u2014\-\t]+/).filter(Boolean).join(' '),
          isp: String(g.local || '').split(/\t+/).filter(Boolean)[0] || '',
          ip: (g.ip && g.ip.query) || g.myip || ''
        };
      }
    },
    {
      name: 'ipinfo.io',
      url: () => 'https://ipinfo.io/json',
      parse: (d) => ({
        loc: [d.city, d.region, d.country].filter(Boolean).join(', '),
        isp: d.org || '',
        ip: d.ip || ''
      })
    },
    {
      name: 'freeipapi.com',
      url: () => 'https://freeipapi.com/api/json',
      parse: (d) => ({
        loc: [d.cityName, d.regionName, d.countryName].filter(Boolean).join(', '),
        isp: d.asnOrganization || '',
        ip: d.ipAddress || ''
      })
    },
    {
      name: 'ipapi.co',
      url: () => 'https://ipapi.co/json/',
      parse: (d) => ({
        loc: [d.city, d.region, d.country_name].filter(Boolean).join(', '),
        isp: d.org || '',
        ip: d.ip || ''
      })
    }
  ];

  // ---------- 工具 ----------
  function detectIpVersion(ip) {
    if (!ip) return '未知';
    if (ip.indexOf(':') !== -1) return 'IPv6';
    if (/^\d{1,3}(\.\d{1,3}){3}$/.test(ip)) return 'IPv4';
    return '未知';
  }

  function fetchWithTimeout(url, json, timeout) {
    const ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const timer = ctrl ? setTimeout(() => ctrl.abort(), timeout || 5000) : null;
    return fetch(url, ctrl ? { signal: ctrl.signal, cache: 'no-store' } : { cache: 'no-store' })
      .then((r) => {
        if (!r.ok) throw new Error('bad');
        return json ? r.json() : r.text();
      })
      .finally(() => { if (timer) clearTimeout(timer); });
  }

  // 按顺序尝试一组接口，第一个返回指定版本地址的胜出
  function probe(apis, version, done) {
    let i = 0;
    const next = () => {
      if (i >= apis.length) { done(null); return; }
      const api = apis[i++];
      fetchWithTimeout(api.url, api.json, 4000)
        .then((res) => {
          const ip = String(api.pick(res) || '').trim();
          if (detectIpVersion(ip) !== version) throw new Error('version-mismatch');
          done(ip);
        })
        .catch(() => next());
    };
    next();
  }

  // ---------- 渲染 ----------
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  }

  function row(icon, label, value, cls) {
    const ic = (window.ICONS && window.ICONS[icon]) || '';
    return `<div class="info-item"><div class="info-label">${ic}${label}</div>` +
      `<div class="info-value${cls ? ' ' + cls : ''}">${value}</div></div>`;
  }

  function netTypeText() {
    const v4 = state.v4.ip, v6 = state.v6.ip;
    if (v4 && v6) return 'IPv4 + IPv6';
    if (v4) return 'IPv4';
    if (v6) return 'IPv6';
    if (!state.v4.done || !state.v6.done) return '检测中…';
    return '未知';
  }

  function addrCell(rec, extraCls) {
    if (!rec.done) return { text: '检测中…', cls: 'pending' + (extraCls ? ' ' + extraCls : '') };
    if (!rec.ip) return { text: '未检测到', cls: 'muted' + (extraCls ? ' ' + extraCls : '') };
    return { text: rec.ip, cls: extraCls || '' };
  }

  function render() {
    const box = document.getElementById('ipContainer');
    if (!box) return;

    const v4 = addrCell(state.v4);
    const v6 = addrCell(state.v6, 'ipv6');
    const geoDone = state.geo.done;

    box.innerHTML =
      row('globe', '网络类型', netTypeText()) +
      row('network', 'IPv4', esc(v4.text), v4.cls) +
      row('network', 'IPv6', esc(v6.text), v6.cls) +
      row('mapPin', '位置', geoDone ? esc(state.geo.loc || '未知') : '检测中…', geoDone ? '' : 'pending') +
      row('server', '运营商', geoDone ? esc(state.geo.isp || '未知') : '检测中…', geoDone ? '' : 'pending') +
      (state.geo.source
        ? `<div class="api-status"><span class="status-indicator status-active"></span>数据来源：${esc(state.geo.source)}</div>`
        : '');
  }

  function renderError() {
    const box = document.getElementById('ipContainer');
    if (!box) return;
    box.innerHTML = `<div class="error">${(window.ICONS && window.ICONS.alert) || ''}<div>无法获取 IP 信息，请检查网络后刷新</div></div>`;
  }

  // ---------- 归属地 ----------
  function startGeo() {
    // 优先按已探到的 IPv4 查询，保证「位置」与上面的 IPv4 是同一个地址
    const target = state.v4.ip || state.v6.ip || '';
    let i = 0;
    const next = () => {
      if (i >= GEO_APIS.length) {
        state.geo.done = true;
        if (!state.v4.ip && !state.v6.ip) { renderError(); return; }
        render();
        return;
      }
      const api = GEO_APIS[i++];
      fetchWithTimeout(api.url(target), true, 5000)
        .then((data) => {
          const g = api.parse(data);
          if (!g || !g.loc) throw new Error('empty');
          state.geo = { done: true, loc: g.loc, isp: g.isp, source: api.name };
          render();
        })
        .catch(() => next());
    };
    next();
  }

  // ---------- 入口 ----------
  function init() {
    if (!document.getElementById('ipContainer')) return;
    render();

    probe(V4_APIS, 'IPv4', (ip) => {
      state.v4 = { done: true, ip };
      render();
      startGeo();          // IPv4 结果出来后立刻查归属地，避免与 IPv6 结果错位
    });

    probe(V6_APIS, 'IPv6', (ip) => {
      state.v6 = { done: true, ip };
      render();
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
