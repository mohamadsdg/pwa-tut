importScripts(
  "https://storage.googleapis.com/workbox-cdn/releases/6.0.2/workbox-sw.js"
);
if (workbox) {
  console.log("[ Hello ] from CDN");
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
  } = wkb;

  //#routing
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
    })
  );

  //#precache
  precacheAndRoute([{"revision":"0a27a4163254fc8fce870c8cc3a3f94f","url":"404.html"},{"revision":"2cab47d9e04d664d93c8d91aec59e812","url":"favicon.ico"},{"revision":"7a6449702d8ed25b86738131a123af10","url":"index.html"},{"revision":"d11c7965f5cfba711c8e74afa6c703d7","url":"manifest.json"},{"revision":"45352e71a80a5c75d25e226e7330871b","url":"offline.html"},{"revision":"f48e9b68ede3209c4aed2a8e3f701a82","url":"src/css/app.css"},{"revision":"9cd603275aeeb446f13ed3e7085af761","url":"src/css/feed.css"},{"revision":"1c6d81b27c9d423bece9869b07a7bd73","url":"src/css/help.css"},{"revision":"d7405b3a3c75836e92f0c282426f1eb3","url":"src/js/app.js"},{"revision":"8dec6183ba83f68b0051cbe7c4307928","url":"src/js/feed.js"},{"revision":"6b82fbb55ae19be4935964ae8c338e92","url":"src/js/fetch.js"},{"revision":"017ced36d82bea1e08b08393361e354d","url":"src/js/idb.js"},{"revision":"713af0c6ce93dbbce2f00bf0a98d0541","url":"src/js/material.min.js"},{"revision":"10c2238dcd105eb23f703ee53067417f","url":"src/js/promise.js"},{"revision":"76b25b7a9c35158fdced9adbb22b37bc","url":"src/js/utility.js"},{"revision":"7be62fff69ec14eb3affc0376eb3b340","url":"sw-base.js"},{"revision":"6763ab705398a17924809e0718617333","url":"sw.js"},{"revision":"0484676469e9f4649940f63cac36938f","url":"workbox-f683aea5.js"},{"revision":"31b19bffae4ea13ca0f2178ddb639403","url":"src/images/main-image-lg.jpg"},{"revision":"c6bb733c2f39c60e3c139f814d2d14bb","url":"src/images/main-image-sm.jpg"},{"revision":"5c66d091b0dc200e8e89e56c589821fb","url":"src/images/main-image.jpg"},{"revision":"0f282d64b0fb306daf12050e812d6a19","url":"src/images/sf-boat.jpg"}]);

  self.skipWaiting();
  clientsClaim();
} else {
  console.log("Boo! Workbox failed to load 😬");
}
