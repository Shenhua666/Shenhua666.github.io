// 文章数据与渲染
const articlesConfig = {
  articles: [
    {
      id: 5,
      title: "NatFrp内网穿透实现我的世界联机",
      summary: "使用NatFrp实现我的世界联机，无需公网IP。详细教程介绍如何配置和使用NatFrp进行内网穿透，实现低延迟的Minecraft联机体验。",
      image: "md/004/natfrp.webp",
      date: "2025-06-09",
      url: "https://blog.mietianshenhua.online/2025/06/09/natfrp%E8%81%94%E6%9C%BA%E6%95%99%E7%A8%8B/"
    },
    {
      id: 4,
      title: "IPv6公网联机教程",
      summary: "Minecraft IPv6公网联机教程：操作简单，未来已来，低延迟联机新方案！本教程详细介绍如何利用IPv6公网地址实现Minecraft联机，无需第三方工具。",
      image: "md/003/ipv6.webp",
      date: "2025-05-25",
      url: "https://blog.mietianshenhua.online/2025/05/25/IPv6%E5%85%AC%E7%BD%91%E8%81%94%E6%9C%BA/"
    },
    {
      id: 3,
      title: "IPv4公网联机教程",
      summary: "Minecraft IPv4公网联机教程：稳定低延迟的联机方式。本教程指导你如何通过IPv4公网IP实现Minecraft服务器搭建和远程联机。",
      image: "md/002/ipv4.webp",
      date: "2025-05-24",
      url: "https://blog.mietianshenhua.online/2025/05/24/IPv4%E5%85%AC%E7%BD%91%E8%81%94%E6%9C%BA/"
    },
    {
      id: 2,
      title: "关于Forge的下载和安装",
      summary: "详细教程介绍如何下载Forge并安装到客户端或服务器中。包含常见问题解决和版本选择建议。",
      image: "md/001/forge.webp",
      date: "2025-02-02",
      url: "https://www.bilibili.com/opus/339053862336318094"
    },
    {
      id: 1,
      title: "Windows的安装教程",
      summary: "新手小白都能看得懂的装系统教程。从制作启动盘到系统安装，一步步指导你完成Windows系统的安装过程。",
      image: "md/000/win.webp",
      date: "2022-10-27",
      url: "https://blog.mietianshenhua.online/2022/10/27/Windows%E7%9A%84%E5%AE%89%E8%A3%85/"
    }
  ]
};

const FALLBACK_IMG = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="400"><rect fill="#eef1f8" width="800" height="400"/><text fill="#9aa1b1" font-family="sans-serif" font-size="36" x="400" y="205" text-anchor="middle">图片加载失败</text></svg>'
);

document.addEventListener('DOMContentLoaded', () => {
  const container = document.querySelector('.articles-container');
  if (!container) return;
  renderArticles(container);
});

function renderArticles(container) {
  if (!articlesConfig.articles.length) {
    container.innerHTML = `<div class="empty-placeholder">${window.ICONS.alert}<h3>暂无文章内容</h3><p>请稍后再试或联系管理员</p></div>`;
    return;
  }
  container.innerHTML = '';
  articlesConfig.articles.forEach((article, index) => {
    const el = document.createElement('div');
    el.className = `article ${index % 2 === 0 ? 'even' : 'odd'}`;

    el.innerHTML = `
      <div class="article-image">
        <img src="${article.image}" alt="${article.title}" loading="lazy" onerror="this.onerror=null;this.src='${FALLBACK_IMG}'">
      </div>
      <div class="article-content">
        <h3>${article.title}</h3>
        <p class="article-summary">${article.summary}</p>
        <div class="article-meta">
          ${window.ICONS.calendar}
          <span>${article.date}</span>
        </div>
      </div>`;

    el.addEventListener('click', () => {
      if (article.url.startsWith('http')) window.open(article.url, '_blank');
      else window.location.href = article.url;
    });
    container.appendChild(el);
  });
}
