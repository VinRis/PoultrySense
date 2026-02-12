// A simple, no-op service worker that exists to make the app installable.

self.addEventListener('install', () => {
  // Skip waiting, so the new service worker activates immediately.
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Take control of all clients as soon as the service worker activates.
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Do nothing. The browser will handle all network requests as usual.
  return;
});
