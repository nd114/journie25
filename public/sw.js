const CACHE_NAME = 'research-platform-v1';
const RUNTIME_CACHE = 'runtime-cache-v1';
const API_CACHE = 'api-cache-v1';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/src/main.tsx',
  '/src/index.css',
  '/offline.html'
];

self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Filter out non-http/https URLs to prevent cache errors
      const validUrls = STATIC_ASSETS.filter(url => {
        try {
          const parsed = new URL(url, self.location.origin);
          return parsed.protocol === 'http:' || parsed.protocol === 'https:';
        } catch {
          return false;
        }
      });
      return cache.addAll(validUrls);
    }).catch((err) => console.error('[SW] Cache addAll error:', err))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== RUNTIME_CACHE && name !== API_CACHE)
          .map((name) => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET') {
    return;
  }

  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstStrategy(request));
  } else if (request.destination === 'image') {
    event.respondWith(cacheFirstStrategy(request));
  } else if (request.destination === 'script' || request.destination === 'style') {
    event.respondWith(staleWhileRevalidateStrategy(request));
  } else {
    event.respondWith(networkFirstStrategy(request));
  }
});

function isValidCacheRequest(request) {
  const url = new URL(request.url);
  return url.protocol === 'http:' || url.protocol === 'https:';
}

async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok && isValidCacheRequest(request)) {
      const cache = await caches.open(API_CACHE);
      cache.put(request, networkResponse.clone()).catch(err => {
        console.warn('[SW] Failed to cache:', request.url, err);
      });
    }

    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    if (request.destination === 'document') {
      return caches.match('/offline.html') || new Response('Offline', {
        status: 503,
        statusText: 'Service Unavailable',
        headers: new Headers({
          'Content-Type': 'text/plain'
        })
      });
    }

    return new Response('Network error', {
      status: 408,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}

async function cacheFirstStrategy(request) {
  const cachedResponse = await caches.match(request);

  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok && isValidCacheRequest(request)) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, networkResponse.clone()).catch(err => {
        console.warn('[SW] Failed to cache:', request.url, err);
      });
    }

    return networkResponse;
  } catch (error) {
    return new Response('Network error', {
      status: 408,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}

async function staleWhileRevalidateStrategy(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  const cachedResponse = await caches.match(request);

  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok && isValidCacheRequest(request)) {
      cache.put(request, networkResponse.clone()).catch(err => {
        console.warn('[SW] Failed to cache:', request.url, err);
      });
    }
    return networkResponse;
  }).catch(() => cachedResponse);

  return cachedResponse || fetchPromise;
}

self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync event:', event.tag);

  if (event.tag === 'sync-draft-papers') {
    event.waitUntil(syncDraftPapers());
  }
});

async function syncDraftPapers() {
  try {
    const drafts = await getDraftsFromIndexedDB();

    for (const draft of drafts) {
      try {
        const response = await fetch('/api/papers/draft', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${draft.token}`
          },
          body: JSON.stringify(draft.data)
        });

        if (response.ok) {
          await removeDraftFromIndexedDB(draft.id);
          self.registration.showNotification('Draft Synced', {
            body: 'Your research paper draft has been saved successfully',
            icon: '/icon-192.png',
            badge: '/icon-192.png'
          });
        }
      } catch (error) {
        console.error('[SW] Error syncing draft:', error);
      }
    }
  } catch (error) {
    console.error('[SW] Background sync failed:', error);
  }
}

async function getDraftsFromIndexedDB() {
  return [];
}

async function removeDraftFromIndexedDB(id) {
  console.log('[SW] Removing draft:', id);
}

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});