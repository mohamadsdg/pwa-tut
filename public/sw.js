self.addEventListener("install", function (event) {
  console.log("[Service Worker] Installing Service Worker ...");
  event.waitUntil(
    caches.open("static").then(function (cache) {
      console.log("[Service Worker] precaching app shell");
      cache.addAll([
        "/",
        "/index.html",
        "/manifest.json",
        "/src/js/app.js",
        "/src/js/feed.js",
        "/src/js/fetch.js",
        "/src/js/promise.js",
        "/src/js/material.min.js",
        "src/images/main-image.jpg",
        "/src/css/app.css",
        "/src/css/feed.css",
        "https://fonts.googleapis.com/css?family=Roboto:400,700",
        "https://fonts.googleapis.com/icon?family=Material+Icons",
        "https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css",
      ]);
    })
  );
});

self.addEventListener("activate", function (event) {
  console.log("[Service Worker] Activating Service Worker ....");
  return self.clients.claim();
});

self.addEventListener("fetch", function (event) {
  console.log("[Service Worker] Fetching something ....");

  return event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      } else {
        return fetch(event.request).then(function (res) {
          return caches
            .open("dynamic")
            .then(function (cache) {
              cache.put(event.request.url, res.clone());
              return res;
            })
            .catch((err) => {
              console.log("[Service Worker] dynamicCaching ", err);
            });
        });
      }
    })
  );
});
