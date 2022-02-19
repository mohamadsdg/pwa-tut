if (!self.define) {
  let e,
    s = {};
  const c = (c, i) => (
    (c = new URL(c + ".js", i).href),
    s[c] ||
      new Promise((s) => {
        if ("document" in self) {
          const e = document.createElement("script");
          (e.src = c), (e.onload = s), document.head.appendChild(e);
        } else (e = c), importScripts(c), s();
      }).then(() => {
        let e = s[c];
        if (!e) throw new Error(`Module ${c} didn’t register its module`);
        return e;
      })
  );
  self.define = (i, r) => {
    const d =
      e ||
      ("document" in self ? document.currentScript.src : "") ||
      location.href;
    if (s[d]) return;
    let f = {};
    const a = (e) => c(e, d),
      n = { module: { uri: d }, exports: f, require: a };
    s[d] = Promise.all(i.map((e) => n[e] || a(e))).then((e) => (r(...e), f));
  };
}
define(["./workbox-f683aea5"], function (e) {
  "use strict";
  self.addEventListener("message", (e) => {
    e.data && "SKIP_WAITING" === e.data.type && self.skipWaiting();
  }),
    e.precacheAndRoute(
      [
        { url: "404.html", revision: "0a27a4163254fc8fce870c8cc3a3f94f" },
        { url: "favicon.ico", revision: "2cab47d9e04d664d93c8d91aec59e812" },
        { url: "index.html", revision: "1ed2512c7ecb0c50170508ec8686386e" },
        { url: "manifest.json", revision: "d11c7965f5cfba711c8e74afa6c703d7" },
        { url: "offline.html", revision: "45352e71a80a5c75d25e226e7330871b" },
        {
          url: "src/css/app.css",
          revision: "f48e9b68ede3209c4aed2a8e3f701a82",
        },
        {
          url: "src/css/feed.css",
          revision: "2079c5fdf053a3ea25e94d20738db08c",
        },
        {
          url: "src/css/help.css",
          revision: "1c6d81b27c9d423bece9869b07a7bd73",
        },
        { url: "src/js/app.js", revision: "d7405b3a3c75836e92f0c282426f1eb3" },
        { url: "src/js/feed.js", revision: "04bc6c787db0ded0266c735b7dc17f85" },
        {
          url: "src/js/fetch.js",
          revision: "6b82fbb55ae19be4935964ae8c338e92",
        },
        { url: "src/js/idb.js", revision: "017ced36d82bea1e08b08393361e354d" },
        {
          url: "src/js/material.min.js",
          revision: "713af0c6ce93dbbce2f00bf0a98d0541",
        },
        {
          url: "src/js/promise.js",
          revision: "10c2238dcd105eb23f703ee53067417f",
        },
        {
          url: "src/js/utility.js",
          revision: "76b25b7a9c35158fdced9adbb22b37bc",
        },
        { url: "sw.js", revision: "78fb313272c9fcbdf25fe97f859074d6" },
        {
          url: "src/images/main-image-lg.jpg",
          revision: "31b19bffae4ea13ca0f2178ddb639403",
        },
        {
          url: "src/images/main-image-sm.jpg",
          revision: "c6bb733c2f39c60e3c139f814d2d14bb",
        },
        {
          url: "src/images/main-image.jpg",
          revision: "5c66d091b0dc200e8e89e56c589821fb",
        },
        {
          url: "src/images/sf-boat.jpg",
          revision: "0f282d64b0fb306daf12050e812d6a19",
        },
      ],
      { ignoreURLParametersMatching: [/^utm_/, /^fbclid$/] }
    );
});
//# sourceMappingURL=service-worker.js.map
