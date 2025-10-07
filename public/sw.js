/* eslint-disable no-restricted-globals */
/**
 * Winter Arc Tracker Service Worker
 * Provides offline capabilities and caching strategies
 */

const CACHE_VERSION = 'v1'
const CACHE_NAME = `winter-arc-${CACHE_VERSION}`
const RUNTIME_CACHE = `runtime-${CACHE_VERSION}`

// Assets to precache on install
const PRECACHE_ASSETS = [
  '/today',
  '/scorecard',
  '/progress',
  '/review',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/favicon.svg'
]

// Install event - precache essential assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...')
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Precaching assets')
        return cache.addAll(PRECACHE_ASSETS)
      })
      .then(() => self.skipWaiting())
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...')
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              // Delete old cache versions
              return cacheName.startsWith('winter-arc-') && cacheName !== CACHE_NAME ||
                     cacheName.startsWith('runtime-') && cacheName !== RUNTIME_CACHE
            })
            .map((cacheName) => {
              console.log('[Service Worker] Deleting old cache:', cacheName)
              return caches.delete(cacheName)
            })
        )
      })
      .then(() => self.clients.claim())
  )
})

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return
  }

  // Network-only for authentication and mutations
  if (
    url.pathname.includes('/api/') && 
    (request.method === 'POST' || request.method === 'PATCH' || request.method === 'DELETE')
  ) {
    event.respondWith(fetch(request))
    return
  }

  // Network-only for auth-sensitive routes
  if (
    url.pathname.includes('/sign-in') ||
    url.pathname.includes('/sign-up') ||
    url.pathname.includes('/api/auth')
  ) {
    event.respondWith(fetch(request))
    return
  }

  // Stale-while-revalidate for API GET requests
  if (url.pathname.includes('/api/') && request.method === 'GET') {
    event.respondWith(
      caches.open(RUNTIME_CACHE)
        .then((cache) => {
          return cache.match(request)
            .then((cachedResponse) => {
              const fetchPromise = fetch(request)
                .then((networkResponse) => {
                  // Update cache with fresh response
                  if (networkResponse && networkResponse.status === 200) {
                    cache.put(request, networkResponse.clone())
                  }
                  return networkResponse
                })
                .catch(() => {
                  // Network failed, return cached if available
                  return cachedResponse
                })

              // Return cached response immediately, update in background
              return cachedResponse || fetchPromise
            })
        })
    )
    return
  }

  // Cache-first for static assets (images, fonts, etc.)
  if (
    request.destination === 'image' ||
    request.destination === 'font' ||
    request.destination === 'style' ||
    url.pathname.includes('/_next/static/')
  ) {
    event.respondWith(
      caches.match(request)
        .then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse
          }
          return caches.open(RUNTIME_CACHE)
            .then((cache) => {
              return fetch(request)
                .then((networkResponse) => {
                  if (networkResponse && networkResponse.status === 200) {
                    cache.put(request, networkResponse.clone())
                  }
                  return networkResponse
                })
            })
        })
    )
    return
  }

  // Network-first for pages (HTML documents)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          // Cache successful page responses
          if (networkResponse && networkResponse.status === 200) {
            caches.open(RUNTIME_CACHE)
              .then((cache) => {
                cache.put(request, networkResponse.clone())
              })
          }
          return networkResponse
        })
        .catch(() => {
          // Network failed, try cache
          return caches.match(request)
            .then((cachedResponse) => {
              if (cachedResponse) {
                return cachedResponse
              }
              // Return offline page if available
              return caches.match('/today')
            })
        })
    )
    return
  }

  // Default: try network, fall back to cache
  event.respondWith(
    fetch(request)
      .then((networkResponse) => {
        return networkResponse
      })
      .catch(() => {
        return caches.match(request)
      })
  )
})

// Handle messages from clients
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys()
        .then((cacheNames) => {
          return Promise.all(
            cacheNames.map((cacheName) => caches.delete(cacheName))
          )
        })
        .then(() => {
          return self.clients.matchAll()
        })
        .then((clients) => {
          clients.forEach((client) => {
            client.postMessage({ type: 'CACHE_CLEARED' })
          })
        })
    )
  }
})
