// 粒子互动背景：点线网络，鼠标靠近连线，点击生成新粒子
(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var canvas = document.createElement('canvas');
  canvas.id = 'particle-bg';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.insertBefore(canvas, document.body.firstChild);

  var ctx = canvas.getContext('2d');
  var particles = [];
  var mouse = { x: null, y: null, active: false };
  var DPR = Math.min(window.devicePixelRatio || 1, 2);
  var LINK_DIST = 150;

  function themeColors() {
    var dark = document.documentElement.getAttribute('data-theme') === 'dark';
    return dark
      ? { line: '148, 176, 216', dot: '148, 176, 216', mouseLine: '148, 176, 216' }
      : { line: '37, 99, 235', dot: '37, 99, 235', mouseLine: '37, 99, 235' };
  }

  function isSmall() { return window.innerWidth < 640; }

  function count() {
    var n = Math.floor(window.innerWidth * window.innerHeight / 9000);
    return Math.max(36, Math.min(isSmall() ? 55 : 110, n));
  }

  function resize() {
    canvas.width = window.innerWidth * DPR;
    canvas.height = window.innerHeight * DPR;
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }

  function makeParticle(x, y, opts) {
    opts = opts || {};
    var speed = isSmall() ? 0.35 : 0.55;
    var angle = Math.random() * Math.PI * 2;
    return {
      x: x != null ? x : Math.random() * window.innerWidth,
      y: y != null ? y : Math.random() * window.innerHeight,
      vx: opts.vx != null ? opts.vx : Math.cos(angle) * speed * (0.5 + Math.random()),
      vy: opts.vy != null ? opts.vy : Math.sin(angle) * speed * (0.5 + Math.random()),
      r: 1.2 + Math.random() * 1.8
    };
  }

  function init() {
    resize();
    particles = [];
    var n = count();
    for (var i = 0; i < n; i++) particles.push(makeParticle());
  }

  function draw() {
    var w = window.innerWidth, h = window.innerHeight;
    var colors = themeColors();
    ctx.clearRect(0, 0, w, h);

    ctx.lineWidth = 1;
    // 粒子间连线
    for (var i = 0; i < particles.length; i++) {
      var a = particles[i];
      for (var j = i + 1; j < particles.length; j++) {
        var b = particles[j];
        var dx = a.x - b.x, dy = a.y - b.y;
        var d2 = dx * dx + dy * dy;
        if (d2 < LINK_DIST * LINK_DIST) {
          var alpha = (1 - Math.sqrt(d2) / LINK_DIST) * 0.50;
          ctx.strokeStyle = 'rgba(' + colors.line + ',' + alpha.toFixed(3) + ')';
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
      // 鼠标连线
      if (mouse.active) {
        var mdx = a.x - mouse.x, mdy = a.y - mouse.y;
        var md2 = mdx * mdx + mdy * mdy;
        var mLimit = LINK_DIST * 1.5;
        if (md2 < mLimit * mLimit) {
          var ma = (1 - Math.sqrt(md2) / mLimit) * 0.45;
          ctx.strokeStyle = 'rgba(' + colors.mouseLine + ',' + ma.toFixed(3) + ')';
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
        }
      }
    }

    // 圆点
    for (var k = 0; k < particles.length; k++) {
      var p = particles[k];
      ctx.fillStyle = 'rgba(' + colors.dot + ',0.70)';
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function step() {
    var w = window.innerWidth, h = window.innerHeight;
    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < -20) p.x = w + 20;
      else if (p.x > w + 20) p.x = -20;
      if (p.y < -20) p.y = h + 20;
      else if (p.y > h + 20) p.y = -20;
    }
  }

  function loop() {
    step();
    draw();
    requestAnimationFrame(loop);
  }

  // 点击生成新粒子（顺着鼠标点击方向散开）
  document.addEventListener('click', function (e) {
    var n = isSmall() ? 3 : 5;
    for (var i = 0; i < n; i++) {
      var ang = Math.random() * Math.PI * 2;
      var spd = 0.8 + Math.random() * 1.8;
      particles.push(makeParticle(e.clientX, e.clientY, {
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd
      }));
    }
    if (particles.length > 170) particles.splice(0, particles.length - 170);
  });

  window.addEventListener('mousemove', function (e) {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.active = true;
  });
  window.addEventListener('mouseleave', function () { mouse.active = false; });

  var rt;
  window.addEventListener('resize', function () {
    clearTimeout(rt);
    rt = setTimeout(init, 200);
  });

  init();
  loop();
})();
