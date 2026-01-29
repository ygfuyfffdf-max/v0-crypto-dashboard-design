/**
 * 🏗️ CHRONOS 2026 - LAYOUT INDEX
 * ═══════════════════════════════════════════════════════════════════════════
 * Exporta todos los componentes de layout
 * ═══════════════════════════════════════════════════════════════════════════
 */

export * from './ResponsiveGrid'

// Header Principal - Exportar explícitamente para evitar conflictos de tipos
export {
    ChronosHeader2026,
    type ChronosHeader2026Props,
    type NavItem,
    type PanelId,
    type ThemeStyle,
} from './ChronosHeader2026'

// Header Client (con router Next.js)
export { ChronosHeader2026Client } from './ChronosHeader2026Client'
