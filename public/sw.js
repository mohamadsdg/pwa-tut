importScripts("/src/js/idb.js");
importScripts("/src/js/utility.js");

var CACHE_STATIC_NAME = "static-v7.8";
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
var urlToOpen = (defualtPage = "/") =>
  new URL(defualtPage, self.location.origin).href;

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
  // console.log("[Service Worker] FetchEvent", event);
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

self.addEventListener("sync", function (event) {
  console.log("[Service Worker] Background Syncing", event);
  if (event.tag === "sync-new-post") {
    event.waitUntil(
      readAllData("synce-posts").then((data) => {
        for (const x of data) {
          var postData = new FormData();
          postData.append("id", x.id);
          postData.append("title", x.title);
          postData.append("location", x.location);
          if (x.image) postData.append("file", x.image, x.id + ".png");

          fetch(
            // "https://pwgram-30323-default-rtdb.asia-southeast1.firebasedatabase.app/posts.json",
            "http://localhost:3000/api/savePost",
            {
              method: "POST",
              body: postData,
            }
          )
            .then((res) => {
              // console.log("Send Data", res);
              if (res.ok) {
                deletedItemFromData("synce-posts", x.id).then(() => {
                  console.log(`clear sync-post ${x.id} after send successfull`);
                });
              }
            })
            .catch((err) => {
              console.error("Error while sending data", err);
            });
        }
      })
    );
  }
});

self.addEventListener("notificationclick", function (event) {
  console.log("[Service Worker] Notification Click", event);
  const notifData = event.notification.data;

  if (event.action === "confirm") {
    console.log("confirm action was chosen");
    event.notification.close();
  } else {
    // console.log(event.action);

    const promiseChain = clients
      .matchAll({
        type: "window",
        includeUncontrolled: true,
      })
      .then((windowClients) => {
        let matchingClient = null;
        console.log("windowClients", windowClients);
        for (let i = 0; i < windowClients.length; i++) {
          const windowClient = windowClients[i];
          if (windowClient.url === urlToOpen(notifData.openUrl)) {
            matchingClient = windowClient;
            break;
          }
        }
        if (matchingClient) {
          return matchingClient.focus();
        } else {
          return clients.openWindow(urlToOpen(notifData.openUrl));
        }
      });

    event.waitUntil(promiseChain);
    event.notification.close();
  }
});

self.addEventListener("notificationclose", function (event) {
  console.log("[Service Worker] Notification Close", event);
});

self.addEventListener("push", function (event) {
  var obj = event.data.json();
  console.log("[Service Worker] Push Notification received", event, obj);
  const promiseChain = self.registration.showNotification(obj.title, {
    body: obj.content,
    icon: "/src/images/icons/app-icon-96x96.png",
    badge: "/src/images/icons/app-icon-96x96.png",
    data: {
      openUrl: obj.url,
    },
  });
  event.waitUntil(promiseChain);
});
