importScripts("/src/js/idb.js");
importScripts("/src/js/utility.js");

var CACHE_STATIC_NAME = "static-v3.1";
var CACHE_DYNAMIC_NAME = "dynamic-v2.1";
var STATIC_ASSET = [
  "/",
  "/index.html",
  "/offline.html",
  "/src/js/app.js",
  "/src/js/feed.js",
  "/src/js/promise.js",
  "/src/js/material.min.js",
  "/src/css/app.css",
  "/src/css/feed.css",
  "/src/images/main-image.jpg",
  "https://fonts.googleapis.com/css?family=Roboto:400,700",
  "https://fonts.googleapis.com/icon?family=Material+Icons",
  "https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css",
];

// function trimCache(cacheName, maxItem) {
//   caches.open(cacheName).then((cache) => {
//     return cache.keys().then((keylist) => {
//       if (keylist.length > maxItem) {
//         cache.delete(keylist[0]).then(trimCache(cacheName, maxItem));
//       }
//     });
//   });
// }

var dbPromise = idb.open("posts-store", 1, function (db) {
  if (!db.objectStoreNames.contains("posts")) {
    db.createObjectStore("posts", { keyPath: "id" });
  }
});

self.addEventListener("install", function (event) {
  console.log("[Service Worker] Installing Service Worker ...");
  event.waitUntil(
    caches.open(CACHE_STATIC_NAME).then(function (cache) {
      console.log("[Service Worker] precaching app shell");
      cache.addAll(STATIC_ASSET);
    })
  );
});

self.addEventListener("activate", function (event) {
  console.log("[Service Worker] Activating Service Worker ....");
  event.waitUntil(
    caches.keys().then(function (keylist) {
      return Promise.all(
        keylist.map(function (key) {
          if (key !== CACHE_STATIC_NAME && key !== CACHE_DYNAMIC_NAME) {
            caches.delete(key);
            console.log(`[Service Worker] removing cache ${key}`);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// self.addEventListener("fetch", function (event) {
//   console.log("[Service Worker] Fetching something ....");

//   return event.respondWith(
//     caches.match(event.request).then((response) => {
//       if (response) {
//         return response;
//       } else {
//         return fetch(event.request)
//           .then(function (res) {
//             return caches.open(CACHE_DYNAMIC_NAME).then(function (cache) {
//               cache.put(event.request.url, res.clone());
//               return res;
//             });
//           })
//           .catch(() => {
//             return caches.open(CACHE_STATIC_NAME).then((cache) => {
//               return cache.match("/offline.html");
//             });
//           });
//       }
//     })
//   );
// });

// cache only
// self.addEventListener("fetch", function (event) {
//   console.log("[Service Worker] Fetching something ....", event);
//   event.respondWith(caches.match(event.request));
// });

// network only
// self.addEventListener("fetch", function (event) {
//   console.log("[Service Worker] Fetching something ....", event);
//   event.respondWith(fetch(event.request));
// });

// network with cache fallback
// self.addEventListener("fetch", function (event) {
//   console.log("[Service Worker] Fetching something ....");

//   return event.respondWith(
//     fetch(event.request)
//       .then((res) => {
//         return caches.open(CACHE_DYNAMIC_NAME).then((cache) => {
//           cache.put(event.request.url, res.clone());
//           return res;
//         });
//       })
//       .catch(() => {
//         return caches.match(event.request);
//       })
//   );
// });

function isInArray(string, array) {
  for (let index = 0; index < array.length; index++) {
    if (array[index] == string) {
      return true;
    }
  }
  return false;
}

// cache then network
self.addEventListener("fetch", function (event) {
  // console.log("event.request.url", event.request.url);
  var url =
    "https://pwgram-30323-default-rtdb.asia-southeast1.firebasedatabase.app/posts.json";

  if (event.request.url.indexOf(url) > -1) {
    event.respondWith(
      fetch(event.request).then(function (res) {
        var clonedRes = res.clone();
        clearAllData("posts")
          .then(() => {
            return clonedRes.json();
          })
          .then(function (data) {
            for (var key in data) {
              writeDate("posts", data[key]);
              // .then((x) => {
              //   console.log("writeDate", key);
              //   deletedItemFromData("posts", key);
              // });
            }
          });
        return res;
      })
    );
  } else if (isInArray(event.request.url, STATIC_ASSET)) {
    return event.respondWith(caches.match(event.request));
  } else {
    return event.respondWith(
      caches.match(event.request).then((response) => {
        if (response) {
          return response;
        } else {
          return fetch(event.request)
            .then(function (res) {
              return caches.open(CACHE_DYNAMIC_NAME).then(function (cache) {
                // trimCache(CACHE_DYNAMIC_NAME, 3);
                cache.put(event.request.url, res.clone());
                return res;
              });
            })
            .catch(() => {
              return caches.open(CACHE_STATIC_NAME).then((cache) => {
                return cache.match("/offline.html");
              });
            });
        }
      })
    );
  }
});
