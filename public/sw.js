// ═══════════════════════════════════════════════════════════════════════════
// 🚀 CHRONOS 2026 — SERVICE WORKER OPTIMIZADO
// ═══════════════════════════════════════════════════════════════════════════
// PWA Service Worker con estrategias avanzadas de caching
// Basado en Workbox patterns pero implementado manualmente
// ═══════════════════════════════════════════════════════════════════════════

const CACHE_NAME = "chronos-v2.0.0"
const RUNTIME_CACHE = "chronos-runtime"
const IMAGE_CACHE = "chronos-images"
const STATIC_CACHE = "chronos-static"

// Assets críticos para precache en install
const PRECACHE_ASSETS = ["/", "/manifest.json", "/favicon.ico", "/offline.html"]

// ═══════════════════════════════════════════════════════════════════════════
// INSTALL - Precache de assets críticos
// ═══════════════════════════════════════════════════════════════════════════

self.addEventListener("install", (event) => {
  console.log("[SW] Installing service worker...")

  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("[SW] Precaching critical assets")
        return cache.addAll(PRECACHE_ASSETS)
      })
      .catch((error) => {
        console.error("[SW] Precache failed:", error)
      })
  )

  // Activar inmediatamente sin esperar
  self.skipWaiting()
})

// ═══════════════════════════════════════════════════════════════════════════
// ACTIVATE - Limpiar caches antiguos
// ═══════════════════════════════════════════════════════════════════════════

self.addEventListener("activate", (event) => {
  console.log("[SW] Activating service worker...")

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Eliminar caches que no sean los actuales
          const currentCaches = [CACHE_NAME, RUNTIME_CACHE, IMAGE_CACHE, STATIC_CACHE]
          if (!currentCaches.includes(cacheName)) {
            console.log("[SW] Deleting old cache:", cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    })
  )

  // Tomar control de todas las páginas inmediatamente
  self.clients.claim()
})

// ═══════════════════════════════════════════════════════════════════════════
// FETCH - Estrategias de caching
// ═══════════════════════════════════════════════════════════════════════════

self.addEventListener("fetch", (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Solo cachear requests del mismo origen
  if (!request.url.startsWith(self.location.origin)) {
    return
  }

  // Estrategia por tipo de recurso
  if (request.url.includes("/api/") || request.url.includes("firestore")) {
    // API: Network First (datos siempre frescos)
    event.respondWith(networkFirst(request, RUNTIME_CACHE))
  } else if (request.destination === "image") {
    // Imágenes: Cache First (optimización)
    event.respondWith(cacheFirst(request, IMAGE_CACHE))
  } else if (request.url.includes("/_next/static/")) {
    // Assets estáticos de Next.js: Cache First (inmutables)
    event.respondWith(cacheFirst(request, STATIC_CACHE))
  } else if (request.mode === "navigate") {
    // Navegación: Network First con fallback offline
    event.respondWith(navigationHandler(request))
  } else {
    // Otros recursos: Stale While Revalidate
    event.respondWith(staleWhileRevalidate(request, RUNTIME_CACHE))
  }
})

// ═══════════════════════════════════════════════════════════════════════════
// ESTRATEGIA: Network First
// ═══════════════════════════════════════════════════════════════════════════
// Prioriza red, usa cache como fallback

async function networkFirst(request, cacheName) {
  try {
    const networkResponse = await fetch(request)

    // Solo cachear respuestas exitosas
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName)
      cache.put(request, networkResponse.clone())
    }

    return networkResponse
  } catch (error) {
    console.log("[SW] Network failed, falling back to cache:", request.url)
    const cachedResponse = await caches.match(request)

    if (cachedResponse) {
      return cachedResponse
    }

    // Si no hay cache, retornar error offline
    return new Response(JSON.stringify({ error: "Offline", message: "No hay conexión" }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    })
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// ESTRATEGIA: Cache First
// ═══════════════════════════════════════════════════════════════════════════
// Prioriza cache, usa red como fallback

async function cacheFirst(request, cacheName) {
  const cachedResponse = await caches.match(request)

  if (cachedResponse) {
    return cachedResponse
  }

  try {
    const networkResponse = await fetch(request)

    if (networkResponse.ok) {
      const cache = await caches.open(cacheName)
      cache.put(request, networkResponse.clone())
    }

    return networkResponse
  } catch (error) {
    console.error("[SW] Cache and network failed:", request.url)
    return new Response("Resource not available", { status: 503 })
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// ESTRATEGIA: Stale While Revalidate
// ═══════════════════════════════════════════════════════════════════════════
// Retorna cache inmediatamente, actualiza en background

async function staleWhileRevalidate(request, cacheName) {
  const cachedResponse = await caches.match(request)

  const fetchPromise = fetch(request)
    .then((networkResponse) => {
      if (networkResponse.ok) {
        const cache = caches.open(cacheName)
        cache.then((c) => c.put(request, networkResponse.clone()))
      }
      return networkResponse
    })
    .catch(() => null)

  // Retornar cache si existe, sino esperar red
  return cachedResponse || fetchPromise || new Response("Not available", { status: 503 })
}

// ═══════════════════════════════════════════════════════════════════════════
// HANDLER: Navegación con fallback offline
// ═══════════════════════════════════════════════════════════════════════════

async function navigationHandler(request) {
  try {
    const networkResponse = await fetch(request)

    if (networkResponse.ok) {
      const cache = await caches.open(RUNTIME_CACHE)
      cache.put(request, networkResponse.clone())
    }

    return networkResponse
  } catch (error) {
    console.log("[SW] Navigation failed, showing offline page")

    // Intentar cargar desde cache
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }

    // Fallback a página offline
    const offlinePage = await caches.match("/offline.html")
    if (offlinePage) {
      return offlinePage
    }

    // Último fallback
    return new Response(
      `<!DOCTYPE html>
      <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Sin conexión - Chronos</title>
          <style>
            body {
              font-family: system-ui, -apple-system, sans-serif;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              background: #000;
              color: #fff;
              text-align: center;
              padding: 20px;
            }
            .offline-container {
              max-width: 400px;
            }
            h1 { color: #8B5CF6; font-size: 2.5rem; margin-bottom: 1rem; }
            p { color: #a1a1aa; line-height: 1.6; }
            button {
              margin-top: 2rem;
              padding: 12px 24px;
              background: #8B5CF6;
              color: white;
              border: none;
              border-radius: 8px;
              font-size: 1rem;
              cursor: pointer;
            }
            button:hover { background: #7C3AED; }
          </style>
        </head>
        <body>
          <div class="offline-container">
            <h1>📵</h1>
            <h1>Sin conexión</h1>
            <p>No hay conexión a internet. Por favor, verifica tu conexión y vuelve a intentar.</p>
            <button onclick="window.location.reload()">Reintentar</button>
          </div>
        </body>
      </html>`,
      {
        status: 503,
        headers: { "Content-Type": "text/html" },
      }
    )
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// MESSAGE HANDLER - Comandos del cliente
// ═══════════════════════════════════════════════════════════════════════════

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting()
  }

  if (event.data && event.data.type === "CLEAR_CACHE") {
    event.waitUntil(
      caches
        .keys()
        .then((cacheNames) => {
          return Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)))
        })
        .then(() => {
          console.log("[SW] All caches cleared")
        })
    )
  }
})

console.log("[SW] Service Worker loaded successfully")
