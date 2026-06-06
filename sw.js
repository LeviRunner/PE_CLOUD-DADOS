const CACHE_NAME = 'study-tracker-v9';
const RUNTIME_CACHE = 'study-tracker-runtime-v9';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/style.css',
    '/app.js',
    '/manifest.json'
];

// Install Event - Cache static assets
self.addEventListener('install', (event) => {
    console.log('Service Worker installing...');

    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Caching app shell');
                return cache.addAll(ASSETS_TO_CACHE);
            })
            .then(() => self.skipWaiting())
    );
});

// Activate Event - Clean up old caches
self.addEventListener('activate', (event) => {
    console.log('Service Worker activating...');

    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch Event - Cache-first strategy for assets, network-first for data
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip cross-origin requests
    if (url.origin !== location.origin) {
        return;
    }

    // Cache-first strategy for static assets
    if (isStaticAsset(request)) {
        event.respondWith(
            caches.match(request)
                .then((response) => {
                    if (response) {
                        console.log('Serving from cache:', request.url);
                        return response;
                    }

                    return fetch(request)
                        .then((response) => {
                            // Clone the response
                            const responseToCache = response.clone();

                            // Cache the new response
                            caches.open(CACHE_NAME)
                                .then((cache) => {
                                    cache.put(request, responseToCache);
                                });

                            return response;
                        })
                        .catch(() => {
                            // Return offline fallback if available
                            return caches.match('/index.html');
                        });
                })
        );
        return;
    }

    // Network-first strategy for API calls and data
    if (isDataRequest(request)) {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    // Clone and cache successful responses
                    if (response && response.status === 200) {
                        const responseToCache = response.clone();
                        caches.open(RUNTIME_CACHE)
                            .then((cache) => {
                                cache.put(request, responseToCache);
                            });
                    }
                    return response;
                })
                .catch(() => {
                    // Fall back to cache or offline page
                    return caches.match(request)
                        .then((response) => {
                            return response || caches.match('/index.html');
                        });
                })
        );
        return;
    }

    // Default: network-first
    event.respondWith(
        fetch(request)
            .then((response) => response)
            .catch(() => {
                return caches.match(request)
                    .then((response) => {
                        return response || caches.match('/index.html');
                    });
            })
    );
});

// Helper functions
function isStaticAsset(request) {
    const url = new URL(request.url);
    return request.method === 'GET' && (
        url.pathname.endsWith('.js') ||
        url.pathname.endsWith('.css') ||
        url.pathname.endsWith('.png') ||
        url.pathname.endsWith('.jpg') ||
        url.pathname.endsWith('.jpeg') ||
        url.pathname.endsWith('.gif') ||
        url.pathname.endsWith('.svg') ||
        url.pathname.endsWith('.woff') ||
        url.pathname.endsWith('.woff2') ||
        url.pathname.endsWith('.ttf') ||
        url.pathname.endsWith('.eot') ||
        url.pathname === '/' ||
        url.pathname.endsWith('/index.html')
    );
}

function isDataRequest(request) {
    const url = new URL(request.url);
    return request.method === 'GET' && (
        url.pathname.endsWith('.json') ||
        url.pathname.includes('/api/') ||
        url.pathname.includes('/data/')
    );
}

// Message handling for cache invalidation
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }

    if (event.data && event.data.type === 'CACHE_URLS') {
        const urlsToCache = event.data.urls;
        caches.open(CACHE_NAME).then((cache) => {
            cache.addAll(urlsToCache);
        });
    }
});

// Background sync for progress data
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-progress') {
        event.waitUntil(
            // Sync progress data if needed
            caches.open(RUNTIME_CACHE)
                .then((cache) => {
                    return cache.match('/progress.json');
                })
                .then((response) => {
                    if (response) {
                        return response.json();
                    }
                    return null;
                })
                .then((progressData) => {
                    // You could send this to a server here if needed
                    console.log('Progress synced:', progressData);
                })
        );
    }
});

// Periodic background sync (if supported)
if ('periodicSync' in ServiceWorkerRegistration.prototype) {
    self.addEventListener('periodicsync', (event) => {
        if (event.tag === 'sync-progress-periodic') {
            event.waitUntil(
                // Check and sync progress
                Promise.resolve()
            );
        }
    });
}

console.log('Service Worker loaded');
