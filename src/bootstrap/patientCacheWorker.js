/* Only a build-generated, anonymous public shell enters CacheStorage.
 * Static JS/CSS/images/fonts use their content hashes and HTTP disk cache.
 * There is intentionally no generic fetch handler or runtime data cache. */
const publicRoutes = new Set(__PUBLIC_ROUTES__)
const shellUrl = __SHELL_URL__
const prefix = 'huanyu-public-shell-'
const cacheName = prefix + shellUrl.split('/').pop()

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const response = await fetch(shellUrl, { credentials: 'omit', cache: 'reload' })
    if (!response.ok || !response.headers.get('content-type')?.includes('text/html')
      || /private|no-store/i.test(response.headers.get('cache-control') || '')) {
      throw new Error('Public shell could not be cached')
    }
    const cache = await caches.open(cacheName)
    await cache.put(shellUrl, response)
    // Activating new cached HTML never reloads an open form. The next public
    // navigation uses the new build; open clients keep their existing bundles.
    await self.skipWaiting()
  })())
})

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    for (const name of await caches.keys()) {
      if (name.startsWith(prefix) && name !== cacheName) await caches.delete(name)
    }
    await self.clients.claim()
  })())
})

self.addEventListener('fetch', event => {
  const request = event.request
  if (request.method !== 'GET' || request.mode !== 'navigate' || request.headers.has('authorization')) return
  const url = new URL(request.url)
  if (url.origin !== self.location.origin || !publicRoutes.has(url.pathname.replace(/\/$/, '') || '/')) return
  if (url.searchParams.has('__huanyu_update')) return
  if ([...url.searchParams.keys()].some(key => /^(?:token|auth|code|session|patient|report|order|payment)/i.test(key))) return
  event.respondWith((async () => {
    try {
      const cache = await caches.open(cacheName)
      const response = await cache.match(shellUrl)
      if (response) return response
    } catch { /* Storage eviction/disabled storage: use the ordinary network. */ }
    return fetch(request)
  })())
})
