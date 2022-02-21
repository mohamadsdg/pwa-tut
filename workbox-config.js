module.exports = {
  globDirectory: "public/",
  globPatterns: ["**/*.{html,ico,json,css,js}", "src/images/*.{png,jpg}"],
  swSrc: "public/sw-base.js",
  swDest: "public/service-worker.js",
  globIgnores: ["help/**"],
  // ignoreURLParametersMatching: [/^utm_/, /^fbclid$/],
};
