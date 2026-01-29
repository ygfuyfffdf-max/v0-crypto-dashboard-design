# 🗄️ Componentes Deprecados

Esta carpeta contiene componentes que han sido reemplazados por versiones mejoradas o consolidadas.

## ⚠️ NO USAR EN PRODUCCIÓN

Estos archivos se mantienen temporalmente para referencia y posible rollback.

## Archivos Deprecados

### Modals Duplicados
- `DeleteConfirmModal.tsx.bak` → Usar `ConfirmDeleteModal` de `@/app/_components/modals`

### Logins Duplicados (en `duplicates/`)
- `ChronosLogin.tsx` → Usar `GlassmorphicGateway` de `@/app/_components/chronos-2026/auth`
- `UltraLogin.tsx` → Usar `GlassmorphicGateway` de `@/app/_components/chronos-2026/auth`

### Animaciones Duplicadas (en `duplicates/`)
- `CinematicOpening3D.tsx.bak` → Usar `CinematicOpening` de `@/app/_components/chronos-2026/branding`

## Migración de Imports

### Logo KOCMOC
\`\`\`tsx
// ❌ ANTES (inline duplicado)
function KocmocOrbitalLogoCompact({ size }) { ... }

// ✅ AHORA
import { KocmocLogoCompact } from '@/app/_components/chronos-2026/branding/KocmocLogo'
\`\`\`

### Delete Modal
\`\`\`tsx
// ❌ ANTES
import { DeleteConfirmModal } from '@/app/_components/modals/DeleteConfirmModal'

// ✅ AHORA
import { ConfirmDeleteModal } from '@/app/_components/modals/ConfirmDeleteModal'
\`\`\`

### Login Page
\`\`\`tsx
// ❌ ANTES
import { ChronosLogin } from '@/app/_components/chronos-2026/branding/ChronosLogin'
import { UltraLogin } from '@/app/_components/chronos-2026/branding/UltraLogin'

// ✅ AHORA
import { GlassmorphicGateway } from '@/app/_components/chronos-2026/auth'
\`\`\`

## Fecha de Deprecación
- 22 de Enero 2026
