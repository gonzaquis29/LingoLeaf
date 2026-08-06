// Service worker mínimo (US10.1) — solo cachea el shell estático de la app para evitar una
// pantalla en blanco ante una interrupción de red momentánea. No cachea páginas dinámicas ni
// respuestas de API: nada de esto sirve datos desactualizados de un usuario autenticado.
// Offline real (US10.2) queda fuera del MVP a propósito.
const CACHE_NAME = "lingoleaf-shell-v1";
const SHELL_ASSETS = ["/manifest.json", "/icon-192.png", "/icon-512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
  );
  self.clients.claim();
});

// Network-first: la red manda siempre que esté disponible; el caché del shell es solo un
// respaldo para esos mismos 3 archivos estáticos si la red falla en ese instante.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return
  event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
});
