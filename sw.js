const CACHE_NAME = 'YOLANDEshop-v1';
const CORE_ASSETS = [
  '/',
  '/o.html',
  '/styles.css',
  '/sitemap.xml'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(CORE_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => { if(k !== CACHE_NAME) return caches.delete(k); })))
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const req = event.request;
  // For navigation requests, try network first then cache
  if(req.mode === 'navigate'){
    event.respondWith(fetch(req).catch(()=>caches.match('/o.html')));
    return;
  }
  event.respondWith(caches.match(req).then(resp => resp || fetch(req).then(r=>{ const resClone = r.clone(); caches.open(CACHE_NAME).then(c=>c.put(req, resClone)); return r;})).catch(()=>{}));
});
