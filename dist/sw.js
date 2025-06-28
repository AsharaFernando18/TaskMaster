// Enhanced Service Worker for TaskMaster Pro
// Provides advanced offline functionality and caching strategies

const CACHE_NAME = 'taskmaster-pro-v2.0';
const STATIC_CACHE = 'taskmaster-static-v2.0';
const DYNAMIC_CACHE = 'taskmaster-dynamic-v2.0';

const urlsToCache = [
  '/',
  '/index.html',
  '/app.js',
  '/manifest.json',
  'https://cdn.tailwindcss.com',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap'
];

// Install event - cache resources with improved strategy
self.addEventListener('install', event => {
  console.log('🔧 TaskMaster Pro Service Worker installing...');
  
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then(cache => {
        console.log('📦 Caching static assets');
        return cache.addAll(urlsToCache);
      }),
      self.skipWaiting()
    ])
  );
});

// Activate event - clean up old caches and claim clients
self.addEventListener('activate', event => {
  console.log('✅ TaskMaster Pro Service Worker activated');
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('🗑️ Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Claim all clients
      self.clients.claim()
    ])
  );
});

// Fetch event - advanced caching strategy
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Handle different types of requests
  if (request.method === 'GET') {
    // Static assets - cache first strategy
    if (urlsToCache.some(cachedUrl => request.url.includes(cachedUrl))) {
      event.respondWith(cacheFirst(request));
    }
    // API calls or dynamic content - network first strategy
    else if (url.pathname.startsWith('/api/')) {
      event.respondWith(networkFirst(request));
    }
    // Other requests - stale while revalidate strategy
    else {
      event.respondWith(staleWhileRevalidate(request));
    }
  }
});

// Cache first strategy - for static assets
async function cacheFirst(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.error('Cache first strategy failed:', error);
    return new Response('Offline content not available', { status: 503 });
  }
}

// Network first strategy - for dynamic content
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('Network failed, trying cache:', error);
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    return new Response('Content not available offline', { status: 503 });
  }
}

// Stale while revalidate strategy - for general content
async function staleWhileRevalidate(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  const cachedResponse = await cache.match(request);
  
  const fetchPromise = fetch(request).then(networkResponse => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch(() => {
    // Network failed, return cached version if available
    return cachedResponse;
  });
  
  // Return cached version immediately if available, otherwise wait for network
  return cachedResponse || fetchPromise;
}

// Background sync for offline task management
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync-tasks') {
    console.log('🔄 Background sync triggered for tasks');
    event.waitUntil(syncTasks());
  }
});

// Sync tasks when back online
async function syncTasks() {
  try {
    // Get pending tasks from IndexedDB or localStorage
    const pendingTasks = await getPendingTasks();
    
    if (pendingTasks.length > 0) {
      // Sync with server when available
      console.log(`📤 Syncing ${pendingTasks.length} pending tasks`);
      // Implementation would depend on your backend API
    }
  } catch (error) {
    console.error('Task sync failed:', error);
  }
}

// Get pending tasks (placeholder for actual implementation)
async function getPendingTasks() {
  // This would integrate with your actual data storage
  return [];
}

// Push notification handling
self.addEventListener('push', event => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body || 'You have pending tasks!',
      icon: '/icon-192x192.png',
      badge: '/badge-72x72.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: data.primaryKey || 'default'
      },
      actions: [
        {
          action: 'explore',
          title: 'View Tasks',
          icon: '/icon-check.png'
        },
        {
          action: 'close',
          title: 'Close',
          icon: '/icon-close.png'
        }
      ]
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title || 'TaskMaster Pro', options)
    );
  }
});

// Notification click handling
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  if (event.action === 'explore') {
    // Open the app
    event.waitUntil(
      clients.openWindow('/')
    );
  } else if (event.action === 'close') {
    // Just close the notification
    return;
  } else {
    // Default action - open the app
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Periodic background sync (if supported)
self.addEventListener('periodicsync', event => {
  if (event.tag === 'task-reminder') {
    event.waitUntil(sendTaskReminder());
  }
});

// Send task reminder
async function sendTaskReminder() {
  try {
    // Check for overdue tasks and send notifications
    const clients = await self.clients.matchAll();
    if (clients.length === 0) {
      // App is not open, could send push notification
      console.log('📱 Could send push notification for task reminder');
    }
  } catch (error) {
    console.error('Task reminder failed:', error);
  }
}

// Message handling from main thread
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

console.log('🚀 TaskMaster Pro Service Worker loaded successfully!');