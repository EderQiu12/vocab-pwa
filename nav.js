// nav.js — 共享顶部导航条（MPA 方案）
// 用法：每个子页面 <body data-app="xxx">，</body> 前引入本脚本
// 首页（index.html，body 无 data-app）只暴露 APPS，不注入导航条
(function () {
  'use strict';

  // ============================================================
  //  子应用注册表：以后新增子页面只需在这里加一行
  //  desc 字段是给首页卡片用的描述（可选）
  //  ★ 与 index.html 的兜底数据保持一致，避免首页卡片数量对不上
  // ============================================================
  const APPS = {
    vocab: {
      icon: '🎯',
      title: '词汇进化',
      href: 'vocab.html',
      desc: '每周消灭 50 个 Comfort Word · 用更锋利的词替代用烂的词'
    },
    chat: {
      icon: '💬',
      title: 'Daily Chat',
      href: 'chat.html',
      desc: '12 大场景 · 200 组地道对话 · 点击单词拼出整句'
    },
    grammar: {
      icon: '📝',
      title: '1000句单句',
      href: 'phrases.html',
      desc: '1000句高频单句训练'
    }
  };

  // ★ 暴露给首页（index.html）生成卡片
  //   仅在页面尚未定义时写入，避免覆盖页面自身的配置
  if (!window.DAILY_ENGLISH_APPS) {
    window.DAILY_ENGLISH_APPS = APPS;
  }

  const CURRENT = document.body.dataset.app || '';

  // ★ 首页（body 无 data-app）：只暴露 APPS，不注入样式与导航条
  if (!CURRENT) return;

  // 防重复注入
  if (document.querySelector('.app-nav[data-injected]')) return;

  // ============================================================
  //  注入样式
  //  设计要点：
  //  1) box-sizing: border-box —— min-height 含 padding，避免刘海屏叠加高度
  //  2) z-index: 100 —— 低于子页面的 practice-screen(150) / popup(200) /
  //     round-modal-overlay(300)，进入练习模式会被整屏浮层盖住，退出后恢复
  //  3) 用 --nav-pad 统一负 margin，默认 20px，窄屏 12px，
  //     与子页面 body 的 padding 约定保持一致；子页面可覆盖该变量
  //  4) padding-top: env(safe-area-inset-top) 处理刘海/灵动岛
  // ============================================================
  if (!document.querySelector('style[data-injected="nav-style"]')) {
    const style = document.createElement('style');
    style.setAttribute('data-injected', 'nav-style');
    style.textContent = `
      .app-nav {
        --nav-pad: 20px;
        box-sizing: border-box;
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
        margin: calc(-1 * var(--nav-pad)) calc(-1 * var(--nav-pad)) var(--nav-pad);
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
        text-decoration: none;
      }
      .app-nav .brand:focus-visible,
      .app-nav .tab:focus-visible {
        outline: 2px solid #00e5ff;
        outline-offset: 2px;
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
        .app-nav { --nav-pad: 12px; }
        .app-nav .brand .brand-text { display: none; }
        .app-nav .tab { padding: 6px 10px; font-size: 12px; }
      }
      @media (prefers-reduced-motion: reduce) {
        .app-nav .tab { transition: none; }
      }
    `;
    document.head.appendChild(style);
  }

  // ============================================================
  //  注入导航条（DOM API 构建，避免 innerHTML 拼接）
  // ============================================================
  const nav = document.createElement('nav');
  nav.className = 'app-nav';
  nav.setAttribute('data-injected', 'nav');
  nav.setAttribute('aria-label', '主导航');

  // brand：点击回到选择页
  const brand = document.createElement('a');
  brand.className = 'brand';
  brand.href = 'index.html';
  brand.setAttribute('aria-label', '返回 Daily English 首页');

  const brandEmoji = document.createElement('span');
  brandEmoji.textContent = '📚';
  brandEmoji.setAttribute('aria-hidden', 'true');

  const brandText = document.createElement('span');
  brandText.className = 'brand-text';
  brandText.textContent = 'Daily English';

  brand.append(brandEmoji, brandText);

  // tabs
  const tabs = document.createElement('div');
  tabs.className = 'tabs';

  Object.keys(APPS).forEach(function (key) {
    const app = APPS[key];
    if (!app || !app.href) return;

    const tab = document.createElement('a');
    tab.className = key === CURRENT ? 'tab active' : 'tab';
    tab.href = app.href;
    if (key === CURRENT) tab.setAttribute('aria-current', 'page');

    const icon = document.createElement('span');
    icon.textContent = app.icon || '';
    icon.setAttribute('aria-hidden', 'true');

    const title = document.createElement('span');
    title.textContent = app.title || key;

    tab.append(icon, title);
    tabs.appendChild(tab);
  });

  nav.append(brand, tabs);
  document.body.prepend(nav);
})();