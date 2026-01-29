// app/robots.ts
// ═══════════════════════════════════════════════════════════════════════════════
// 🔍 CHRONOS INFINITY 2026 — ROBOTS.TXT DYNAMIC
// ═══════════════════════════════════════════════════════════════════════════════

import { MetadataRoute } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://chronos.app'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/', // No indexar APIs
          '/settings/', // No indexar configuración privada
          '/_next/', // No indexar assets internos
          '/admin/', // No indexar área de admin
          '/*.json$', // No indexar archivos JSON
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/api/', '/settings/'],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  }
}
