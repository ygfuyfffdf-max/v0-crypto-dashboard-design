# 🗺️ PLAN DE MIGRACIÓN LEGACY - CHRONOS INFINITY 2026

Este documento detalla los componentes y sistemas identificados como "Legacy" tras la activación del **Sistema iOS Clean Design**.

## 🔴 Código Marcado para Eliminación (Deprecation)

Los siguientes sistemas han sido reemplazados por la arquitectura `app/_components/ui/ios/*` y deben ser eliminados tras la validación completa de la Fase 2.

### 1. Sistemas de Diseño Obsoletos
| Sistema | Ubicación | Reemplazo | Estado |
|---------|-----------|-----------|--------|
| **Aurora System** | `app/_components/chronos-2026/panels/AuroraDashboardUnified.tsx` | `iOSDashboardUnified.tsx` | ⚠️ Deprecated |
| **Quantum System** | `app/_components/ui/QuantumElevatedUI.tsx` | `iOSCleanDesignSystem.tsx` | ⚠️ Deprecated |
| **Premium System** | `app/_components/ui/premium/*` | `app/_components/ui/ios/*` | ⚠️ Deprecated |
| **Omega System** | `app/_components/ui/omega/*` | `app/_components/ui/ios/*` | ⚠️ Deprecated |

### 2. Componentes Duplicados
| Componente Legacy | Ubicación | Componente Nuevo (iOS) |
|-------------------|-----------|------------------------|
| `Modal.tsx` | `app/_components/ui/Modal.tsx` | `iOSUltraModalSystem.tsx` |
| `Button.tsx` | `app/_components/ui/Button.tsx` | `CleanButton` (en DesignSystem) |
| `GlassCard` | `app/_components/ui/GlassCard.tsx` | `CleanGlassCard` / `iOSMetricCard` |

## 🔄 Estado de Migración de Paneles

| Panel | Estado Actual | Acción Requerida |
|-------|---------------|------------------|
| **Dashboard** | ✅ **iOS Native** | Ninguna (Completado Fase 1) |
| **Ventas** | 🟡 Aurora Wrapper | Crear `iOSVentasPanel.tsx` |
| **Bancos** | 🟡 Aurora Server | Migrar a Client Component con `iOSIntegrationWrapper` |
| **Clientes** | 🟡 Aurora Wrapper | Crear `iOSClientesPanel.tsx` |
| **Almacén** | 🟡 Aurora Wrapper | Crear `iOSAlmacenPanel.tsx` |

## 🛠️ Próximos Pasos (Fase 2)

1.  **Migrar Ventas**: Reemplazar `AuroraVentasPanelUnified` con una implementación que use `iOSGrid` y `iOSActionCard`.
2.  **Migrar Bancos**: Convertir `page.tsx` para usar un wrapper cliente iOS.
3.  **Limpieza**: Ejecutar script de eliminación de carpetas `omega`, `premium` y archivos raíz en `ui` una vez completada la migración.

---
*Generado por Agente de Refactorización Chronos - 2026*
