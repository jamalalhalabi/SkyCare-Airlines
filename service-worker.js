/* =========================================================
   SKYCARE NAVIGATOR | SERVICE WORKER
   ---------------------------------------------------------
   Two kinds of cache, kept logically separate:

   1. APP SHELL  "skycare-navigator-vN"
      index.html, styles.css, script.js, demo data, icons,
      manifest (plus same-origin files fetched later).
      Replaced when CACHE_VERSION changes.

   2. AIRPORT PACKS  "skycare-pack-<CODE>"  (e.g. skycare-pack-IST)
      Written by the page when a traveler downloads a pack and
      deleted by the page when they remove it. Device-level:
      they survive new versions of the app and new trips.

   Trip data is NEVER stored here. The active trip lives in
   the page's sessionStorage and is discarded when a new
   ticket loads, so resetting a trip never touches either
   cache and never unregisters this worker.

   Works on GitHub Pages (https) and localhost. Browsers do
   not run service workers when index.html is opened from a
   folder (file://); the site still works there, just without
   offline caching.

   All paths are RELATIVE so the site works inside the
   /SkyCare-Airlines/ sub-folder on GitHub Pages.

   When you change any file, bump CACHE_VERSION so visitors
   get the new version.
   ========================================================= */

const CACHE_VERSION = "skycare-navigator-v2";
const SHELL_PREFIX = "skycare-navigator-";

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

function cacheShell() {
  return caches.open(CACHE_VERSION).then((cache) => cache.addAll(CORE_FILES));
}

self.addEventListener("install", (event) => {
  event.waitUntil(cacheShell().then(() => self.skipWaiting()));
});

// Remove OLD app-shell versions only. Airport-pack caches are left alone.
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys
        .filter((k) => k.indexOf(SHELL_PREFIX) === 0 && k !== CACHE_VERSION)
        .map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// The page asks for the shell to be (re)cached after a pack download
// or after "Clear All SkyCare Data" removed it.
self.addEventListener("message", (event) => {
  const type = event.data && event.data.type;
  if (type === "CACHE_SHELL" || type === "CACHE_PACKS") {
    event.waitUntil ? event.waitUntil(cacheShell().catch(() => {})) : cacheShell().catch(() => {});
  }
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  if (url.origin === self.location.origin) {
    // Airport-pack resources exist only in their own pack cache.
    if (url.pathname.indexOf("/packs/") > -1) {
      event.respondWith(caches.match(req).then((hit) => hit || new Response("Airport pack not on this device.", { status: 404 })));
      return;
    }
    // App shell: network first (fresh when online), cache when offline.
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
