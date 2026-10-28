/* ============================================================
   festival.js — 节日皮肤引擎
   ------------------------------------------------------------
   作用：读取访问者电脑/手机的系统时间，自动匹配当天所属的节日，
        并给全站套上对应的「皮肤」（主题色 + 氛围粒子 + 悬挂装饰）。

   设计原则：
     1. 只做叠加：所有装饰都是 position:fixed 的独立图层，
        pointer-events:none，不参与文档流 —— 绝不改变原有布局。
     2. 只改颜色变量：主色 / 点缀色通过 CSS 变量注入，
        卡片、按钮、导航的内边距与尺寸一律不动。
     3. 可开关：左下角音乐按钮上方有个节日小圆钮，点一下关、再点一下开，
        开关状态记在 localStorage 里，刷新后仍然保持，随时可以反悔。

   调试方法（临时预览某个节日，不影响自动判断）：
     index.html?festival=halloween       强制套用万圣节皮肤
     index.html?festival=off             临时关闭（不写入本地存储）
     控制台 FestivalSkin.list            查看全部节日
     控制台 FestivalSkin.apply('spring') 手动切换
     控制台 FestivalSkin.toggle()        开关当前皮肤
   ============================================================ */
(function () {
  'use strict';

  /* ==========================================================
     一、农历换算（1980–2050，足够覆盖当前与未来若干年）
     每个数字按位编码该农历年的月大小与闰月，标准万年历算法。
     ========================================================== */
  var LUNAR_BASE = 1980;
  var LUNAR_INFO = [
    0x095b0, 0x049b0, 0x0a974, 0x0a4b0, 0x0b27a, 0x06a50, 0x06d40, 0x0af46, 0x0ab60, 0x09570, // 1980-1989
    0x04af5, 0x04970, 0x064b0, 0x074a3, 0x0ea50, 0x06b58, 0x05ac0, 0x0ab60, 0x096d5, 0x092e0, // 1990-1999
    0x0c960, 0x0d954, 0x0d4a0, 0x0da50, 0x07552, 0x056a0, 0x0abb7, 0x025d0, 0x092d0, 0x0cab5, // 2000-2009
    0x0a950, 0x0b4a0, 0x0baa4, 0x0ad50, 0x055d9, 0x04ba0, 0x0a5b0, 0x15176, 0x052b0, 0x0a930, // 2010-2019
    0x07954, 0x06aa0, 0x0ad50, 0x05b52, 0x04b60, 0x0a6e6, 0x0a4e0, 0x0d260, 0x0ea65, 0x0d530, // 2020-2029
    0x05aa0, 0x076a3, 0x096d0, 0x04afb, 0x04ad0, 0x0a4d0, 0x1d0b6, 0x0d250, 0x0d520, 0x0dd45, // 2030-2039
    0x0b5a0, 0x056d0, 0x055b2, 0x049b0, 0x0a577, 0x0a4b0, 0x0aa50, 0x1b255, 0x06d20, 0x0ada0, // 2040-2049
    0x14b63                                                                                    // 2050
  ];

  function lunarInfo(y) { return LUNAR_INFO[y - LUNAR_BASE]; }
  function leapMonth(y) { return lunarInfo(y) & 0xf; }
  function leapDays(y) { return leapMonth(y) ? ((lunarInfo(y) & 0x10000) ? 30 : 29) : 0; }
  function monthDays(y, m) { return (lunarInfo(y) & (0x10000 >> m)) ? 30 : 29; }
  function yearDays(y) {
    var sum = 348;
    for (var i = 0x8000; i > 0x8; i >>= 1) sum += (lunarInfo(y) & i) ? 1 : 0;
    return sum + leapDays(y);
  }

  // 农历 → 公历（1980-02-16 为农历 1980 年正月初一）
  function lunar2solar(y, m, d) {
    if (y < LUNAR_BASE || y > 2050) return null;
    var offset = 0, i;
    for (i = LUNAR_BASE; i < y; i++) offset += yearDays(i);
    var leap = leapMonth(y);
    for (i = 1; i < m; i++) offset += monthDays(y, i);
    if (leap > 0 && m > leap) offset += leapDays(y);
    offset += d - 1;
    return new Date(1980, 1, 16 + offset);
  }

  // 公历 → 农历（返回 {y, m, d, leap}）
  function solar2lunar(date) {
    var offset = Math.round(
      (Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) - Date.UTC(1980, 1, 16)) / 86400000
    );
    if (offset < 0) return null;
    var y = LUNAR_BASE, i, temp = 0;
    for (i = LUNAR_BASE; offset > 0 && i <= 2050; i++) { temp = yearDays(i); offset -= temp; }
    if (offset < 0) { offset += temp; i--; }
    y = i;
    var leap = leapMonth(y), isLeap = false;
    for (i = 1; i < 13 && offset > 0; i++) {
      if (leap > 0 && i === leap + 1 && !isLeap) { --i; isLeap = true; temp = leapDays(y); }
      else { temp = monthDays(y, i); }
      if (isLeap && i === leap + 1) isLeap = false;
      offset -= temp;
    }
    if (offset === 0 && leap > 0 && i === leap + 1) {
      if (isLeap) { isLeap = false; } else { isLeap = true; --i; }
    }
    if (offset < 0) { offset += temp; --i; }
    return { y: y, m: i, d: offset + 1, leap: isLeap };
  }

  /* ---------- 日期小工具 ---------- */
  function day(y, m, d) { return new Date(y, m - 1, d); }
  function plus(date, n) { return new Date(date.getFullYear(), date.getMonth(), date.getDate() + n); }
  function nthWeekday(y, m, weekday, n) {
    var first = new Date(y, m - 1, 1);
    var delta = (weekday - first.getDay() + 7) % 7;
    return new Date(y, m - 1, 1 + delta + (n - 1) * 7);
  }
  // 清明：21 世纪通用公式有例外年，这里直接用 2000-2049 的实测表
  var QINGMING = [
    4, 5, 5, 5, 4, 5, 5, 5, 4, 4, // 2000-2009
    5, 5, 4, 4, 5, 5, 4, 4, 5, 5, // 2010-2019
    4, 4, 5, 5, 4, 4, 5, 5, 4, 4, // 2020-2029
    5, 5, 4, 4, 5, 5, 4, 4, 5, 5, // 2030-2039
    4, 4, 5, 5, 4, 4, 5, 5, 4, 4  // 2040-2049
  ];
  function qingmingDay(y) { return QINGMING[y - 2000] || 4; }

  /* ==========================================================
     二、节日表
     span(y) 返回该节日在 y 年的 [起, 止]（含首尾，公历 Date）
     数组顺序 = 优先级，越靠前越优先（节日重叠时先匹配到谁就是谁）
     ========================================================== */
  var FESTIVALS = [
    {
      id: 'spring', name: '春节', emoji: '🧧', greet: '新春大吉，万事顺意',
      mode: 'fall', count: 15, items: ['🧧', '🏮', '✨', '🧨', '🪙'],
      hang: '🏮',
      light: ['#dc2626', '#b91c1c', '#f59e0b'],
      dark: ['#f87171', '#ef4444', '#fbbf24'],
      span: function (y) { var s = lunar2solar(y, 1, 1); return s ? [plus(s, -1), plus(s, 5)] : null; }
    },
    {
      id: 'lantern', name: '元宵节', emoji: '🏮', greet: '元宵团圆，灯火可亲',
      mode: 'rise', count: 14, items: ['🏮', '✨', '🌕'],
      hang: '🏮',
      light: ['#ea580c', '#c2410c', '#eab308'],
      dark: ['#fb923c', '#f97316', '#facc15'],
      span: function (y) {
        var s = lunar2solar(y, 1, 14), e = lunar2solar(y, 1, 16);
        return s ? [s, e] : null;
      }
    },
    {
      id: 'laba', name: '腊八节', emoji: '🥣', greet: '腊八粥暖，年味渐浓',
      mode: 'fall', count: 12, items: ['🥣', '🌾', '❄️'],
      light: ['#b45309', '#92400e', '#ea580c'],
      dark: ['#fbbf24', '#f59e0b', '#fb923c'],
      span: function (y) { var s = lunar2solar(y, 12, 8); return s ? [s, s] : null; }
    },
    {
      id: 'newyear', name: '元旦', emoji: '🎊', greet: '新年快乐，诸事顺遂',
      mode: 'fall', count: 16, items: ['🎊', '🎉', '✨', '⭐'],
      light: ['#e11d48', '#be123c', '#f59e0b'],
      dark: ['#fb7185', '#f43f5e', '#fbbf24'],
      span: function (y) { return [day(y - 1, 12, 31), day(y, 1, 2)]; }
    },
    {
      id: 'valentine', name: '情人节', emoji: '💗', greet: '愿你被温柔以待',
      mode: 'fall', count: 14, items: ['💗', '💕', '🌹', '✨'],
      light: ['#e11d48', '#be123c', '#fb7185'],
      dark: ['#fb7185', '#f43f5e', '#fda4af'],
      span: function (y) { var d = day(y, 2, 14); return [d, d]; }
    },
    {
      id: 'chongyang', name: '重阳节', emoji: '🌼', greet: '九九重阳，久久安康',
      mode: 'fall', count: 12, items: ['🌼', '🍂', '✨'],
      light: ['#ca8a04', '#a16207', '#f59e0b'],
      dark: ['#facc15', '#eab308', '#fbbf24'],
      span: function (y) { var d = lunar2solar(y, 9, 9); return d ? [d, d] : null; }
    },
    {
      id: 'midautumn', name: '中秋节', emoji: '🌕', greet: '月圆人圆，中秋快乐',
      mode: 'fall', count: 14, items: ['🌕', '🥮', '✨', '🏮'],
      hang: '🏮',
      light: ['#b45309', '#92400e', '#eab308'],
      dark: ['#fbbf24', '#f59e0b', '#fde047'],
      span: function (y) {
        var s = lunar2solar(y, 8, 14), e = lunar2solar(y, 8, 16);
        return s ? [s, e] : null;
      }
    },
    {
      id: 'national', name: '国庆节', emoji: '🎆', greet: '祝祖国繁荣昌盛',
      mode: 'fall', count: 15, items: ['⭐', '🎆', '✨', '🎉'],
      light: ['#dc2626', '#b91c1c', '#f59e0b'],
      dark: ['#f87171', '#ef4444', '#fbbf24'],
      span: function (y) { return [day(y, 10, 1), day(y, 10, 7)]; }
    },
    {
      id: 'halloween', name: '万圣节', emoji: '🎃', greet: '不给糖就捣蛋',
      mode: 'fall', count: 14, items: ['🎃', '🦇', '👻', '🕸️', '🍬', '💀'],
      light: ['#ea580c', '#c2410c', '#a855f7'],
      dark: ['#fb923c', '#f97316', '#c084fc'],
      span: function (y) { return [day(y, 10, 25), day(y, 10, 31)]; }
    },
    {
      id: 'christmas', name: '圣诞节', emoji: '🎄', greet: '圣诞快乐，平安喜乐',
      mode: 'fall', count: 15, items: ['❄️', '🎄', '🎁', '⭐'],
      hang: '🔔',
      light: ['#dc2626', '#b91c1c', '#16a34a'],
      dark: ['#f87171', '#ef4444', '#4ade80'],
      span: function (y) { return [day(y, 12, 24), day(y, 12, 25)]; }
    },
    {
      id: 'labor', name: '劳动节', emoji: '🛠️', greet: '劳动最光荣',
      mode: 'fall', count: 14, items: ['⭐', '🔧', '✨', '🛠️'],
      light: ['#ea580c', '#c2410c', '#f59e0b'],
      dark: ['#fb923c', '#f97316', '#fbbf24'],
      span: function (y) { return [day(y, 5, 1), day(y, 5, 5)]; }
    },
    {
      id: 'qingming', name: '清明节', emoji: '🌿', greet: '清明时节，慎终追远',
      mode: 'fall', count: 12, items: ['🌿', '🍃', '💧'],
      light: ['#059669', '#047857', '#34d399'],
      dark: ['#34d399', '#10b981', '#6ee7b7'],
      span: function (y) {
        var d = day(y, 4, qingmingDay(y));
        return [plus(d, -1), plus(d, 1)];
      }
    },
    {
      id: 'dragon', name: '端午节', emoji: '🐲', greet: '端午安康',
      mode: 'fall', count: 12, items: ['🐲', '🍃', '🫔'],
      light: ['#15803d', '#166534', '#84cc16'],
      dark: ['#4ade80', '#22c55e', '#a3e635'],
      span: function (y) { var d = lunar2solar(y, 5, 5); return d ? [d, d] : null; }
    },
    {
      id: 'children', name: '儿童节', emoji: '🎈', greet: '童心未泯，快乐常在',
      mode: 'rise', count: 14, items: ['🎈', '🎠', '⭐', '🍭'],
      light: ['#0ea5e9', '#0284c7', '#f472b6'],
      dark: ['#38bdf8', '#0ea5e9', '#f9a8d4'],
      span: function (y) { var d = day(y, 6, 1); return [d, d]; }
    },
    {
      id: 'qixi', name: '七夕', emoji: '💫', greet: '星河滚烫，七夕快乐',
      mode: 'twinkle', count: 16, items: ['✨', '💫', '💕'],
      light: ['#a21caf', '#86198f', '#f0abfc'],
      dark: ['#e879f9', '#d946ef', '#f5d0fe'],
      span: function (y) { var d = lunar2solar(y, 7, 7); return d ? [d, d] : null; }
    },
    {
      id: 'mother', name: '母亲节', emoji: '💐', greet: '妈妈，辛苦了',
      mode: 'fall', count: 12, items: ['💐', '🌸', '💗'],
      light: ['#db2777', '#be185d', '#f9a8d4'],
      dark: ['#f472b6', '#ec4899', '#fbcfe8'],
      span: function (y) { var d = nthWeekday(y, 5, 0, 2); return [d, d]; }
    },
    {
      id: 'father', name: '父亲节', emoji: '👔', greet: '老爸，节日快乐',
      mode: 'fall', count: 12, items: ['👔', '⭐', '🎁'],
      light: ['#1e40af', '#1e3a8a', '#38bdf8'],
      dark: ['#60a5fa', '#3b82f6', '#7dd3fc'],
      span: function (y) { var d = nthWeekday(y, 6, 0, 3); return [d, d]; }
    },
    {
      id: 'programmer', name: '程序员节', emoji: '💻', greet: '1024，代码无 bug',
      mode: 'fall', count: 14, items: ['💻', '⌨️', '🐛', '☕'],
      light: ['#0f766e', '#115e59', '#22d3ee'],
      dark: ['#2dd4bf', '#14b8a6', '#67e8f9'],
      span: function (y) { var d = day(y, 10, 24); return [d, d]; }
    },
    {
      id: 'singles', name: '双十一', emoji: '🛒', greet: '手别抖，购物车已就位',
      mode: 'fall', count: 14, items: ['🛒', '📦', '💸', '✨'],
      light: ['#db2777', '#be185d', '#f59e0b'],
      dark: ['#f472b6', '#ec4899', '#fbbf24'],
      span: function (y) { var d = day(y, 11, 11); return [d, d]; }
    },
    {
      id: 'aprilfool', name: '愚人节', emoji: '🤡', greet: '今天说的话都不算数',
      mode: 'fall', count: 14, items: ['🤡', '🎭', '🃏', '✨'],
      light: ['#7c3aed', '#6d28d9', '#22d3ee'],
      dark: ['#a78bfa', '#8b5cf6', '#67e8f9'],
      span: function (y) { var d = day(y, 4, 1); return [d, d]; }
    }
  ];

  /* ==========================================================
     三、匹配当天节日
     ========================================================== */
  function atMidnight(date) { return new Date(date.getFullYear(), date.getMonth(), date.getDate()); }

  function match(date) {
    var today = atMidnight(date), y = today.getFullYear();
    for (var i = 0; i < FESTIVALS.length; i++) {
      var f = FESTIVALS[i];
      for (var dy = -1; dy <= 1; dy++) {
        var span = null;
        try { span = f.span(y + dy); } catch (e) { span = null; }
        if (!span || !span[0] || !span[1]) continue;
        if (today >= atMidnight(span[0]) && today <= atMidnight(span[1])) {
          return { festival: f, start: atMidnight(span[0]), end: atMidnight(span[1]) };
        }
      }
    }
    return null;
  }

  /* ==========================================================
     四、颜色工具
     ========================================================== */
  function hex2rgb(hex) {
    var h = hex.replace('#', '');
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    var n = parseInt(h, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  function rgba(hex, a) { return 'rgba(' + hex2rgb(hex).join(', ') + ', ' + a + ')'; }

  var VARS = ['--primary', '--primary-2', '--primary-rgb', '--primary-soft',
    '--accent', '--accent-soft'];

  /* ==========================================================
     五、渲染
     ========================================================== */
  var state = { target: null, on: false };
  var layer = null;
  var btn = null;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var STORE_KEY = 'festival-skin-off';

  function paint(f) {
    var dark = document.documentElement.getAttribute('data-theme') === 'dark';
    var c = dark ? f.dark : f.light;
    var s = document.documentElement.style;
    s.setProperty('--primary', c[0]);
    s.setProperty('--primary-2', c[1]);
    s.setProperty('--primary-rgb', hex2rgb(c[0]).join(', '));
    s.setProperty('--primary-soft', rgba(c[0], dark ? 0.18 : 0.11));
    s.setProperty('--accent', c[2]);
    s.setProperty('--accent-soft', rgba(c[2], dark ? 0.18 : 0.13));
  }

  function unpaint() {
    var s = document.documentElement.style;
    for (var i = 0; i < VARS.length; i++) s.removeProperty(VARS[i]);
  }

  function makeParticle(f, i) {
    var span = document.createElement('span');
    span.className = 'fest-particle fest-' + f.mode;
    span.textContent = f.items[i % f.items.length];
    var scale = window.innerWidth < 640 ? 0.78 : 1;
    var size = (13 + Math.random() * 9) * scale;
    var dur = f.mode === 'fall' ? 9 + Math.random() * 9 : 12 + Math.random() * 9;
    var css = '--x:' + (Math.random() * 100).toFixed(2) + '%;'
      + '--size:' + size.toFixed(1) + 'px;'
      + '--dur:' + dur.toFixed(2) + 's;'
      + '--delay:-' + (Math.random() * 20).toFixed(2) + 's;'
      + '--drift:' + (Math.random() * 90 - 45).toFixed(0) + 'px;'
      + '--rot:' + (Math.random() * 720 - 360).toFixed(0) + 'deg;'
      + '--op:' + (0.40 + Math.random() * 0.35).toFixed(2) + ';';
    if (f.mode === 'twinkle') css += '--y:' + (4 + Math.random() * 88).toFixed(2) + '%;';
    span.style.cssText = css;
    return span;
  }

  /* ---------- 装饰图层（纯叠加，不参与文档流） ---------- */
  function buildLayer(f) {
    layer = document.createElement('div');
    layer.id = 'festival-layer';
    layer.setAttribute('aria-hidden', 'true');

    var glow = document.createElement('div');
    glow.className = 'fest-glow';
    layer.appendChild(glow);

    if (f.hang) {
      ['left', 'right'].forEach(function (side, idx) {
        var hang = document.createElement('div');
        hang.className = 'fest-hang fest-hang-' + side;
        hang.style.animationDelay = (idx * 0.6) + 's';
        var emoji = document.createElement('span');
        emoji.textContent = f.hang;
        hang.appendChild(emoji);
        layer.appendChild(hang);
      });
    }

    if (!reduced) {
      var n = window.innerWidth < 640 ? Math.min(8, f.count) : f.count;
      for (var i = 0; i < n; i++) layer.appendChild(makeParticle(f, i));
    }

    document.body.appendChild(layer);
  }

  function removeLayer() {
    if (layer && layer.parentNode) layer.parentNode.removeChild(layer);
    layer = null;
  }

  /* ---------- 开关按钮：叠在左下角音乐按钮正上方 ----------
     皮肤关闭后按钮仍然保留（变灰），再点一次即可恢复，
     所以这个开关始终是可逆的。 */
  function buildToggle(f) {
    if (!btn) {
      btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'fest-toggle';
      btn.setAttribute('aria-pressed', 'true');
      btn.innerHTML = '<span class="fest-toggle-emoji"></span>';
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        toggle();
      });
      document.body.appendChild(btn);
    }
    var emoji = btn.querySelector('.fest-toggle-emoji');
    if (emoji) emoji.textContent = f.emoji;
    syncToggle();
  }

  function syncToggle() {
    if (!btn || !state.target) return;
    var on = state.on;
    btn.classList.toggle('is-off', !on);
    btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    btn.title = on
      ? state.target.name + '皮肤已开启 · ' + state.target.greet + '（点击关闭）'
      : '节日皮肤已关闭（点击开启' + state.target.name + '皮肤）';
  }

  /* ==========================================================
     六、开关与对外接口
     ========================================================== */
  function findFestival(id) {
    for (var i = 0; i < FESTIVALS.length; i++) if (FESTIVALS[i].id === id) return FESTIVALS[i];
    return null;
  }

  function setOn(remember) {
    if (!state.target) return;
    state.on = true;
    document.documentElement.setAttribute('data-festival', state.target.id);
    paint(state.target);
    removeLayer();
    buildLayer(state.target);
    buildToggle(state.target);
    if (remember) { try { localStorage.removeItem(STORE_KEY); } catch (e) { } }
    syncToggle();
  }

  function setOff(remember) {
    removeLayer();
    unpaint();
    state.on = false;
    document.documentElement.removeAttribute('data-festival');
    if (remember) { try { localStorage.setItem(STORE_KEY, '1'); } catch (e) { } }
    syncToggle();
  }

  function toggle() {
    if (state.on) setOff(true); else setOn(true);
  }

  function apply(id) {
    var f = findFestival(id);
    if (!f) return false;
    state.target = f;
    setOn(true);
    return true;
  }

  function param(name) {
    var m = location.search.match(new RegExp('[?&]' + name + '=([^&]*)'));
    return m ? decodeURIComponent(m[1]) : null;
  }

  function boot() {
    var q = param('festival');
    var forced = (q && q !== 'off' && q !== 'none') ? findFestival(q) : null;
    var hit = match(new Date());

    // 今天不是节日，也没有手动指定 → 不出现任何皮肤与按钮
    if (!hit && !forced) return;

    state.target = forced || hit.festival;
    buildToggle(state.target);

    var offFlag = false;
    if (q === 'off' || q === 'none') {
      offFlag = true;                       // 调试开关，不写入本地存储
    } else if (!forced) {
      try { offFlag = localStorage.getItem(STORE_KEY) === '1'; } catch (e) { }
    }

    if (offFlag) setOff(false); else setOn(false);
  }

  // 深色/浅色切换时重新上色（不重建粒子）
  new MutationObserver(function () { if (state.on && state.target) paint(state.target); })
    .observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  window.FestivalSkin = {
    list: FESTIVALS,
    lunar: { toSolar: lunar2solar, fromSolar: solar2lunar },
    match: function (date) { return match(date || new Date()); },
    apply: apply,
    on: function () { setOn(true); },
    off: function () { setOff(true); },
    toggle: toggle,
    today: function () {
      var hit = match(new Date());
      return hit ? { id: hit.festival.id, name: hit.festival.name, start: hit.start, end: hit.end } : null;
    }
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
