// Lecture (ليكچر) — service worker v1.9
// The app opens without internet. The app's own files are fetched from the network first, so a new version
// appears as soon as the device is online; the copy in the cache is used only when the network fails.
// Fixed, versioned libraries (pdf.js, Firebase, RDKit, fonts) are served from the cache once downloaded.
// AI, sign-in (including the /__/auth/ handler on the app's own domain) and database requests are never cached.
const CACHE = 'lecture-v1.9';
const SHELL = ['./', './index.html', './manifest.json', './apple-touch-icon.png', './icon-192.png', './icon-512.png', './icon-maskable-512.png'];
const LIBS = /^(cdnjs\.cloudflare\.com|cdn\.jsdelivr\.net|fonts\.googleapis\.com|fonts\.gstatic\.com|www\.gstatic\.com)$/;

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).catch(() => { /* first visit offline: nothing to cache yet */ }));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const own = url.origin === self.location.origin;
  if (!own && !LIBS.test(url.hostname)) return;
  if (own && url.pathname.startsWith('/__/')) return; // Firebase sign-in handler and reserved URLs: always live, never cached
  if (own) {
    e.respondWith(fetch(req).then((res) => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
      return res;
    }).catch(() => caches.match(req, { ignoreSearch: true }).then((hit) => hit || caches.match('./index.html'))));
    return;
  }
  e.respondWith(caches.match(req).then((hit) => hit || fetch(req).then((res) => {
    if (res.ok || res.type === 'opaque') { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
    return res;
  })));
});
