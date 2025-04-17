const CACHE_NAME = "memoryDom-cache-v3";
const urlsToCache = [
  "/styles.css",
  "/client.js",
  "/offline.html",
  "/images/profilePic.jpg",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png"
];

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

// Activate event
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch event
self.addEventListener("fetch", (event) => {
  const req = event.request;
  const isStaticAsset = req.url.match(/\.(css|js|png|jpg|svg|woff2?)$/);

  if (!isStaticAsset) {
    return;
  }

  event.respondWith(
    caches.match(req).then((res) => {
      return res || fetch(req).then((response) => {
        return caches.open(CACHE_NAME).then((cache) => {
          cache.put(req, response.clone());
          return response;
        });
      });
    })
  );
});
