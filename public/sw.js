const CACHE_NAME = 'aisira-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/logo.png',
  '/src/main.js',
  '/src/router.js',
  '/src/api.js',
  '/src/data.js',
  '/src/store.js',
  '/src/toast.js',
  '/src/styles/index.css',
  '/src/styles/components.css'
];

// Install Event — caching core shell assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('📦 PWA: Pre-caching app shell assets...');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate Event — removing obsolete caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('🧹 PWA: Cleaning up obsolete cache:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Event — Offline interception strategy
self.addEventListener('fetch', (event) => {
  const reqUrl = new URL(event.request.url);

  // 1. API Calls — Network-First, fallback to Cache
  if (reqUrl.pathname.startsWith('/api/events')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // If network call succeeds, clone response to cache
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, copy);
            });
          }
          return response;
        })
        .catch(() => {
          console.log('🌐 PWA: Network offline, fetching event data from cache...');
          return caches.match(event.request);
        })
    );
    return;
  }

  // 2. Leaflet Map Tiles & Fonts — Stale-While-Revalidate
  if (
    reqUrl.host.includes('tile.openstreetmap.org') ||
    reqUrl.host.includes('fonts.googleapis.com') ||
    reqUrl.host.includes('fonts.gstatic.com') ||
    reqUrl.host.includes('unpkg.com')
  ) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        const fetchPromise = fetch(event.request).then((networkResponse) => {
          if (networkResponse.ok) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, networkResponse.clone());
            });
          }
          return networkResponse;
        });
        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // 3. Static Assets — Stale-While-Revalidate
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Fetch in background to update cache (stale-while-revalidate)
        fetch(event.request).then((networkResponse) => {
          if (networkResponse.ok) {
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkResponse));
          }
        }).catch(() => {});
        return cachedResponse;
      }
      return fetch(event.request);
    })
  );
});
