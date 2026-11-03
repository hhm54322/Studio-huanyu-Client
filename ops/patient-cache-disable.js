// Rollback/kill switch: publish this at /patient-cache-sw.js with no-store,
// refresh that exact CDN URL and let the normal browser update check apply it.
self.addEventListener('install', event => event.waitUntil(self.skipWaiting()))
self.addEventListener('activate', event => event.waitUntil((async () => {
  for (const name of await caches.keys()) if (name.startsWith('huanyu-public-shell-')) await caches.delete(name)
  await self.clients.claim()
  await self.registration.unregister()
})()))
