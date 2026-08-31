// 微信公众号二维码气泡 & 移动端跳转
document.addEventListener('DOMContentLoaded', function () {
  const wechatBtn = document.querySelector('.wechat-QR');
  const wechatBubble = document.querySelector('.wechat-bubble');
  const mobileRedirect = document.querySelector('.mobile-redirect');
  const redirectBtn = document.getElementById('wechat-redirect-btn');

  if (!wechatBtn) return;

  const isMobileDevice = () =>
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  wechatBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    if (isMobileDevice() && mobileRedirect) {
      mobileRedirect.classList.add('show');
    } else if (wechatBubble) {
      // 动态定位：气泡出现在按钮正上方，右缘与按钮对齐，箭头指向按钮
      const r = wechatBtn.getBoundingClientRect();
      const bh = wechatBubble.offsetHeight;
      wechatBubble.style.right = Math.max(10, Math.round(innerWidth - r.right)) + 'px';
      wechatBubble.style.bottom = Math.round(innerHeight - r.top + 16) + 'px';
      wechatBubble.classList.toggle('show');
    }
  });

  if (redirectBtn && mobileRedirect) {
    redirectBtn.addEventListener('click', function () {
      mobileRedirect.classList.remove('show');
    });
  }

  // 点击外部关闭
  document.addEventListener('click', function (e) {
    if (wechatBubble && !wechatBtn.contains(e.target) && !wechatBubble.contains(e.target)) {
      wechatBubble.classList.remove('show');
    }
    if (mobileRedirect && mobileRedirect.classList.contains('show') &&
        !document.querySelector('.redirect-content')?.contains(e.target)) {
      mobileRedirect.classList.remove('show');
    }
  });
});
