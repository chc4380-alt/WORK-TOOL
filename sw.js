const CACHE_NAME = 'work-tool-v1';
const ASSETS = [
  '/WORK-TOOL/',
  '/WORK-TOOL/index.html',
  '/WORK-TOOL/manifest.json',
  '/WORK-TOOL/icon-192.png',
  '/WORK-TOOL/icon-512.png',
  '/WORK-TOOL/기안자동작성기/index.html',
  '/WORK-TOOL/만족도조사/index.html',
  '/WORK-TOOL/안내문작성기/index.html',
  '/WORK-TOOL/카드뉴스메이커/index.html',
  '/WORK-TOOL/할일목록/index.html'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS).catch(err => {
        console.warn('[SW] 일부 파일 캐시 실패:', err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request)
      .then(response => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      })
      .catch(() => {
        return caches.match(event.request).then(cached => {
          return cached || new Response('오프라인 상태입니다.', {
            status: 503,
            headers: { 'Content-Type': 'text/plain; charset=utf-8' }
          });
        });
      })
  );
});
