// The version of the cache. This should be updated whenever the app is update.
const VERSION = 'v1';
// The name of the cache for this application.
const CACHE_NAME = `period-tracker-${VERSION}`;
const APP_STATIC_RESOURCES = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js',
  '/icons/wheel.svg',
  '/icons/circle.svg'
];

// install all resources from the server when the app is updated or initially
// installed.
self.addEventListener('install', e => {
  e.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      cache.addAll(APP_STATIC_RESOURCES);
    })()
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(
        names.map(name =>
          name !== CACHE_NAME ? caches.delete(name) : null
        )
      );
      await clients.claim();
    })()
  );
});

self.addEventListener('fetch', e => {
  // when seeking an HTML page
  if(e.request.mode === 'navigate') {
    // return to the index.html page
    e.respondWith(caches.match('/'));
    return;
  }

  // for every other request type
  e.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      const cachedResponse = await cache.match(e.request.url);
      if(cachedResponse) { return cachedResponse; }
      // everything should be in the cache. Don't go to the server if it's not
      // there.
      return new Response(null, { status: 404 });
    })()
  );
});
