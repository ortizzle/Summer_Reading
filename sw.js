const CACHE = 'ortizzle-v3';
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

// Timer-done notification — fires even when screen is off on Android PWA
self.addEventListener('message', e => {
  if (e.data && e.data.type === 'TIMER_DONE') {
    e.waitUntil(self.registration.showNotification('📚 Reading timer done!', {
      body: e.data.body || 'Tap to log your reading session.',
      icon: '/Summer_Reading/icon-192.png',
      badge: '/Summer_Reading/icon-192.png',
      vibrate: [200, 100, 200, 100, 200],
      requireInteraction: true,
      tag: 'ortizzle-timer'
    }));
  }
});

// Fetch: serve from cache for app shell; network-first for Gist API calls
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // Always go network-only for GitHub Gist / Google Books APIs (live data).
  // Let failures reject — fabricating an empty 200 here made the app report
  // failed Gist saves as successful syncs.
  if (url.hostname === 'api.github.com' || url.hostname === 'www.googleapis.com') {
    e.respondWith(fetch(e.request));
    return;
  }

  // Network-first for index.html so code updates arrive immediately
  if (url.pathname.endsWith('index.html') || url.pathname.endsWith('/')) {
    e.respondWith(
      fetch(e.request).then(res => {
        // Only overwrite the cached app shell with a good copy — a transient
        // 404/500 or captive-portal page must not replace it
        if (res.ok) {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      }).catch(() => caches.match(e.request))
    );
    return;
  }

  // Cache-first for other static assets (icons, manifest)
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request).then(res => {
      if (res.ok) {
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
      }
      return res;
    }))
  );
});
