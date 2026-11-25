/**
 * SIMWARGA - Service Worker (PWA Offline Asset Caching)
 * Aktif hanya pada protokol HTTP/HTTPS (Mode Hosted Web).
 */

const CACHE_NAME = 'simwarga-cache-v1.3';
const CORE_ASSETS = [
  './',
  './index.html',
  './bayar.html',
  './css/style.css',
  './js/store.js',
  './js/app.js',
  './manifest.webmanifest'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(CORE_ASSETS).catch((err) => {
        console.warn('[ServiceWorker] Caching parsial aset inti:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Hanya proses request HTTP/HTTPS dengan metode GET
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (!url.protocol.startsWith('http')) return;

  // Lewati penanganan jika request mengarah ke API eksternal (Supabase, REST cloud)
  if (url.pathname.includes('/rest/v1/') || url.pathname.includes('/api/')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Stale-while-revalidate: Kembalikan cache secepatnya, perbarui di latar belakang
        fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkResponse));
          }
        }).catch(() => {});
        return cachedResponse;
      }

      return fetch(event.request).catch(() => {
        // Fallback navigasi halaman saat luring (offline)
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html') || caches.match('./bayar.html');
        }
      });
    })
  );
});
