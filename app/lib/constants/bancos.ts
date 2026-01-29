/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 🏦 CHRONOS 2026 — BANCOS CONSTANTS
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Configuración de los 7 bancos/bóvedas del sistema CHRONOS.
 * Exporta todos los tipos y configuraciones relacionados con bancos.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import type { BancoId } from '@/app/types'

/**
 * Configuración de un banco
 */
export interface BancoConfig {
  id: BancoId
  nombre: string
  icon: string
  color: string
  tipo: 'boveda' | 'utilidades' | 'gastos' | 'operativo'
  descripcion: string
  moneda: 'MXN' | 'USD'
  gradient: string
  iconBg: string
}

/**
 * Configuración completa de los 7 bancos/bóvedas
 */
export const BANCOS_CONFIG: BancoConfig[] = [
  {
    id: 'boveda_monte',
    nombre: 'Bóveda Monte',
    icon: 'Building2',
    color: 'var(--c-banco-monte)',
    tipo: 'boveda',
    descripcion: 'Capital principal de operaciones',
    moneda: 'MXN',
    gradient: 'from-violet-500/20 to-blue-500/20',
    iconBg: 'bg-blue-500/10',
  },
  {
    id: 'boveda_usa',
    nombre: 'Bóveda USA',
    icon: 'Flag',
    color: 'var(--c-banco-usa)',
    tipo: 'boveda',
    descripcion: 'Capital en dólares/USA',
    moneda: 'USD',
    gradient: 'from-red-500/20 to-blue-500/20',
    iconBg: 'bg-red-500/10',
  },
  {
    id: 'utilidades',
    nombre: 'Utilidades',
    icon: 'Gem',
    color: 'var(--c-banco-utilidades)',
    tipo: 'utilidades',
    descripcion: 'Ganancias netas del negocio',
    moneda: 'MXN',
    gradient: 'from-emerald-500/20 to-green-500/20',
    iconBg: 'bg-emerald-500/10',
  },
  {
    id: 'flete_sur',
    nombre: 'Flete Sur',
    icon: 'Truck',
    color: 'var(--c-banco-flete)',
    tipo: 'gastos',
    descripcion: 'Capital para gastos de transporte',
    moneda: 'MXN',
    gradient: 'from-orange-500/20 to-amber-500/20',
    iconBg: 'bg-orange-500/10',
  },
  {
    id: 'azteca',
    nombre: 'Azteca',
    icon: 'Store',
    color: 'var(--c-banco-azteca)',
    tipo: 'operativo',
    descripcion: 'Cuenta bancaria externa Azteca',
    moneda: 'MXN',
    gradient: 'from-purple-500/20 to-pink-500/20',
    iconBg: 'bg-purple-500/10',
  },
  {
    id: 'leftie',
    nombre: 'Leftie',
    icon: 'Briefcase',
    color: 'var(--c-banco-leftie)',
    tipo: 'operativo',
    descripcion: 'Capital de negocio secundario',
    moneda: 'MXN',
    gradient: 'from-yellow-500/20 to-orange-500/20',
    iconBg: 'bg-yellow-500/10',
  },
  {
    id: 'profit',
    nombre: 'Profit',
    icon: 'TrendingUp',
    color: 'var(--c-banco-profit)',
    tipo: 'operativo',
    descripcion: 'Utilidades distribuidas',
    moneda: 'MXN',
    gradient: 'from-indigo-500/20 to-purple-500/20',
    iconBg: 'bg-indigo-500/10',
  },
]

/**
 * Lista ordenada de IDs de banco
 */
export const BANCOS_ORDENADOS: BancoId[] = [
  'boveda_monte',
  'boveda_usa',
  'utilidades',
  'flete_sur',
  'azteca',
  'leftie',
  'profit',
]

/**
 * Obtener configuración de un banco por ID
 */
export function getBancoConfig(id: BancoId): BancoConfig | undefined {
  return BANCOS_CONFIG.find((banco) => banco.id === id)
}

/**
 * Mapa rápido de ID -> Config
 */
export const BANCOS_MAP: Map<BancoId, BancoConfig> = new Map(
  BANCOS_CONFIG.map((config) => [config.id, config]),
)

/**
 * IDs de bancos que reciben distribución de ventas
 */
export const BANCOS_DISTRIBUCION: BancoId[] = ['boveda_monte', 'utilidades', 'flete_sur']

/**
 * Colores por banco para gráficos
 */
export const BANCOS_COLORS: Record<BancoId, string> = {
  boveda_monte: '#3b82f6', // Blue
  boveda_usa: '#ef4444', // Red
  utilidades: '#10b981', // Emerald
  flete_sur: '#f97316', // Orange
  azteca: '#8b5cf6', // Purple
  leftie: '#eab308', // Yellow
  profit: '#6366f1', // Indigo
}

/**
 * Nombres cortos para UI compacta
 */
export const BANCOS_SHORT_NAMES: Record<BancoId, string> = {
  boveda_monte: 'Monte',
  boveda_usa: 'USA',
  utilidades: 'Util',
  flete_sur: 'Flete',
  azteca: 'Azteca',
  leftie: 'Leftie',
  profit: 'Profit',
}
