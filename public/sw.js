// This is a basic service worker file.
// It's required for the app to be installable (PWA).

self.addEventListener('install', (event) => {
  // console.log('Service Worker: Installing...');
  // You can add caching logic here for offline support.
});

self.addEventListener('activate', (event) => {
  // console.log('Service Worker: Activating...');
});

self.addEventListener('fetch', (event) => {
  // For now, we just pass the request through to the network.
  event.respondWith(fetch(event.request));
});
