// app/sitemap.ts
// ═══════════════════════════════════════════════════════════════════════════════
// 🔍 CHRONOS INFINITY 2026 — DYNAMIC SITEMAP
// ═══════════════════════════════════════════════════════════════════════════════

import { MetadataRoute } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://chronos.app'

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()

  // Páginas estáticas principales
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/dashboard`,
      lastModified,
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/ventas`,
      lastModified,
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/bancos`,
      lastModified,
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/clientes`,
      lastModified,
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/distribuidores`,
      lastModified,
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/ordenes`,
      lastModified,
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/movimientos`,
      lastModified,
      changeFrequency: 'hourly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/almacen`,
      lastModified,
      changeFrequency: 'daily',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/reportes`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/configuracion`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ]

  // En producción, podrías agregar páginas dinámicas desde la DB
  // Por ejemplo: páginas de bancos individuales, clientes, etc.

  return staticPages
}
