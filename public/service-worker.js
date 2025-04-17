// public/service-worker.js
const CACHE_NAME = "memoryDom-cache-v2";
const urlsToCache = [
    "/styles.css",
    "/client.js",
      "/offline.html",
    "/images/profilePic.jpg",
    "/icons/icon-192x192.png",
    "/icons/icon-512x512.png"
  ];
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
  
  