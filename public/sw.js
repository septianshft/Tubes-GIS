// 🔄 LaundryMap Service Worker
// Provides offline functionality and caching

const CACHE_NAME = 'laundrymap-v1.1.0';
const STATIC_CACHE = 'laundrymap-static-v1';
const DYNAMIC_CACHE = 'laundrymap-dynamic-v1';

// Files to cache for offline functionality
const STATIC_FILES = [
  '/',
  '/index.html',
  '/script.js',
  '/enhancements.js',
  '/choropleth.js',
  '/enhancements.css',
  '/style.css',
  '/manifest.json',
  
  // External CDN resources (cached for offline)
  'https://cdn.tailwindcss.com',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
  'https://unpkg.com/leaflet-routing-machine@latest/dist/leaflet-routing-machine.css',
  'https://unpkg.com/leaflet-routing-machine@latest/dist/leaflet-routing-machine.js',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// API endpoints to cache
const API_ENDPOINTS = [
  '/api/laundries',
  '/api/search'
];

// Install event - cache static files
self.addEventListener('install', (event) => {
  console.log('[SW] Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Caching static files');
        return cache.addAll(STATIC_FILES);
      })
      .catch((error) => {
        console.error('[SW] Error caching static files:', error);
      })
  );
  
  // Skip waiting and immediately activate
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        // Take control of all pages immediately
        return self.clients.claim();
      })
  );
});

// Fetch event - serve cached content when offline
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request));
    return;
  }
  
  // Handle static file requests
  event.respondWith(
    caches.match(request)
      .then((response) => {
        // Return cached version if available
        if (response) {
          return response;
        }
        
        // Fetch from network and cache dynamic content
        return fetch(request)
          .then((fetchResponse) => {
            // Only cache successful responses
            if (fetchResponse.status === 200) {
              const responseClone = fetchResponse.clone();
              
              caches.open(DYNAMIC_CACHE)
                .then((cache) => {
                  cache.put(request, responseClone);
                });
            }
            
            return fetchResponse;
          })
          .catch(() => {
            // Return offline page or cached content
            if (request.destination === 'document') {
              return caches.match('/index.html');
            }
          });
      })
  );
});

// Handle API requests with cache-first strategy for better offline experience
async function handleApiRequest(request) {
  const url = new URL(request.url);
  
  try {
    // Try network first for fresh data
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache successful API responses
      const responseClone = networkResponse.clone();
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, responseClone);
      
      return networkResponse;
    }
  } catch (error) {
    console.log('[SW] Network failed, trying cache for:', url.pathname);
  }
  
  // Fallback to cache if network fails
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // Return offline response for API requests
  return new Response(
    JSON.stringify({
      error: 'Offline',
      message: 'You are currently offline. Please check your internet connection.',
      cached: false
    }),
    {
      status: 503,
      statusText: 'Service Unavailable',
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );
}

// Background sync for when connection is restored
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Sync pending data when online
      syncPendingData()
    );
  }
});

// Handle push notifications (for future implementation)
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [200, 100, 200],
    data: data.data || {},
    actions: [
      {
        action: 'view',
        title: 'View Details',
        icon: '/icons/icon-96x96.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
        icon: '/icons/icon-96x96.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Sync pending data when online
async function syncPendingData() {
  try {
    // Get pending favorites, searches, etc. from IndexedDB
    // and sync with server when online
    console.log('[SW] Syncing pending data...');
    
    // Implementation would depend on what data needs syncing
    // For now, just clear old cache entries
    const cache = await caches.open(DYNAMIC_CACHE);
    const requests = await cache.keys();
    
    // Remove old cached API responses to get fresh data
    const oldApiRequests = requests.filter(request => {
      const url = new URL(request.url);
      return url.pathname.startsWith('/api/');
    });
    
    await Promise.all(
      oldApiRequests.map(request => cache.delete(request))
    );
    
    console.log('[SW] Pending data synced successfully');
  } catch (error) {
    console.error('[SW] Error syncing pending data:', error);
  }
}

// Periodic background sync for data freshness
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'content-sync') {
    event.waitUntil(
      syncPendingData()
    );
  }
});

// Handle cache storage quota exceeded
self.addEventListener('error', (event) => {
  console.error('[SW] Error occurred:', event.error);
  
  if (event.error && event.error.name === 'QuotaExceededError') {
    // Clean up old cache entries
    caches.open(DYNAMIC_CACHE)
      .then((cache) => cache.keys())
      .then((requests) => {
        // Remove oldest 10 entries
        const oldestRequests = requests.slice(0, 10);
        return Promise.all(
          oldestRequests.map(request => cache.delete(request))
        );
      });
  }
});
