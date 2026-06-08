const CACHE_NAME = 'work-tool-v1';
const ASSETS = [
  '/WORK-TOOL/',
  '/WORK-TOOL/index.html',
  '/WORK-TOOL/기안자동작성기/index.html',
  '/WORK-TOOL/만족도조사/index.html',
  '/WORK-TOOL/안내문작성기/index.html',
  '/WORK-TOOL/카드뉴스메이커/index.html',
  '/WORK-TOOL/할일목록/index.html',
  '/WORK-TOOL/manifest.json',
  '/WORK-TOOL/icons/icon-192.png',
  '/WORK-TOOL/icons/icon-512.png'
];

// 설치: 핵심 파일 캐시
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

// 활성화: 이전 캐시 정리
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// 네트워크 우선, 실패 시 캐시에서 제공
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // 네트워크 응답을 캐시에도 저장
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      })
      .catch(() => {
        // 오프라인 시 캐시에서 제공
        return caches.match(event.request).then(cached => {
          return cached || new Response('오프라인 상태입니다.', {
            status: 503,
            headers: { 'Content-Type': 'text/plain; charset=utf-8' }
          });
        });
      })
  );
});
