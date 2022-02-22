module.exports = {
  globDirectory: "public/",
  globPatterns: [
    "**/*.{html,ico,json,css}",
    "src/images/*.{png,jpg}",
    "src/js/*.min.js",
  ],
  swSrc: "public/sw-cdn.js",
  swDest: "public/service-worker.js",
  globIgnores: ["help/**"],
  // ignoreURLParametersMatching: [/^utm_/, /^fbclid$/],
};
