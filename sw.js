// Temple Sign-In — Service Worker
// Caches the app on first load so it works fully offline after that.
// Change CACHE_VERSION whenever you deploy a new version of the HTML —
// the old cache will be cleared automatically.

const CACHE_VERSION = 'temple-signin-v4';
const URLS = [
  '/temple--signin/1attendance-signin.html',
  '/temple--signin/mens-signin.html',
];

// ── Install: cache everything we need ──────────────────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then(cache => cache.addAll(URLS))
      .then(() => self.skipWaiting())   // activate immediately
  );
});

// ── Activate: remove any old cache versions ─────────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE_VERSION).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())  // take control of all open tabs
  );
});

// ── Fetch: serve from cache, refresh cache in background ───────────────────
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cached => {
      // Always try to fetch a fresh copy in the background
      const networkFetch = fetch(event.request).then(response => {
        if (response && response.status === 200 && response.type !== 'opaque') {
          caches.open(CACHE_VERSION)
            .then(cache => cache.put(event.request, response.clone()));
        }
        return response;
      }).catch(() => null);

      // Return cached copy immediately if available, otherwise wait for network
      return cached || networkFetch;
    })
  );
});
