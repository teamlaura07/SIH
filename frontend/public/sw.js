// Service Worker for VanRakshak PWA (SIH25002)
const CACHE_NAME = 'vanrakshak-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => 
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-emergency-capsules') {
    event.waitUntil(flushOfflineSyncQueue());
  }
});

async function flushOfflineSyncQueue() {
  console.log('[SW] Service worker background sync triggered for offline emergency capsules');
  // Broadcast sync trigger signal to open PWA clients
  const allClients = await self.clients.matchAll();
  for (const client of allClients) {
    client.postMessage({ type: 'TRIGGER_OFFLINE_SYNC' });
  }
}
