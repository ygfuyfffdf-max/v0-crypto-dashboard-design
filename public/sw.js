/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🔧 CHRONOS SERVICE WORKER — SUPREME ELEVATION 2026
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Service Worker avanzado para notificaciones push, caché offline,
 * sincronización en background y funcionalidad PWA.
 *
 * @version 1.0.0 - SUPREME ELEVATION
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

const CACHE_NAME = 'chronos-v1'
const RUNTIME_CACHE = 'chronos-runtime'
const API_CACHE = 'chronos-api'

// Assets a precachear
const PRECACHE_ASSETS = [
  '/',
  '/offline',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/badge-72x72.png'
]

// Rutas de API que deben ser cacheadas
const API_ROUTES = [
  '/api/dashboard',
  '/api/ventas',
  '/api/almacen',
  '/api/clientes',
  '/api/bancos'
]

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// INSTALACIÓN Y ACTIVACIÓN
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Instalando...')
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[ServiceWorker] Precacheando assets')
        return cache.addAll(PRECACHE_ASSETS)
      })
      .then(() => {
        console.log('[ServiceWorker] Precache completado')
        return self.skipWaiting()
      })
  )
})

self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activando...')
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && 
              cacheName !== RUNTIME_CACHE && 
              cacheName !== API_CACHE) {
            console.log('[ServiceWorker] Eliminando cache antiguo:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    }).then(() => {
      console.log('[ServiceWorker] Activado correctamente')
      return self.clients.claim()
    })
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// INTERCEPTACIÓN DE REQUESTS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Ignorar requests no-GET
  if (request.method !== 'GET') {
    return
  }

  // Manejar requests de API
  if (API_ROUTES.some(route => url.pathname.startsWith(route))) {
    event.respondWith(handleAPIRequest(request))
    return
  }

  // Manejar assets estáticos
  if (request.destination === 'image' || 
      request.destination === 'script' || 
      request.destination === 'style' ||
      url.pathname.includes('/icons/')) {
    event.respondWith(handleAssetRequest(request))
    return
  }

  // Manejar páginas HTML
  if (request.mode === 'navigate' || 
      request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(handlePageRequest(request))
    return
  }

  // Default: network first
  event.respondWith(handleDefaultRequest(request))
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// MANEJADORES DE REQUESTS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

