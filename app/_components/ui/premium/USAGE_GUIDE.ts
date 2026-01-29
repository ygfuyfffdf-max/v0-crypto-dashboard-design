/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 📚 PREMIUM DESIGN SYSTEM 2026 — GUÍA DE USO
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Este archivo documenta cómo usar el nuevo sistema de componentes premium
 * sin romper la lógica existente del proyecto CHRONOS.
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 📦 IMPORTACIONES DISPONIBLES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

/**
 * COMPONENTES PREMIUM NUEVOS (de PremiumElevatedSystem.tsx):
 *
 * import {
 *   // Formularios
 *   PremiumFloatingInput,    // Input con label flotante animado
 *   PremiumSelect,           // Select con dropdown animado y búsqueda
 *
 *   // Botón
 *   PremiumElevatedButton,   // Botón con ripple y shine sweep
 *
 *   // Card
 *   PremiumElevatedCard,     // Card con tilt 3D y glow
 *
 *   // Visualizaciones
 *   PremiumSparkline,        // Mini gráfico inline para tablas
 *
 *   // Layout
 *   PremiumPageTransition,   // Wrapper con transición de página
 *   ResponsiveContainer,     // Container con padding adaptativo
 *
 *   // UI
 *   PremiumBadge,            // Badge animado con variantes
 * } from '@/app/_components/ui/premium'
 */

/**
 * TABLA PREMIUM (de PremiumTableSystem.tsx):
 *
 * import {
 *   PremiumTable,            // Tabla con infinite scroll, sort, filter, select
 *   type TableColumn,        // Tipo para definir columnas
 * } from '@/app/_components/ui/premium'
 */

/**
 * HOOKS RESPONSIVE (de useResponsive.ts):
 *
 * import {
 *   useBreakpoint,           // Detectar breakpoint actual (isMobile, isTablet, isDesktop)
 *   useMediaQuery,           // Query personalizada
 *   useOrientation,          // portrait | landscape
 *   useIsTouchDevice,        // boolean
 *   useReducedMotion,        // boolean - respeta preferencias de usuario
 *   useWindowSize,           // { width, height }
 *   useResponsiveValue,      // Valor dinámico por breakpoint
 *   useScrollLock,           // Bloquear scroll (para modales)
 *   ResponsiveStack,         // Flex container responsive
 *   ShowOn,                  // Mostrar solo en ciertos breakpoints
 * } from '@/app/hooks/useResponsive'
 */

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🎯 EJEMPLOS DE USO
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

/**
 * EJEMPLO 1: Formulario Premium
 *
 * ```tsx
 * import { PremiumFloatingInput, PremiumSelect, PremiumElevatedButton } from '@/app/_components/ui/premium'
 *
 * function MiFormulario() {
 *   return (
 *     <form className="space-y-4">
 *       <PremiumFloatingInput
 *         label="Email"
 *         type="email"
 *         error={errors.email?.message}
 *         {...register('email')}
 *       />
 *
 *       <PremiumSelect
 *         label="País"
 *         options={[
 *           { value: 'mx', label: 'México' },
 *           { value: 'us', label: 'Estados Unidos' },
 *         ]}
 *         value={pais}
 *         onChange={setPais}
 *         searchable
 *       />
 *
 *       <PremiumElevatedButton type="submit" variant="primary">
 *         Enviar
 *       </PremiumElevatedButton>
 *     </form>
 *   )
 * }
 * ```
 */

