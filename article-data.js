// 文章数据与渲染
const articlesConfig = {
  articles: [
    	{
                    id: 13,
                    title: "[MC扫盲]还在分不清版本？一个视频帮你找到适合自己游玩的版本！", 
                    summary: "一次性了解Java版，基岩版，中国版。看完以后再也不会分不清自己玩的是什么版本了。当然也可以通过这个视频找到最适合你游玩的版本。",
                    image: "md/012/fqbb.webp",
                    date: "2026-02-14",
                    url: "https://www.bilibili.com/video/BV18RcnzFEBX"
                },
                {
                    id: 12,
                    title: "MC账号安全升级！想盗我号，来我家再说。盗号者退退退！", 
                    summary: "使用Authenticator和Pico FIDO2 Key来实现微软账户的无密码登录，让你的帐号更加安全，远离盗号风险。",
                    image: "md/011/aqsj.webp",
                    date: "2026-01-12",
                    url: "https://www.bilibili.com/video/BV14Rr4BREes"
                },
                {
                    id: 11,
                    title: "新手必看！PCL2，HMCL，BakaXL启动器+Java下载一步到位！", 
                    summary: "不知道启动器的官方下载链接在哪？不知道去哪里下载Java？不知道众多Java版本该怎么选、有什么用？这篇文章或许能帮到你！",
                    image: "md/010/qdq_javaxz.webp",
                    date: "2026-01-08",
                    url: "https://www.bilibili.com/video/BV1BgiSBxEiy"
                },
                {
                    id: 10,
                    title: "MC无服务端整合包开服难？ServerPackCreator 帮你快速搞定不兼容模组！", 
                    summary: "无服务端整合包开服难，排模组，下载服务端自己构建令人抓狂？ServerPackCreator或许能帮你从这些苦海中解脱！",
                    image: "md/009/spc.webp",
                    date: "2026-01-06",
                    url: "https://www.bilibili.com/video/BV1gEioBPEtq"
                },
                {
                    id: 9,
                    title: "Minecraft购买指南。告别锁区！", 
                    summary: "手把手教你如何正确购买Minecraft java版，告别官网锁区困扰和支付问题。",
                    image: "md/008/mcgmzn.webp",
                    date: "2025-12-22",
                    url: "https://www.bilibili.com/video/BV13qBsBUEbw"
                },
                {
                    id: 8,
                    title: "披风申诉，就是如此简单", 
                    summary: "披风被官方漏发了或同步出现了异常？不用担心，看完教你如何申诉，轻松恢复你的披风！",
                    image: "md/007/pfss.webp",
                    date: "2025-12-19",
                    url: "https://www.bilibili.com/video/BV1H8qfBtEN8"
                },
                {
                    id: 7,
                    title: "[学会开服系列]原版，模组服搭建教程", 
                    summary: "小白也能看懂的Java原版、Forge、Fabric、Neoforge服务器的搭建教程，想自己当服主再也不需要求人啦！！！",
                    image: "md/006/kf.webp",
                    date: "2025-09-26",
                    url: "https://space.bilibili.com/107706498/lists/6392397"
                },
                {
                    id: 6,
                    title: "正版专属福利联机模组Essential", 
                    summary: "Essential让你告别繁琐的联机设置，只需简单几步即可与小伙伴正常联机！",
                    image: "md/005/essential.webp",
                    date: "2025-09-10",
                    url: "https://www.bilibili.com/video/BV1HwH1zNELx"
                },
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
