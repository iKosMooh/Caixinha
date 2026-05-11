// Caixinha Service Worker
// Strategy: Cache-first for assets, network-first for API/actions, offline fallback for pages.

const CACHE_NAME = 'caixinha-v1'
const OFFLINE_PAGE = '/'

const PRECACHE = [
  '/',
  '/estoque',
  '/lista',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE))
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Never intercept Next.js HMR / internal calls
  if (url.pathname.startsWith('/_next/') || url.pathname.startsWith('/api/')) {
    return
  }

  // POST (server actions) — network only, queue offline (handled by app via idb)
  if (request.method !== 'GET') return

  event.respondWith(
    caches.match(request).then((cached) => {
      const networkFetch = fetch(request).then((response) => {
        // Cache successful GET responses for pages
        if (response.ok && url.origin === self.location.origin) {
          const clone = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
        }
        return response
      })
      // Return cached immediately if available, then update in background
      return cached ?? networkFetch.catch(() =>
        caches.match(OFFLINE_PAGE).then((r) => r ?? new Response('Offline', { status: 503 }))
      )
    })
  )
})

// Push notifications (if needed in future)
self.addEventListener('push', (event) => {
  if (!event.data) return
  const data = event.data.json()
  event.waitUntil(
    self.registration.showNotification(data.title ?? 'Caixinha', {
      body: data.body,
      icon: '/icon-192.png',
    })
  )
})
