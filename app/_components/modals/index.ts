/**
 * ═══════════════════════════════════════════════════════════════════════════
 * CHRONOS INFINITY 2026 — MODALES iOS PREMIUM
 * Todos los modales con diseño iOS glassmorphism avanzado
 * ═══════════════════════════════════════════════════════════════════════════
 */

// Modales Principales con diseño iOS Premium
export { AbonoClienteModal } from './AbonoClienteModal'
export { AbonoDistribuidorModal } from './AbonoDistribuidorModal'
export { GastoModal } from './GastoModal'
export { IngresoModal } from './IngresoModal'
export { OrdenCompraModal } from './OrdenCompraModal'
export { TransferenciaModal } from './TransferenciaModal'
export { VentaModal } from './VentaModal'

// Modales de Confirmación y Detalles iOS
export { ConfirmDeleteModal } from './ConfirmDeleteModal'
export { DetalleVentaModal } from './DetalleVentaModal'
export { DetalleOrdenCompraModal } from './DetalleOrdenCompraModal'

// Modales de Edición iOS
export { EditarClienteModal } from './EditarClienteModal'
export { EditarDistribuidorModal } from './EditarDistribuidorModal'
export { EditarOrdenCompraModal } from './EditarOrdenCompraModal'
export { EditarVentaModal } from './EditarVentaModal'

// Modales de Historial iOS
export { HistorialClienteModal } from './HistorialClienteModal'
export { HistorialDistribuidorModal } from './HistorialDistribuidorModal'

// Modales de Almacén iOS
export { CorteAlmacenModal } from './CorteAlmacenModal'
export { ProductoModal } from './ProductoModal'

// Modales de Creación iOS
export { NuevoClienteModal } from './NuevoClienteModal'
export { NuevoDistribuidorModal } from './NuevoDistribuidorModal'

// Modales Bancarios iOS
export { BancoDetailModal } from './BancoDetailModal'

// Paneles de UI iOS (Header)
export { NotificationsPanel } from './NotificationsPanel'
export { QuickSettingsPanel } from './QuickSettingsPanel'

// Modal de Exportación Avanzado
export { default as ExportModalAdvanced } from './ExportModalAdvanced'

// Re-exportar componentes iOS del sistema de modales
export {
  iOSModal,
  iOSAlert,
  iOSConfirmationSheet,
  ModalScrollContainer,
} from '../ui/ios'
