const CACHE_NAME = 'pwa-cache-v1';
const urlsToCache = [
  '/Gangsterz500/',
  '/Gangsterz500/index.html',
  '/Gangsterz500/script.js',
  '/Gangsterz500/manifest.json',
  '/Gangsterz500/icon-192.jpg',
  '/Gangsterz500/icon-512.jpg'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});