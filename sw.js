const CACHE = 'ortizzle-v1';
const APP_SHELL = [
  '/Summer_Reading/',
  '/Summer_Reading/index.html',
  '/Summer_Reading/manifest.json',
  '/Summer_Reading/icon-192.png',
  '/Summer_Reading/icon-512.png',
  '/Summer_Reading/apple-touch-icon.png',
];

// Install: cache the app shell
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(APP_SHELL)).then(() => self.skipWaiting())
  );
});

// Activate: clean up old caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch: serve from cache for app shell; network-first for Gist API calls
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // Always go network-first for GitHub Gist API (live data)
  if (url.hostname === 'api.github.com' || url.hostname === 'www.googleapis.com') {
    e.respondWith(
      fetch(e.request).catch(() => new Response('{}', { headers: { 'Content-Type': 'application/json' } }))
    );
    return;
  }

  // Cache-first for app shell files
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request).then(res => {
      // Cache new app-shell responses as they arrive
      if (res.ok && APP_SHELL.some(path => url.pathname === path || url.pathname.endsWith('index.html'))) {
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
      }
      return res;
    }))
  );
});
