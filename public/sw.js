const CACHE = 'finora-v1'
const ASSETS = ['/', '/index.html', '/manifest.json', '/sw.js']

self.addEventListener('install', (event) => {
  self.skipWaiting()
  caches.open(CACHE).then((cache) => cache.addAll(ASSETS).catch(() => {}))
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})
