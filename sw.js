/* Ashram Sign-In — Service Worker v6
   Caches each app after first load so it opens offline / on slow connections */

const CACHE_VERSION = 'temple-signin-v6';

self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  // Remove all old cache versions
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE_VERSION).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  if (new URL(event.request.url).origin !== self.location.origin) return;

  event.respondWith(
    caches.open(CACHE_VERSION).then(cache => {
      return cache.match(event.request).then(cached => {
        // Network first, fall back to cache if offline
        return fetch(event.request).then(response => {
          if (response && response.status === 200) {
            cache.put(event.request, response.clone());
          }
          return response;
        }).catch(() => cached || null);
      });
    })
  );
});
