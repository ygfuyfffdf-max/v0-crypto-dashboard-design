/**
 * 🌌 CHRONOS 2026 - PREMIUM FORMS INDEX
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * Exporta todos los componentes de formulario premium
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// LEGACY EXPORTS (PremiumForms.tsx)
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export {
  FormModal as GlassFormModal,
  // Form Components
  GlassInput,
  GlassMoneyInput,
  GlassSelect,
  GlassTextarea,
  zodResolver as legacyZodResolver,

  // Schemas
  movimientoSchema,
  ordenCompraSchema,
  // Re-export from react-hook-form
  useForm as useLegacyForm,
  ventaSchema,
  type OrdenCompraFormData as LegacyOrdenCompraFormData,
  type VentaFormData as LegacyVentaFormData,
  // Types
  type MovimientoFormData,
} from './PremiumForms'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// NEW COMPLETE FORMS SYSTEM (CompleteForms.tsx)
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export {
  AbonoFormSchema,
  BANCO_IDS,
  BancoIdSchema,
  CalculationPanel,
  ClienteFormSchema,
  Controller,
  DistribuidorFormSchema,
  EstadoPagoSchema,
  FormActions,
  FormCurrencyInput,
  FormGrid,
  // Base Form Components
  FormInput,
  FormModal,
  FormProvider,
  FormSection,
  FormSelect,
  FormTextarea,
  GastoFormSchema,
  OrdenCompraFormSchema,
  SubmitButton,
  TransferenciaFormSchema,
  // Schemas
  VentaFormSchema,
  // React Hook Form exports
  useForm,
  useFormContext,
  useWatch,
  zodResolver,
  type AbonoFormData,
  type CalculationItem,
  type CalculationPanelProps,
  type ClienteFormData,
  type DistribuidorFormData,
  type FormActionsProps,
  type FormCurrencyInputProps,
  type FormGridProps,
  type FormInputProps,
  type FormModalProps,
  type FormSectionProps,
  type FormSelectProps,
  type FormTextareaProps,
  type GastoFormData,
  type OrdenCompraFormData,
  type SelectOption,
  type SubmitButtonProps,
  type TransferenciaFormData,
  // Types
  type VentaFormData,
} from './CompleteForms'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// COMPLETE FORM COMPONENTS — Premium Glassmorphism Forms
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

// Almacén / Inventario
export {
  AlmacenProductoFormPremium,
  type AlmacenProductoFormData,
} from './AlmacenProductoFormPremium'

// Clientes
export { ClienteFormPremium } from './ClienteFormPremium'

// Distribuidores
export { DistribuidorFormPremium } from './DistribuidorFormPremium'

// Gastos, Abonos y Transferencias
export {
  AbonoFormPremium,
  GastoFormPremium,
  TransferenciaFormPremium,
} from './GastoAbonoFormsPremium'

// Movimientos Financieros
export {
  MovimientoFormPremium,
  type MovimientoFormData as MovimientoFormDataNew,
} from './MovimientoFormPremium'

// Órdenes de Compra
export { OrdenCompraFormPremium } from './OrdenCompraFormPremium'

// Ventas
export { VentaFormPremium } from './VentaFormPremium'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// QUANTUM FORMS SYSTEM — Advanced Form Components
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export {
  QuantumCheckboxField,
  QuantumCurrencyField,
  QuantumInputField,
  QuantumRadioGroupField,
  QuantumSelectField,
  QuantumSubmitButton,
  QuantumTextareaField,
  QuantumWizard,
} from './QuantumFormsSystem'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// CONVENIENCE RE-EXPORTS — All Premium Forms
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

/**
 * 🎯 GUÍA DE USO DE FORMULARIOS PREMIUM
 *
 * Cada formulario incluye:
 * - ✅ Validación Zod completa
 * - ✅ React Hook Form integrado
 * - ✅ Diseño Glassmorphism
 * - ✅ Animaciones Motion React
 * - ✅ Cálculos automáticos en tiempo real
 * - ✅ Accesibilidad ARIA
 *
 * FORMULARIOS DISPONIBLES:
 *
 * 📦 AlmacenProductoFormPremium - Gestión de inventario
 *    Props: isOpen, onClose, onSubmit, initialData?, mode?
 *
 * 👤 ClienteFormPremium - Alta/edición de clientes
 *    Props: isOpen, onClose, onSubmit, initialData?, mode?
 *
 * 🏭 DistribuidorFormPremium - Alta/edición de distribuidores
 *    Props: isOpen, onClose, onSubmit, initialData?, mode?
 *
 * 💸 GastoFormPremium - Registro de gastos
 *    Props: isOpen, onClose, onSubmit, bancosCapital?
 *
 * 💰 AbonoFormPremium - Registro de abonos de clientes
 *    Props: isOpen, onClose, onSubmit, clientes, bancosCapital?
 *
 * 🔄 TransferenciaFormPremium - Transferencias entre bancos
 *    Props: isOpen, onClose, onSubmit, bancosCapital?
 *
 * 📊 MovimientoFormPremium - Movimientos financieros completos
 *    Props: isOpen, onClose, onSubmit, bancosCapital?, clientes?, distribuidores?, ventas?, ordenesCompra?, defaultTipo?, defaultBancoId?
 *
 * 📦 OrdenCompraFormPremium - Órdenes de compra
 *    Props: isOpen, onClose, onSubmit, distribuidores, bancosCapital?, initialData?, mode?
 *
 * 🛒 VentaFormPremium - Registro de ventas
 *    Props: isOpen, onClose, onSubmit, clientes, ordenesCompra?, initialData?, mode?
 */
