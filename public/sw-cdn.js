importScripts(
  "https://storage.googleapis.com/workbox-cdn/releases/6.0.2/workbox-sw.js"
);
importScripts("/src/js/idb.js");
importScripts("/src/js/utility.js");
var FALLBACK_HTML_URL = "/offline.html";
var urlToOpen = (defualtPage = "/") =>
  new URL(defualtPage, self.location.origin).href;

if (workbox) {
  console.log("[ Hello ] from CDN", workbox);
  workbox.setConfig({
    debug: true,
  });
  const wkb = {
    ...workbox.core,
    ...workbox.routing,
    ...workbox.precaching,
    ...workbox.strategies,
    ...workbox.cacheableResponse,
    ...workbox.expiration,
    ...workbox.backgroundSync,
  };
  const {
    clientsClaim,
    cacheNames,
    setCacheNameDetails,
    setCatchHandler,
    NavigationRoute,
    registerRoute,
    precacheAndRoute,
    createHandlerBoundToURL,
    matchPrecache,
    NetworkFirst,
    NetworkOnly,
    CacheFirst,
    CacheOnly,
    StaleWhileRevalidate,
    CacheExpiration,
    ExpirationPlugin,
    CacheableResponsePlugin,
    BackgroundSyncPlugin,
    Queue,
  } = wkb;
  console.log("all workbox interface", wkb);

  // #precache
  precacheAndRoute(self.__WB_MANIFEST);

  // #routing
  registerRoute(
    /.*(?:googleapis|gstatic)\.com.*$/,
    new StaleWhileRevalidate({
      cacheName: "google-fonts",
    })
  );

  registerRoute(
    "https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css",
    new StaleWhileRevalidate({
      cacheName: "material-css",
    })
  );

  registerRoute(
    /.*(?:firebasestorage|localhost:3000).*$/,
    new StaleWhileRevalidate({
      cacheName: "post-image",
      plugins: [
        new ExpirationPlugin({
          // Keep at most 3 entries.
          maxEntries: 6,
          // Don't keep any entries for more than 30 days.
          maxAgeSeconds: 30 * 24 * 60 * 60,
        }),
      ],
    })
  );

  registerRoute(
    "https://pwgram-30323-default-rtdb.asia-southeast1.firebasedatabase.app/posts.json",
    (ctx) => {
      // console.log("ctx", ctx);
      var { event } = ctx;
      return fetch(event.request).then(function (res) {
        var clonedRes = res.clone();
        clearAllData("posts")
          .then(() => {
            return clonedRes.json();
          })
          .then(function (data) {
            for (var key in data) {
              writeDate("posts", data[key]);
            }
          });
        return res;
      });
    }
  );

  // #setup ofline page
  // registerRoute(
  //   (match) => {
  //     const { request } = match;
  //     console.log("match", match);
  //     return request.destination === "document";
  //   },
  //   (ctx) => {
  //     const { event } = ctx;
  //     console.log("ctx", ctx);
  //   }
  // );
  registerRoute(
    new NavigationRoute(async (params) => {
      try {
        // Attempt a network request.
        return await new CacheFirst().handle(params);
      } catch (error) {
        console.log("registerRoute->NavigationRoute->error", error);
        // If it fails, return the cached HTML.
        return matchPrecache(FALLBACK_HTML_URL);

        // return caches.match(FALLBACK_HTML_URL, {
        //   cacheName: cacheNames.precache,
        // });
      }
    })
  );

  // #bgSync
  // retry them when future sync events are fired
  registerRoute(
    "http://localhost:3000/api/savePost",
    new NetworkOnly({
      plugins: [
        new BackgroundSyncPlugin("sync-new-post", {
          maxRetentionTime: 24 * 60, // Retry for max of 24 Hours (specified in minutes)
          onSync: ({ queue }) => {
            // console.log("[BackgroundSyncPlugin] onSync", queue);
            queue.replayRequests();
          },
        }),
      ],
    }),
    "POST"
  );

  self.skipWaiting();
  clientsClaim();
} else {
  console.log("Boo! Workbox failed to load 😬");
}

// push notification
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
    vibrate: [100, 50, 200],
    image: obj.img,
    data: {
      openUrl: obj.url,
    },
  });
  event.waitUntil(promiseChain);
});
