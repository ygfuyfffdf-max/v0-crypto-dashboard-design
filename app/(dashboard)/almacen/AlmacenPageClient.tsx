'use client'

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * 🏭 ALMACEN PAGE CLIENT — CHRONOS INFINITY 2026
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * Página completa de gestión de almacén/inventario con panel Aurora premium.
 * AuroraAlmacenPanelUnified es auto-contenido: obtiene datos vía useAlmacen(),
 * gestiona filtros, búsqueda, vistas y modales internamente.
 */

import { AuroraAlmacenPanelUnified } from '@/app/_components/chronos-2026/panels/AuroraAlmacenPanelUnified'

export function AlmacenPageClient() {
  return <AuroraAlmacenPanelUnified className="w-full" />
}
