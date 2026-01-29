/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 💸 PÁGINA DE GASTOS Y ABONOS — CHRONOS 2026
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Página server component que renderiza el panel de Gastos y Abonos Aurora Unified.
 * Protegida con ErrorBoundary para capturar errores de extensiones browser.
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

import { AuroraGastosYAbonosPanelUnified } from "@/app/_components/chronos-2026/panels/AuroraGastosYAbonosPanelUnified"
import { ErrorBoundaryPremium } from "@/app/_components/ErrorBoundaryPremium"

export const metadata = {
  title: "Gastos y Abonos — CHRONOS",
  description: "Gestión de gastos y abonymosos del sistema CHRONOS",
}

export default function GastosAbonosPage() {
  return (
    <ErrorBoundaryPremium>
      <AuroraGastosYAbonosPanelUnified />
    </ErrorBoundaryPremium>
  )
}
