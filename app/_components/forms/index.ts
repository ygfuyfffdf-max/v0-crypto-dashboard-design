// ═══════════════════════════════════════════════════════════════
// CHRONOS INFINITY 2026 — FORMS iOS PREMIUM INDEX
// Formularios con diseño iOS glassmorphism avanzado
// ═══════════════════════════════════════════════════════════════

export { OrdenCompraForm } from './OrdenCompraForm'
// VentaForm, VentaFormGen5, WizardVentaPremium — modules not found, removed
export { AbonoClienteForm, PagoDistribuidorForm } from './AbonoForm'
export { GastoForm } from './GastoForm'
export { TransferenciaForm } from './TransferenciaForm'

// Re-exportar componentes iOS de formularios clásicos
export {
    iOSCheckbox, iOSFormContainer,
    iOSFormSection, iOSInput, iOSNumberInput, iOSRadioGroup, iOSSelect, iOSTextArea
} from '../ui/ios'

// Re-exportar componentes iOS de formularios avanzados
export {
    iOSForm,
    iOSFormGroup,
    iOSTextInput,
    iOSToggleField,
    useFormAdvanced
} from '../ui/ios'
