/**
 * ForcaMaster - Service Worker PWA (Cache-First Resiliente)
 * Permite funcionamento 100% Offline e instalação nativa em celulares e desktops.
 */

const CACHE_NAME = 'forcamaster-v4';

// Assets essenciais com caminhos relativos para compatibilidade com GitHub Pages e subpastas
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './style.css',
  './manifest.json',
  './js/app.js',
  './js/audio.js',
  './js/themeManager.js',
  './js/words.js',
  './js/gameEngine.js',
  './js/keyboard.js',
  './js/statsManager.js',
  './js/shareManager.js',
  './js/aiService.js',
  './js/firebaseConfig.js',
  './js/authManager.js',
  './js/roomManager.js',
  './assets/icons/icon-192x192.png',
  './assets/icons/icon-512x512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[ForcaMaster SW] Pre-caching de recursos offline concluído');
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            console.log('[ForcaMaster SW] Removendo cache legado:', name);
            return caches.delete(name);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Ignora requisições não-GET e requisições para APIs externas (Gemini, Firebase, Google CDN)
  const url = event.request.url;
  if (
    event.request.method !== 'GET' ||
    url.includes('generativelanguage.googleapis.com') ||
    url.includes('firestore.googleapis.com') ||
    url.includes('identitytoolkit.googleapis.com') ||
    url.includes('gstatic.com') ||
    url.includes('google.com')
  ) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return networkResponse;
      }).catch(() => {
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});
