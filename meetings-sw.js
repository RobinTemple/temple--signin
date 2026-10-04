/* Meeting Attendance — Service Worker
   Network-first with cache fallback for offline use.
   Bump CACHE_NAME when you deploy a new version of the app.
*/
const CACHE_NAME = 'meeting-att-v1';

self.addEventListener('install', event => {
  // Take effect immediately — don't wait for old tabs to close
  self.skipWaiting();

  // Pre-cache the app shell on first install
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      cache.addAll([
        'meetings-signin.html',
        'meetings-sw.js'
      ]).catch(() => { /* ignore if running from file:// */ })
    )
  );
});

self.addEventListener('activate', event => {
  // Delete old caches
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k !== CACHE_NAME)
          .map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  // Only handle GET requests for same-origin resources
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Cache a fresh copy as we go
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() =>
        // Network failed — serve from cache
        caches.match(event.request)
      )
  );
});
