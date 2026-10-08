/* Service worker do Super Lula World.
   Estratégia "network-first": online sempre pega a versão mais nova (evita
   ficar preso em cache antigo); offline cai no cache. */
const CACHE = "slw-v32";
const ASSETS = [
  "./", "./index.html",
  "./css/style.css?v=32", "./js/levels.js?v=32", "./js/game.js?v=32",
  "./icons/icon-192.png", "./icons/icon-512.png", "./icons/apple-touch-icon.png"
];
self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).catch(()=>{}).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    fetch(e.request).then((r) => {
      const cp = r.clone(); caches.open(CACHE).then((c) => c.put(e.request, cp)).catch(()=>{});
      return r;
    }).catch(() => caches.match(e.request).then((m) => m || caches.match("./index.html")))
  );
});
