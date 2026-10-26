/* dict-widget.js — 全局悬浮词典按钮 */
(function () {
  'use strict';
  if (window.__DICT_WIDGET_LOADED__) return;
  window.__DICT_WIDGET_LOADED__ = true;

  const style = document.createElement('style');
  style.setAttribute('data-injected', 'dict-widget-style');
  style.textContent = `
    .dict-fab {
      position: fixed; right: 20px; bottom: calc(20px + env(safe-area-inset-bottom));
      z-index: 9000; width: 56px; height: 56px; border-radius: 50%;
      background: linear-gradient(135deg, #00e5ff, #d500f9);
      box-shadow: 0 6px 24px rgba(0,229,255,0.4);
      cursor: pointer; border: none; color: #0a1929;
      font-size: 24px; display: flex; align-items: center; justify-content: center;
      transition: transform .15s, box-shadow .15s;
      -webkit-tap-highlight-color: transparent;
    }
    .dict-fab:hover { transform: translateY(-2px) scale(1.05); box-shadow: 0 8px 28px rgba(0,229,255,0.55); }
    .dict-fab.active { transform: rotate(45deg); background: linear-gradient(135deg, #ff6b6b, #d500f9); }

    .dict-panel-overlay {
      position: fixed; inset: 0; z-index: 9001;
      background: rgba(0,0,0,0.55); backdrop-filter: blur(6px);
      display: none; align-items: center; justify-content: center;
      padding: 20px;
      padding-top: calc(20px + env(safe-area-inset-top));
      padding-bottom: calc(20px + env(safe-area-inset-bottom));
    }
    .dict-panel-overlay.open { display: flex; animation: dictFadeIn .2s ease; }
    @keyframes dictFadeIn { from { opacity: 0; } to { opacity: 1; } }

    .dict-panel {
      width: 100%; max-width: 820px; max-height: 90vh;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      border: 1px solid rgba(0,229,255,0.25);
      border-radius: 18px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.5), 0 0 0 4px rgba(0,229,255,0.08);
      overflow: hidden; display: flex; flex-direction: column;
    }
    .dict-panel-head {
      padding: 10px 14px;
      background: rgba(255,255,255,0.03);
      border-bottom: 1px solid rgba(255,255,255,0.08);
      display: flex; align-items: center; gap: 12px; flex-shrink: 0;
    }
    .dict-panel-title {
      font-size: 15px; font-weight: 800;
      background: linear-gradient(135deg, #00e5ff, #d500f9);
      -webkit-background-clip: text; background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .dict-panel-hint { font-size: 11px; color: #6a7090; }
    .dict-panel-close {
      margin-left: auto; width: 32px; height: 32px; border-radius: 8px;
      background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.12);
      color: #d8dce8; cursor: pointer; font-size: 18px;
      display: flex; align-items: center; justify-content: center;
      font-family: inherit;
    }
    .dict-panel-close:hover { background: rgba(255,107,107,0.2); color: #ff6b6b; }

    .dict-panel-frame {
      flex: 1; border: none; width: 100%; height: 100%;
      min-height: 500px; background: transparent; display: block;
    }

    @media (max-width: 720px) {
      .dict-fab { right: 14px; width: 52px; height: 52px; font-size: 22px; }
      .dict-panel-overlay {
        padding: 8px;
        padding-top: calc(8px + env(safe-area-inset-top));
        padding-bottom: calc(8px + env(safe-area-inset-bottom));
      }
      .dict-panel { max-height: 96vh; border-radius: 14px; }
      .dict-panel-frame { min-height: 400px; }
      .dict-panel-hint { display: none; }
    }
  `;
  document.head.appendChild(style);

  /* 悬浮按钮 */
  const fab = document.createElement('button');
  fab.className = 'dict-fab';
  fab.innerHTML = '📖';
  fab.title = '查词 (Alt+D)';
  fab.setAttribute('aria-label', '打开词典');
  document.body.appendChild(fab);

  /* 面板 */
  const overlay = document.createElement('div');
  overlay.className = 'dict-panel-overlay';
  overlay.innerHTML = `
    <div class="dict-panel">
      <div class="dict-panel-head">
        <span class="dict-panel-title">📖 查词</span>
        <span class="dict-panel-hint">选中文字后按 Alt+D 可直接查</span>
        <button class="dict-panel-close" aria-label="关闭">×</button>
      </div>
      <iframe class="dict-panel-frame" title="词典"></iframe>
    </div>
  `;
  document.body.appendChild(overlay);

  const closeBtn = overlay.querySelector('.dict-panel-close');
  const iframe = overlay.querySelector('.dict-panel-frame');
  let loaded = false;

  function open() {
    overlay.classList.add('open');
    fab.classList.add('active');
    if (!loaded) { iframe.src = 'dictionary.html?embed=1'; loaded = true; }
    // 有选中文本 → 自动查
    const sel = (window.getSelection && window.getSelection().toString().trim()) || '';
    if (sel && /^[a-zA-Z][a-zA-Z' -]*$/.test(sel) && sel.length < 40) {
      setTimeout(() => {
        try {
          iframe.contentWindow?.postMessage({ type: 'dict-query', word: sel }, '*');
        } catch (e) {}
      }, 400);
    }
    document.body.style.overflow = 'hidden';
  }
  function close() {
    overlay.classList.remove('open');
    fab.classList.remove('active');
    document.body.style.overflow = '';
  }

  fab.addEventListener('click', () => {
    if (overlay.classList.contains('open')) close(); else open();
  });
  closeBtn.addEventListener('click', close);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close();
  });

  document.addEventListener('keydown', (e) => {
    if (e.altKey && (e.key === 'd' || e.key === 'D')) {
      e.preventDefault();
      if (overlay.classList.contains('open')) close(); else open();
    }
    if (e.key === 'Escape' && overlay.classList.contains('open')) close();
  });

  /* 接收 iframe 内消息 */
  window.addEventListener('message', (e) => {
    const d = e.data;
    if (!d || typeof d !== 'object') return;
    if (d.type === 'dict-jump-vocab' && d.word) {
      close();
      location.href = `vocab.html?word=${encodeURIComponent(d.word)}`;
    }
  });
})();