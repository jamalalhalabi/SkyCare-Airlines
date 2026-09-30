/* =========================================================
   SKYCARE NAVIGATOR | SERVICE WORKER (offline airport packs)
   ---------------------------------------------------------
   Caches the site, the demo itinerary, the demo airport map,
   and the phrase book so the prototype works without a
   connection after the first visit.

   Works on GitHub Pages (https) and localhost. Browsers do
   not run service workers when index.html is opened from a
   folder (file://); the site still works there, just without
   offline caching.

   All paths are RELATIVE so the site works inside the
   /SkyCare-Airlines/ sub-folder on GitHub Pages.

   When you change any file, bump CACHE_VERSION so visitors
   get the new version.
   ========================================================= */

const CACHE_VERSION = "skycare-navigator-v1";

const CORE_FILES = [
  "./",
  "./index.html",
  "./styles.css",
  "./script.js",
  "./data/demo-data.js",
  "./manifest.webmanifest",
  "./images/favicon.svg",
  "./images/icon-192.png",
  "./images/icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(CORE_FILES)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// "Download pack" buttons ask the worker to refresh the offline copy.
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "CACHE_PACKS") {
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(CORE_FILES)).catch(() => {});
  }
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  // Same-origin files: network first (fresh when online), cache when offline.
  if (url.origin === self.location.origin) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res && res.ok) {
            const copy = res.clone();
            caches.open(CACHE_VERSION).then((cache) => cache.put(req, copy));
          }
          return res;
        })
        .catch(() => caches.match(req, { ignoreSearch: true }).then((hit) => hit || caches.match("./index.html")))
    );
    return;
  }

  // Google Fonts: cache after first use so typography survives offline.
  if (url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com") {
    event.respondWith(
      caches.match(req).then((hit) => hit || fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(CACHE_VERSION).then((cache) => cache.put(req, copy));
        return res;
      }).catch(() => new Response("", { status: 503 })))
    );
  }
});
