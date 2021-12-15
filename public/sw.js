self.addEventListener("install", (event) => {
  console.log(
    `[Service worker] Installing serviceWroker .... ${new Date()}`,
    event
  );
});

self.addEventListener("activate", (event) => {
  console.log(
    `[Service worker] activating serviceWroker .... ${new Date()}`,
    event
  );
  return self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  console.log(
    `[Service worker] fetching serviceWroker .... ${new Date()}`,
    event
  );
  // event.respondWith(null)
});
