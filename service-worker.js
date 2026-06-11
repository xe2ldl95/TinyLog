const CACHE = 'tinylog-v2';
const FILES = [
    '/',
    '/index.html',
    '/manifest.json',
    '/css/style.css',
    '/js/main.js',
    '/js/storage.js',
    '/js/adif.js',
    '/js/settings.js',
    '/js/ui.js',
    '/js/logForms.js',
    '/js/qsoView.js',
    '/js/stats.js',
    '/js/map.js',
    '/icon.svg',
    '/icon-192.png',
    '/icon-512.png'
];

self.addEventListener('install', e => {
    e.waitUntil(
        caches.open(CACHE).then(cache => cache.addAll(FILES))
    );
    self.skipWaiting();
});

self.addEventListener('activate', e => {
    e.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
        )
    );
    self.clients.claim();
});

self.addEventListener('fetch', e => {
    if (e.request.url.endsWith('/favicon.ico')) {
        e.respondWith(caches.match('/icon.svg'));
        return;
    }
    e.respondWith(
        caches.match(e.request).then(res => res || fetch(e.request))
    );
});
