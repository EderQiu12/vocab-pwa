const CACHE = 'vocab-pwa-v10';
const ASSETS = [
  './',
  './index.html',
  './vocab.html',
  './chat.html',
  './dictionary.html',   // ★ 新增
  './dict-widget.js',   // ★ 新增
  './nav.js',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-512-maskable.png',
  './icons/apple-touch-icon.png',
  './icons/favicon-32.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;

  // 页面导航：网络优先，离线时回退到缓存
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req)
        .then(res => {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(req, copy));
          return res;
        })
        .catch(async () => {
          // ① 先匹配请求的真实 URL
          const direct = await caches.match(req, { ignoreSearch: true });
          if (direct) return direct;
          // ② 再回退到 vocab.html（主页面，不会重定向）
          const vocab = await caches.match('./vocab.html', { ignoreSearch: true });
          if (vocab) return vocab;
          // ③ 最后才回退到 index.html
          return caches.match('./index.html', { ignoreSearch: true });
        })
    );
    return;
  }

  // 其余静态资源：缓存优先
  e.respondWith(
    caches.match(req, { ignoreSearch: true }).then(hit =>
      hit ||
      fetch(req).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy));
        return res;
      })
    )
  );
});
