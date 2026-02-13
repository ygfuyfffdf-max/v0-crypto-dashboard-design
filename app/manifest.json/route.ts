/**
 * Manifest.json Route Handler
 * Sirve el manifest como JSON público (sin auth) para evitar 401 en PWA
 */
import { NextResponse } from 'next/server'

const manifest = {
  name: 'Chronos Infinity 2026 - Sistema de Gestión Empresarial',
  short_name: 'Chronos 2026',
  description:
    'Sistema integral de gestión empresarial con control de inventario, ventas, finanzas, 7 bancos/bóvedas y reportes en tiempo real',
  start_url: '/',
  scope: '/',
  display: 'standalone',
  background_color: '#000000',
  theme_color: '#8B5CF6',
  orientation: 'portrait-primary',
  dir: 'ltr',
  lang: 'es-MX',
  icons: [
    { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
    { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
  ],
  categories: ['business', 'finance', 'productivity', 'utilities'],
  shortcuts: [
    { name: 'Dashboard', short_name: 'Dashboard', description: 'Dashboard principal', url: '/dashboard', icons: [{ src: '/icon-192.png', sizes: '192x192' }] },
    { name: 'Ventas', short_name: 'Ventas', description: 'Registrar venta', url: '/ventas', icons: [{ src: '/icon-192.png', sizes: '192x192' }] },
    { name: 'Bancos', short_name: 'Bancos', description: 'Ver bancos', url: '/bancos', icons: [{ src: '/icon-192.png', sizes: '192x192' }] },
  ],
}

export async function GET() {
  return NextResponse.json(manifest, {
    headers: {
      'Content-Type': 'application/manifest+json',
      'Cache-Control': 'public, max-age=86400',
    },
  })
}
