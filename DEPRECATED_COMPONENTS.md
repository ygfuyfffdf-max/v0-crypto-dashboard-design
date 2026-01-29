# 🗑️ COMPONENTES DEPRECADOS - CHRONOS 2026

> Fecha: 22 Enero 2026
> Basado en: ANALISIS_EXHAUSTIVO_WORKSPACE_2026.md

---

## ⚠️ COMPONENTES MARCADOS PARA ELIMINACIÓN

### 🔴 CRÍTICO - Eliminar en Fase 1 (Esta Semana)

#### Login Systems (2 archivos)
- [ ] `app/_components/chronos-2026/branding/ChronosLogin.tsx`
  - **Reemplazo**: `GlassmorphicGateway.tsx`
  - **Razón**: Menos features, UI inferior
  - **Líneas**: ~300 líneas

- [ ] `app/_components/auth/QuantumLogin.tsx`
  - **Reemplazo**: `GlassmorphicGateway.tsx`
  - **Razón**: Legacy, no mantiene estándares 2026
  - **Líneas**: ~350 líneas

#### Modales Duplicados (1 archivo)
- [ ] `app/_components/modals/DeleteConfirmModal.tsx`
  - **Reemplazo**: `ConfirmDeleteModal.tsx`
  - **Razón**: Duplicado exacto con peor UX
  - **Líneas**: ~120 líneas

**Total Fase 1**: 3 archivos, ~770 líneas a eliminar

---

### 🟡 MODERADO - Eliminar en Fase 2 (Semanas 2-3)

#### Forms Legacy (10 archivos)
- [ ] `app/_components/forms/VentaForm.tsx` → `VentaFormPremium.tsx`
- [ ] `app/_components/forms/VentaFormGen5.tsx` → `VentaFormPremium.tsx`
- [ ] `app/_components/forms/OrdenCompraForm.tsx` → `OrdenCompraFormPremium.tsx`
- [ ] `app/_components/forms/GastoForm.tsx` → `MovimientoFormPremium.tsx`
- [ ] `app/_components/forms/AbonoForm.tsx` → `MovimientoFormPremium.tsx`
- [ ] `app/_components/forms/TransferenciaForm.tsx` → `MovimientoFormPremium.tsx`
- [ ] `app/_components/forms/premium/FormNuevaVenta.tsx` → `VentaFormPremium.tsx`
- [ ] `app/_components/forms/premium/FormNuevaOC.tsx` → `OrdenCompraFormPremium.tsx`
- [ ] `app/_components/forms/premium/FormGastoTransferencia.tsx` → `MovimientoFormPremium.tsx`
- [ ] `app/_components/forms/premium/FormAbono.tsx` → `MovimientoFormPremium.tsx`

**Total Fase 2**: 10 archivos, ~3200 líneas a eliminar

---

#### Providers Duplicados (1 archivo)
- [ ] `app/_components/providers/ThemeProvider.tsx`
  - **Reemplazo**: `app/lib/theme/ThemeProvider.tsx`
  - **Razón**: Duplicado, el de lib/theme usa next-themes correctamente
  - **Líneas**: ~80 líneas

**Total Fase 2**: 11 archivos, ~3280 líneas

---

### 🟢 OPCIONAL - Marcar como @deprecated (No eliminar aún)

#### Button Systems (4 archivos)
- [ ] `app/_components/chronos-2026/design/primitives/PremiumButton.tsx`
  - **Reemplazo**: `UltraPremiumButton.tsx`
  - **Acción**: Agregar `@deprecated` en JSDoc
  - **No eliminar**: Aún se usa en algunos componentes legacy

- [ ] `app/_components/ui/QuantumElevatedUI.tsx` (QuantumButton)
  - **Reemplazo**: `UltraPremiumButton.tsx`
  - **Acción**: Agregar `@deprecated`
  - **No eliminar**: Parte de sistema QuantumElevatedUI

- [ ] `app/_components/ui/Modal.tsx` (Button component)
  - **Reemplazo**: `UltraPremiumButton.tsx`
  - **Acción**: Agregar `@deprecated`
  - **No eliminar**: Usado en modales legacy

- [ ] `app/_components/chronos-2026/ai/MicroInteractions.tsx` (PremiumButton)
  - **Reemplazo**: `UltraPremiumButton.tsx`
  - **Acción**: Agregar `@deprecated`
  - **No eliminar**: Es demo/ejemplo

---

## 📝 CÓMO MARCAR COMPONENTE COMO DEPRECATED

### Agregar JSDoc Tag

```typescript
/**
 * @deprecated Usar UltraPremiumButton en su lugar
 * @see {@link UltraPremiumButton}
 *
 * Este componente será eliminado en v2.0
 */
export function PremiumButton({ ... }) {
  // código existente
}
```

### Agregar Warning en Consola (Desarrollo)

