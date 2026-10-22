// nav.js — 共享顶部导航条（MPA 方案）
// 用法：每个子页面 <body data-app="xxx">，</body> 前引入本脚本
(function () {
  'use strict';
  if (document.querySelector('.app-nav[data-injected]')) return;

  // ============================================================
  //  子应用注册表：以后新增子页面只需在这里加一行
  // ============================================================
  const APPS = {
    vocab: { icon: '🎯', title: '词汇进化',  href: 'vocab.html' },
    chat:  { icon: '💬', title: 'Daily Chat', href: 'chat.html' },
    // grammar:   { icon: '📖', title: '语法练习', href: 'grammar.html' },
    // listening: { icon: '🎧', title: '听力训练', href: 'listening.html' },
  };
  const CURRENT = document.body.dataset.app || '';

  // ============================================================
  //  注入样式
  //  设计要点：
  //  1) z-index: 100 —— 低于子页面的 practice-screen(150) / popup(200) /
  //     round-modal-overlay(300)，进入练习模式会被整屏浮层盖住，退出后恢复
  //  2) margin: -20px 抵消子页面 body 的 padding（20px 桌面 / 12px 窄屏），
  //     让导航条贴合视口顶部，且宽度铺满
  //  3) padding-top: env(safe-area-inset-top) 处理刘海/灵动岛
  // ============================================================
  const style = document.createElement('style');
  style.setAttribute('data-injected', 'nav-style');
  style.textContent = `
    .app-nav {
      position: sticky;
      top: 0;
      z-index: 100;
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 0 14px;
      padding-top: env(safe-area-inset-top);
      min-height: calc(52px + env(safe-area-inset-top));
      background: linear-gradient(135deg, rgba(26,26,46,0.98), rgba(22,33,62,0.98));
      border-bottom: 1px solid rgba(255,255,255,0.08);
      box-shadow: 0 2px 12px rgba(0,0,0,0.35);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif;
      margin: -20px -20px 20px -20px;
    }
    .app-nav .brand {
      font-size: 16px;
      font-weight: 800;
      background: linear-gradient(135deg, #00e5ff, #d500f9);
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
      white-space: nowrap;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .app-nav .tabs {
      display: flex;
      gap: 4px;
      flex: 1;
      overflow-x: auto;
      scrollbar-width: none;
      padding: 6px 0;
    }
    .app-nav .tabs::-webkit-scrollbar { display: none; }
    .app-nav .tab {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 7px 13px;
      border-radius: 10px;
      font-size: 13px;
      font-weight: 600;
      color: #8a8fa3;
      white-space: nowrap;
      text-decoration: none;
      border: 1px solid transparent;
      transition: all .15s;
    }
    .app-nav .tab:hover { background: rgba(255,255,255,0.06); color: #d8dce8; }
    .app-nav .tab.active {
      background: rgba(0,229,255,0.12);
      color: #00e5ff;
      border-color: rgba(0,229,255,0.3);
    }
    @media (max-width: 720px) {
      .app-nav { margin: -12px -12px 12px -12px; }
      .app-nav .brand .brand-text { display: none; }
      .app-nav .tab { padding: 6px 10px; font-size: 12px; }
    }
  `;
  document.head.appendChild(style);

  // ============================================================
  //  注入导航条
  // ============================================================
  const nav = document.createElement('nav');
  nav.className = 'app-nav';
  nav.setAttribute('data-injected', 'nav');
  let inner = `<div class="brand">📚 <span class="brand-text">Daily English</span></div><div class="tabs">`;
  for (const [key, app] of Object.entries(APPS)) {
    const cls = key === CURRENT ? 'tab active' : 'tab';
    inner += `<a class="${cls}" href="${app.href}"><span>${app.icon}</span><span>${app.title}</span></a>`;
  }
  inner += `</div>`;
  nav.innerHTML = inner;

  document.body.prepend(nav);
})();