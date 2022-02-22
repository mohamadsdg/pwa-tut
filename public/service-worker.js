importScripts(
  "https://storage.googleapis.com/workbox-cdn/releases/6.0.2/workbox-sw.js"
);
importScripts("/src/js/idb.js");
importScripts("/src/js/utility.js");
var FALLBACK_HTML_URL = "/offline.html";

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
  precacheAndRoute([{"revision":"0a27a4163254fc8fce870c8cc3a3f94f","url":"404.html"},{"revision":"2cab47d9e04d664d93c8d91aec59e812","url":"favicon.ico"},{"revision":"7a6449702d8ed25b86738131a123af10","url":"index.html"},{"revision":"d11c7965f5cfba711c8e74afa6c703d7","url":"manifest.json"},{"revision":"45352e71a80a5c75d25e226e7330871b","url":"offline.html"},{"revision":"f48e9b68ede3209c4aed2a8e3f701a82","url":"src/css/app.css"},{"revision":"9cd603275aeeb446f13ed3e7085af761","url":"src/css/feed.css"},{"revision":"1c6d81b27c9d423bece9869b07a7bd73","url":"src/css/help.css"},{"revision":"d7405b3a3c75836e92f0c282426f1eb3","url":"src/js/app.js"},{"revision":"fc48224bccca797ddbd9fa1efedc64df","url":"src/js/feed.js"},{"revision":"6b82fbb55ae19be4935964ae8c338e92","url":"src/js/fetch.js"},{"revision":"017ced36d82bea1e08b08393361e354d","url":"src/js/idb.js"},{"revision":"713af0c6ce93dbbce2f00bf0a98d0541","url":"src/js/material.min.js"},{"revision":"10c2238dcd105eb23f703ee53067417f","url":"src/js/promise.js"},{"revision":"1d39c01d8a91e835487faf02868e0903","url":"src/js/utility.js"},{"revision":"7be62fff69ec14eb3affc0376eb3b340","url":"sw-base.js"},{"revision":"6763ab705398a17924809e0718617333","url":"sw.js"},{"revision":"0484676469e9f4649940f63cac36938f","url":"workbox-f683aea5.js"},{"revision":"31b19bffae4ea13ca0f2178ddb639403","url":"src/images/main-image-lg.jpg"},{"revision":"c6bb733c2f39c60e3c139f814d2d14bb","url":"src/images/main-image-sm.jpg"},{"revision":"5c66d091b0dc200e8e89e56c589821fb","url":"src/images/main-image.jpg"},{"revision":"0f282d64b0fb306daf12050e812d6a19","url":"src/images/sf-boat.jpg"}]);

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
