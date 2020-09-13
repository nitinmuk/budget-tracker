const FILES_TO_CACHE = [
  "/",
  "/index.html",
  "/styles.css",
  "/dist/bundle.js",
  "/dist/manifest.json",
  "/dist/icon_192x192.png",
  "/dist/icon_512x512.png",
  "https://cdn.jsdelivr.net/npm/chart.js@2.8.0",
  "https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css"
];

const PRECACHE = "precache-v1";
const RUNTIME = "runtime";

self.addEventListener("install", event => {
  event.waitUntil(
    caches
      .open(PRECACHE)
      .then(cache => cache.addAll(FILES_TO_CACHE))
      .then(self.skipWaiting())
  );
});

// The activate handler takes care of cleaning up old caches.
self.addEventListener("activate", event => {
  const currentCaches = [PRECACHE, RUNTIME];
  event.waitUntil(
    caches
      .keys()
      .then(cacheNames => {
        return cacheNames.filter(
          cacheName => !currentCaches.includes(cacheName)
        );
      })
      .then(cachesToDelete => {
        return Promise.all(
          cachesToDelete.map(cacheToDelete => {
            return caches.delete(cacheToDelete);
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  if (event.request.url.includes("http") && event.request.method === "GET") {
    return handleGetRequest(event);
  }
});
/**
 * returns cached response for all GET requests except /api/transaction
 * for /api/transaction it fetches request and update cache with the response
 * In case network error then responds with current cached response of /api/transaction
 * @param {GET fetch event} event
 */
function handleGetRequest(event) {
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (!event.request.url.includes("/api/transaction") && cachedResponse) {
        return cachedResponse;
      }
      return caches
        .open(RUNTIME)
        .then(cache => {
          return fetch(event.request)
            .then(response => {
              if (response.status === 200) {
                cache.put(event.request, response.clone());
              }
              return response;
            })
            .catch(error => {
              // Network request failed, try to get it from the cache.
              console.log(error);
              return cache.match(event.request);
            });
        })
        .catch(error => console.log(error));
    })
  );
}
