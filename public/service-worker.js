let CACHE_NAME = "budget-cache-v1"
let DATA_CACHE_NAME = "data-cache-v1"

const FILES_TO_CACHE = [
    "/",
    "/db.js",
    "/index.html",
    "/index.js",
    "/styles.css",
    "/icons/icon-192x192.png",
    "/icons/icon-512x512.png",

  ];

self.addEventListener("install", event => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then(cache => cache.addAll(FILES_TO_CACHE))
      .then(() => self.skipWaiting())
  );
});

// self.addEventListener("fetch", e => {
//   if(e.request.url.includes("/api/")){
//     e.respondWith(caches.open(DATA_CACHE_NAME )).then(cache => {
//       return fetch(e.request).then(res => {
//         if(res.status === 200){
//           cache.put(e.request.url, res.clone())
//         }
//         return res;
//       }).catch(err => {
//         return cache.match(e.request)
//       })
//     }).catch(err => {
//       console.log(err);
//     })
//     return 
//   }
// })






















// const STATIC_CACHE = "static-cache-v1";
// const RUNTIME_CACHE = "runtime-cache";

// self.addEventListener("install", event => {
//   event.waitUntil(
//     caches
//       .open(CACHE_NAME)
//       .then(cache => cache.addAll(FILES_TO_CACHE))
//       .then(() => self.skipWaiting())
//   );
// });

// The activate handler takes care of cleaning up old caches.
self.addEventListener("activate", event => {
  const currentCaches = [CACHE_NAME, DATA_CACHE_NAME];
  event.waitUntil(
    caches
      .keys()
      .then(cacheNames => {
        // return array of cache names that are old to delete
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
  // non GET requests are not cached and requests to other origins are not cached
  if (
    event.request.method !== "GET" ||
    !event.request.url.includes("/api/")
  ) {
    event.respondWith(fetch(event.request));
    return;
  }

  // use cache first for all other requests for performance
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) {
        return cachedResponse;
      }

      // request is not in cache. make network request and cache the response
      return caches.open(DATA_CACHE_NAME).then(cache => {
        return fetch(event.request).then(response => {
          return cache.put(event.request, response.clone()).then(() => {
            return response;
          });
        });
      });
    })
  );
});