/**
 * EJEMPLO 2: Tabla con Sparklines
 *
 * ```tsx
 * import { PremiumTable, type TableColumn } from '@/app/_components/ui/premium'
 *
 * interface Venta {
 *   id: string
 *   cliente: string
 *   monto: number
 *   tendencia: number[] // Array para sparkline
 * }
 *
 * const columns: TableColumn<Venta>[] = [
 *   { id: 'cliente', header: 'Cliente', accessor: 'cliente', sortable: true },
 *   { id: 'monto', header: 'Monto', accessor: (row) => `$${row.monto.toLocaleString()}` },
 *   { id: 'tendencia', header: 'Tendencia', accessor: 'tendencia', sparklineKey: 'tendencia' },
 * ]
 *
 * function MiTabla() {
 *   return (
 *     <PremiumTable
 *       data={ventas}
 *       columns={columns}
 *       rowKey="id"
 *       selectable
 *       onSelectionChange={setSelected}
 *       hasNextPage={hasMore}
 *       onLoadMore={loadMore}
 *     />
 *   )
 * }
 * ```
 */

/**
 * EJEMPLO 3: Layout Responsive
 *
 * ```tsx
 * import { useBreakpoint, ResponsiveStack, ShowOn } from '@/app/hooks/useResponsive'
 *
 * function MiLayout() {
 *   const { isMobile, isDesktop } = useBreakpoint()
 *
 *   return (
 *     <div>
 *       {// Sidebar solo en desktop }
 *       <ShowOn breakpoint="lg" above>
 *         <Sidebar />
 *       </ShowOn>
 *
 *       {// Stack que cambia dirección }
 *       <ResponsiveStack
 *         direction="row"
 *         mobileDirection="col"
 *         gap="lg"
 *       >
 *         <Card1 />
 *         <Card2 />
 *       </ResponsiveStack>
 *
 *       {// Renderizado condicional }
 *       {isMobile ? <MobileNav /> : <DesktopNav />}
 *     </div>
 *   )
 * }
 * ```
 */

/**
 * EJEMPLO 4: Transición de Página
 *
 * ```tsx
 * import { PremiumPageTransition } from '@/app/_components/ui/premium'
 *
 * function MiPagina() {
 *   return (
 *     <PremiumPageTransition variant="slide">
 *       <div>
 *         {// Contenido de la página }
 *       </div>
 *     </PremiumPageTransition>
 *   )
 * }
 * ```
 */

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🎨 CLASES CSS PREMIUM DISPONIBLES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

/**
 * CLASES DE HOVER:
 * - hover-lift          → translateY(-4px) + shadow
 * - hover-glow          → box-shadow violet glow
 * - hover-scale         → scale(1.02)
 *
 * CLASES DE FOCUS:
 * - focus-ring          → outline + box-shadow
 *
 * CLASES DE INPUT:
 * - input-premium       → bg + border + transitions
 *
 * CLASES DE BOTÓN:
 * - btn-premium         → overflow + shine sweep on hover
 *
 * CLASES DE CARD:
 * - card-floating       → animation float + shadow
 * - card-glow-border    → rotating glow border on hover
 *
 * CLASES DE TABLA:
 * - table-premium       → styled th, tr:hover
 *
 * CLASES DE BADGE:
 * - badge-glow          → glow effect behind
 *
 * CLASES RESPONSIVE:
 * - responsive-grid     → 1 col → 2 col → 3 col → 4 col
 * - px-responsive       → padding 1rem → 1.5rem → 2rem
 *
 * CLASES DE TRANSICIÓN:
 * - transition-premium  → transform, opacity, shadow, bg, border
 * - transition-spring   → spring timing function
 *
 * CLASES DE SCROLLBAR:
 * - scrollbar-premium   → styled thin scrollbar violet
 */

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// ⚠️ NOTAS IMPORTANTES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

/**
 * 1. NUNCA reemplaces componentes que funcionan - USA los nuevos como alternativa
 *
 * 2. Para MEJORAR un componente existente sin romperlo:
 *    - Agrega clases CSS premium (hover-lift, card-glow-border, etc.)
 *    - Envuelve con PremiumPageTransition para animaciones
 *    - Usa useBreakpoint para lógica responsive
 *
 * 3. Los componentes QuantumElevatedUI siguen disponibles y funcionando
 *
 * 4. Siempre verifica con pnpm type-check después de cambios
 */

export {}