```typescript
export function PremiumButton({ ... }) {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.warn(
        '⚠️ DEPRECATED: PremiumButton será eliminado. Usa UltraPremiumButton.'
      )
    }
  }, [])

  // código existente
}
```

---

## 🔄 GUÍA DE MIGRACIÓN

### De ChronosLogin → GlassmorphicGateway

**ANTES**:
```typescript
import { ChronosLogin } from '@/app/_components/chronos-2026/branding/ChronosLogin'

<ChronosLogin
  onLogin={handleLogin}
  onForgotPassword={handleForgot}
  logoSize={180}
/>
```

**DESPUÉS**:
```typescript
import { GlassmorphicGateway } from '@/app/_components/chronos-2026/auth/GlassmorphicGateway'

<GlassmorphicGateway
  onSuccess={handleLogin}
  showSocialLogin={true}
/>
```

---

### De PremiumButton → UltraPremiumButton

**ANTES**:
```typescript
import { PremiumButton } from '@/app/_components/chronos-2026/design/primitives/PremiumButton'

<PremiumButton
  variant="primary"
  size="md"
  icon={<Plus />}
  onClick={handleClick}
>
  Crear
</PremiumButton>
```

**DESPUÉS**:
```typescript
import { UltraPremiumButton } from '@/app/_components/ui/premium/UltraPremiumButton'

<UltraPremiumButton
  variant="primary"
  size="md"
  icon={<Plus />}
  iconPosition="left"
  onClick={handleClick}
>
  Crear
</UltraPremiumButton>
```

---

### De DeleteConfirmModal → ConfirmDeleteModal

**ANTES**:
```typescript
import { DeleteConfirmModal } from '@/app/_components/modals/DeleteConfirmModal'

<DeleteConfirmModal
  isOpen={isOpen}
  onConfirm={handleDelete}
  onCancel={onClose}
/>
```

**DESPUÉS**:
```typescript
import { ConfirmDeleteModal } from '@/app/_components/modals/ConfirmDeleteModal'

<ConfirmDeleteModal
  isOpen={isOpen}
  onConfirm={handleDelete}
  onCancel={onClose}
  title="¿Eliminar elemento?"
  message="Esta acción no se puede deshacer."
/>
```

---

### De Forms Legacy → FormsPremium

**ANTES**:
```typescript
import VentaForm from '@/app/_components/forms/VentaForm'

<VentaForm onSubmit={handleSubmit} />
```

**DESPUÉS**:
```typescript
import { VentaFormPremium } from '@/app/_components/chronos-2026/forms/VentaFormPremium'

<VentaFormPremium
  isOpen={isOpen}
  onClose={onClose}
  onSubmit={handleSubmit}
/>
```

---

## ✅ CHECKLIST DE VALIDACIÓN

Después de eliminar componentes, verificar:

### Testing
- [ ] `pnpm test` - Todos los tests pasan
- [ ] `pnpm test:e2e` - E2E tests pasan
- [ ] Testing manual de login flow
- [ ] Testing manual de modales CRUD
- [ ] Testing manual de forms

### Build
- [ ] `pnpm lint` - Sin errores
- [ ] `pnpm type-check` - Sin errores TypeScript
- [ ] `pnpm build` - Build exitoso
- [ ] Bundle size reducido (~25% menos)

### Funcionalidad
- [ ] Login funciona correctamente
- [ ] Modales abren y cierran sin errores
- [ ] Forms validan y envían datos
- [ ] Botones tienen hover effects
- [ ] No hay console errors

### Regresión
- [ ] Navegación entre paneles funciona
- [ ] CRUD operations funcionan
- [ ] Cálculos GYA correctos
- [ ] Turso DB queries funcionan
- [ ] No hay memory leaks

---

## 🚨 ROLLBACK PLAN

Si algo falla después de eliminar:

```bash
# 1. Revertir commit
git reset --hard HEAD~1

# 2. O restaurar archivo específico
git checkout HEAD~1 -- path/to/file.tsx

# 3. Reinstalar dependencias si es necesario
pnpm install

# 4. Rebuild
pnpm build
```

---

## 📊 IMPACTO ESPERADO

### Antes de Consolidación
```
Total componentes:     167
Componentes premium:   123 (74%)
Componentes legacy:     44 (26%)
Duplicados:             14
Bundle size:          ~3.2MB
```

### Después de Consolidación
```
Total componentes:     153 (-14)
Componentes premium:   123 (80%)
Componentes legacy:     30 (20%)
Duplicados:              0 (-14)
Bundle size:          ~2.4MB (-25%)
```

---

**Próximo paso**: Ejecutar `bash scripts/consolidate-components.sh --dry-run`

---

**Creado**: 22 Enero 2026
**Autor**: IY SUPREME Agent
**Versión**: 1.0
