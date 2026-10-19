const CACHE_NAME = 'ac-scouter-web-v12';
const ASSETS = [
  './', './index.html', './style.css', './script.js', './toolbox-routing.js',
  './manifest.json', './favicon.png', './Pixel.jpg', './Ciak_Background.png',
  './clap.wav', './jspdf_umd_min.js', './icons/icon-192.png',
  './icons/icon-512.png', './icons/apple-touch-icon.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key.startsWith('ac-scouter-') && key !== CACHE_NAME)
        .map(key => caches.delete(key))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;
  // Sun Info stays live. Cache only our own application assets, never API/GPS data.
  if (request.method !== 'GET' || !request.url.startsWith(self.registration.scope)) return;
  event.respondWith(caches.open(CACHE_NAME).then(async cache => {
    const cached = await cache.match(request);
    if (cached) return cached;
    try {
      return await fetch(request);
    } catch (error) {
      if (request.mode === 'navigate') {
        const entry = await cache.match('./index.html');
        if (entry) return entry;
      }
      throw error;
    }
  }));
});