async function handleAPIRequest(request) {
  try {
    const response = await fetch(request)
    
    // Cachear respuestas exitosas
    if (response.ok) {
      const cache = await caches.open(API_CACHE)
      cache.put(request, response.clone())
    }
    
    return response
  } catch (error) {
    console.log('[ServiceWorker] Falló request API, intentando cache:', request.url)
    
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    
    // Retornar respuesta offline para APIs
    return new Response(
      JSON.stringify({ 
        error: 'Offline',
        message: 'Sin conexión a internet. Algunos datos pueden estar desactualizados.'
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 503
      }
    )
  }
}

async function handleAssetRequest(request) {
  const cache = await caches.open(RUNTIME_CACHE)
  const cachedResponse = await cache.match(request)
  
  if (cachedResponse) {
    return cachedResponse
  }
  
  try {
    const response = await fetch(request)
    
    if (response.ok) {
      cache.put(request, response.clone())
    }
    
    return response
  } catch (error) {
    console.log('[ServiceWorker] Asset no disponible offline:', request.url)
    
    // Retornar placeholder para imágenes
    if (request.destination === 'image') {
      return new Response(
        '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="#f0f0f0"/><text x="50" y="50" text-anchor="middle" dy=".3em" fill="#999">Offline</text></svg>',
        {
          headers: { 'Content-Type': 'image/svg+xml' },
          status: 200
        }
      )
    }
    
    throw error
  }
}

async function handlePageRequest(request) {
  try {
    const response = await fetch(request)
    
    if (response.ok) {
      const cache = await caches.open(RUNTIME_CACHE)
      cache.put(request, response.clone())
    }
    
    return response
  } catch (error) {
    console.log('[ServiceWorker] Página no disponible offline, mostrando offline page')
    
    const cachedResponse = await caches.match('/offline')
    if (cachedResponse) {
      return cachedResponse
    }
    
    // Retornar página offline básica
    return new Response(
      `
      <!DOCTYPE html>
      <html>
      <head>
        <title>CHRONOS - Sin Conexión</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-align: center;
          }
          .container {
            padding: 2rem;
            max-width: 400px;
          }
          .icon {
            font-size: 4rem;
            margin-bottom: 1rem;
          }
          h1 {
            margin: 0 0 1rem 0;
            font-size: 2rem;
          }
          p {
            margin: 0 0 2rem 0;
            opacity: 0.8;
          }
          .retry-btn {
            background: rgba(255,255,255,0.2);
            border: 1px solid rgba(255,255,255,0.3);
            color: white;
            padding: 0.75rem 1.5rem;
            border-radius: 0.5rem;
            cursor: pointer;
            font-size: 1rem;
            transition: all 0.2s;
          }
          .retry-btn:hover {
            background: rgba(255,255,255,0.3);
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="icon">📡</div>
          <h1>Sin Conexión</h1>
          <p>Parece que has perdido tu conexión a internet. Algunas funciones pueden estar limitadas.</p>
          <button class="retry-btn" onclick="window.location.reload()">Reintentar</button>
        </div>
      </body>
      </html>
      `,
      {
        headers: { 'Content-Type': 'text/html' },
        status: 200
      }
    )
  }
}

async function handleDefaultRequest(request) {
  try {
    const response = await fetch(request)
    return response
  } catch (error) {
    console.log('[ServiceWorker] Request falló:', request.url)
    throw error
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// SISTEMA DE NOTIFICACIONES PUSH
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

self.addEventListener('push', (event) => {
  console.log('[ServiceWorker] Evento push recibido')
  
  if (!event.data) {
    console.log('[ServiceWorker] No hay datos en el evento push')
    return
  }

  const data = event.data.json()
  const { title, body, icon, badge, tag, requireInteraction, actions, data: notificationData } = data

  const options = {
    body: body || 'Nueva notificación de CHRONOS',
    icon: icon || '/icons/icon-192x192.png',
    badge: badge || '/icons/badge-72x72.png',
    tag: tag || 'chronos-notification',
    requireInteraction: requireInteraction || false,
    data: notificationData || {},
    actions: actions || [],
    vibrate: [200, 100, 200]
  }

  event.waitUntil(
    self.registration.showNotification(title || 'CHRONOS', options)
  )
})

self.addEventListener('notificationclick', (event) => {
  console.log('[ServiceWorker] Notificación clickeada')
  
  event.notification.close()

  const notificationData = event.notification.data
  const action = event.action

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Buscar ventana existente
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.focus()
            // Enviar mensaje a la ventana
            client.postMessage({
              type: 'NOTIFICATION_CLICKED',
              notification: notificationData,
              action: action
            })
            return
          }
        }

        // Abrir nueva ventana si no existe
        if (clients.openWindow) {
          const url = notificationData.url || '/'
          return clients.openWindow(url)
        }
      })
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// SINCRONIZACIÓN EN BACKGROUND
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

self.addEventListener('sync', (event) => {
  console.log('[ServiceWorker] Evento sync:', event.tag)
  
  if (event.tag === 'sync-data') {
    event.waitUntil(syncData())
  } else if (event.tag === 'sync-notifications') {
    event.waitUntil(syncNotifications())
  }
})

async function syncData() {
  try {
    console.log('[ServiceWorker] Sincronizando datos pendientes...')
    
    // Obtener datos pendientes del IndexedDB o localStorage
    const pendingData = await getPendingData()
    
    if (pendingData.length === 0) {
      console.log('[ServiceWorker] No hay datos pendientes para sincronizar')
      return
    }

    // Sincronizar cada item
    for (const item of pendingData) {
      try {
        await syncItem(item)
        await removePendingItem(item.id)
        console.log('[ServiceWorker] Item sincronizado:', item.id)
      } catch (error) {
        console.error('[ServiceWorker] Error sincronizando item:', item.id, error)
        // Mantener el item para reintentar más tarde
      }
    }
    
    console.log('[ServiceWorker] Sincronización completada')
  } catch (error) {
    console.error('[ServiceWorker] Error en sincronización:', error)
  }
}

async function syncNotifications() {
  try {
    console.log('[ServiceWorker] Sincronizando notificaciones pendientes...')
    
    // Obtener notificaciones pendientes
    const pendingNotifications = await getPendingNotifications()
    
    if (pendingNotifications.length === 0) {
      console.log('[ServiceWorker] No hay notificaciones pendientes')
      return
    }

    // Enviar cada notificación
    for (const notification of pendingNotifications) {
      try {
        await sendNotificationToServer(notification)
        await removePendingNotification(notification.id)
        console.log('[ServiceWorker] Notificación sincronizada:', notification.id)
      } catch (error) {
        console.error('[ServiceWorker] Error sincronizando notificación:', notification.id, error)
      }
    }
    
    console.log('[ServiceWorker] Notificaciones sincronizadas')
  } catch (error) {
    console.error('[ServiceWorker] Error sincronizando notificaciones:', error)
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// FUNCIONES AUXILIARES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

async function getPendingData() {
  // En producción, esto leería de IndexedDB
  return []
}

async function getPendingNotifications() {
  // En producción, esto leería de IndexedDB
  return []
}

async function removePendingItem(id) {
  // En producción, esto eliminaría de IndexedDB
  console.log('[ServiceWorker] Removiendo item pendiente:', id)
}

async function removePendingNotification(id) {
  // En producción, esto eliminaría de IndexedDB
  console.log('[ServiceWorker] Removiendo notificación pendiente:', id)
}

async function syncItem(item) {
  // En producción, esto enviaría los datos al servidor
  console.log('[ServiceWorker] Sincronizando item:', item)
}

async function sendNotificationToServer(notification) {
  // En producción, esto enviaría la notificación al servidor
  console.log('[ServiceWorker] Enviando notificación al servidor:', notification)
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// MENSAJES ENTRE SERVICE WORKER Y LA APP
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

self.addEventListener('message', (event) => {
  console.log('[ServiceWorker] Mensaje recibido:', event.data)
  
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  } else if (event.data.type === 'SHOW_NOTIFICATION') {
    const { notification } = event.data
    event.waitUntil(
      self.registration.showNotification(notification.title, {
        body: notification.body,
        icon: notification.icon || '/icons/icon-192x192.png',
        badge: notification.badge || '/icons/badge-72x72.png',
        tag: notification.tag || notification.id,
        data: notification.data || {},
        actions: notification.actions || [],
        requireInteraction: notification.requireInteraction || false,
        vibrate: notification.vibrate || [200, 100, 200]
      })
    )
  } else if (event.data.type === 'GET_NOTIFICATIONS') {
    event.waitUntil(
      self.registration.getNotifications()
        .then(notifications => {
          event.ports[0].postMessage({
            type: 'NOTIFICATIONS_LIST',
            notifications: notifications.map(n => ({
              title: n.title,
              body: n.body,
              tag: n.tag,
              data: n.data
            }))
          })
        })
    )
  }
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// ACTUALIZACIONES DEL SERVICE WORKER
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

self.addEventListener('updatefound', () => {
  console.log('[ServiceWorker] Nueva versión disponible')
  
  const newWorker = self.registration.installing
  
  newWorker.addEventListener('statechange', () => {
    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
      console.log('[ServiceWorker] Nueva versión instalada')
      
      // Notificar a la app sobre la nueva versión
      clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then(clientList => {
          clientList.forEach(client => {
            client.postMessage({
              type: 'NEW_VERSION_AVAILABLE'
            })
          })
        })
    }
  })
})

console.log('[ServiceWorker] CHRONOS Service Worker cargado exitosamente')