/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 💰 PROFIT CASA DE CAMBIO — CALCULADORA DE RENTABILIDAD
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Panel completo para:
 * - Calcular ventas con diferentes métodos de pago
 * - Ver comisiones y rentabilidad en tiempo real
 * - Gestión de Tarjetas Negras
 * - Descuentos por volumen
 *
 * @version 2.0.0
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

'use client'

import { cn } from '@/app/_lib/utils'
import {
  profitRentabilidadService,
  CONFIG_COMISIONES_METODO,
  CONFIG_DESCUENTOS_VOLUMEN,
  type MetodoPagoVenta,
  type CalculoVentaCliente,
  type TarjetaNegraCliente,
} from '@/app/_lib/services/profit-rentabilidad.service'
import { AnimatePresence, motion } from 'motion/react'
import { memo, useCallback, useEffect, useMemo, useState } from 'react'
import {
  AlertTriangle,
  ArrowRight,
  Banknote,
  Bitcoin,
  Building2,
  Calculator,
  Check,
  CreditCard,
  DollarSign,
  FileText,
  Gift,
  Info,
  Loader2,
  Percent,
  PiggyBank,
  Plus,
  RefreshCw,
  Shield,
  Sparkles,
  TrendingUp,
  User,
  Wallet,
  Zap,
} from 'lucide-react'
import { toast } from 'sonner'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// CONSTANTES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const DIVISAS = [
  { id: 'USD', nombre: 'Dólar', bandera: '🇺🇸', simbolo: '$' },
  { id: 'EUR', nombre: 'Euro', bandera: '🇪🇺', simbolo: '€' },
  { id: 'CAD', nombre: 'CAD', bandera: '🇨🇦', simbolo: '$' },
  { id: 'GBP', nombre: 'Libra', bandera: '🇬🇧', simbolo: '£' },
  { id: 'USDT', nombre: 'USDT', bandera: '💎', simbolo: '₮' },
]

const METODOS_ICONS: Record<MetodoPagoVenta, React.ReactNode> = {
  efectivo: <Banknote className="h-5 w-5" />,
  transferencia: <Building2 className="h-5 w-5" />,
  cripto: <Bitcoin className="h-5 w-5" />,
  tarjeta_negra: <CreditCard className="h-5 w-5" />,
}

interface Props {
  className?: string
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// COMPONENTE: SELECTOR DE MÉTODO CON DETALLE DE COMISIÓN
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const MetodoConComision = memo(function MetodoConComision({
  metodo,
  isSelected,
  onSelect,
  esRecarga,
}: {
  metodo: MetodoPagoVenta
  isSelected: boolean
  onSelect: () => void
  esRecarga?: boolean
}) {
  const config = CONFIG_COMISIONES_METODO[metodo]
  
  // Para tarjeta negra, mostrar comisión según si es recarga o primera vez
  let comisionMostrar = config.comisionPorcentaje
  let labelComision = `+${comisionMostrar}%`
  
  if (metodo === 'tarjeta_negra') {
    if (esRecarga) {
      comisionMostrar = config.comisionRecarga ?? 3
      labelComision = `+${comisionMostrar}% (recarga)`
    } else {
      comisionMostrar = config.comisionPrimeraEmision ?? 8
      labelComision = `+${comisionMostrar}% (primera vez)`
    }
  }

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onSelect}
      className={cn(
        'relative w-full p-4 rounded-xl border-2 transition-all text-left',
        isSelected
          ? 'border-emerald-500 bg-emerald-500/10'
          : 'border-white/10 bg-white/5 hover:border-white/20'
      )}
    >
      {/* Badge de comisión */}
      <div className={cn(
        'absolute -top-2 -right-2 px-2 py-0.5 rounded-full text-xs font-bold',
        comisionMostrar === 0 
          ? 'bg-green-500 text-white' 
          : comisionMostrar >= 8 
            ? 'bg-amber-500 text-white'
            : 'bg-blue-500 text-white'
      )}>
        {comisionMostrar === 0 ? 'SIN COMISIÓN' : labelComision}
      </div>

      <div className="flex items-center gap-3 mb-2">
        <div
          className={cn(
            'p-2.5 rounded-xl',
            isSelected ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/10 text-white/60'
          )}
          style={{ backgroundColor: isSelected ? undefined : `${config.color}20`, color: isSelected ? undefined : config.color }}
        >
          {METODOS_ICONS[metodo]}
        </div>
        <div className="flex-1">
          <p className={cn('font-semibold', isSelected ? 'text-emerald-400' : 'text-white')}>
            {config.nombre}
          </p>
          <p className="text-xs text-white/50 line-clamp-1">
            {config.descripcion}
          </p>
        </div>
      </div>

      {/* Info adicional */}
      <div className="flex flex-wrap gap-2 mt-3">
        {!config.generaHistorial && (
          <span className="px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-400 text-xs flex items-center gap-1">
            <Shield className="h-3 w-3" />
            Sin historial fiscal
          </span>
        )}
        {config.esTarjetaNegra && (
          <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-xs flex items-center gap-1">
            <CreditCard className="h-3 w-3" />
            Tarjeta prepagada
          </span>
        )}
      </div>

      {isSelected && (
        <div className="absolute top-4 right-4">
          <Check className="h-5 w-5 text-emerald-400" />
        </div>
      )}
    </motion.button>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// COMPONENTE: RESUMEN DE CÁLCULO
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const ResumenCalculo = memo(function ResumenCalculo({
  calculo,
}: {
  calculo: CalculoVentaCliente
}) {
  const divisaInfo = DIVISAS.find(d => d.id === calculo.divisa)

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-900/20 to-green-900/20 p-6 space-y-4"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Calculator className="h-5 w-5 text-emerald-400" />
          Detalle de la Operación
        </h3>
        <span className={cn(
          'px-3 py-1 rounded-full text-sm font-medium',
          calculo.generaHistorialFiscal 
            ? 'bg-blue-500/20 text-blue-400'
            : 'bg-violet-500/20 text-violet-400'
        )}>
          {calculo.generaHistorialFiscal ? '📋 Con historial' : '🔒 Sin historial'}
        </span>
      </div>

      {/* Operación principal */}
      <div className="p-4 rounded-xl bg-black/20 border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <div className="text-center">
            <p className="text-xs text-white/50 mb-1">Cliente recibe</p>
            <p className="text-2xl font-bold text-white">
              {divisaInfo?.bandera} {calculo.cantidadDivisa.toLocaleString()} {calculo.divisa}
            </p>
          </div>
          <ArrowRight className="h-6 w-6 text-emerald-400" />
          <div className="text-center">
            <p className="text-xs text-white/50 mb-1">Cliente paga</p>
            <p className="text-2xl font-bold text-emerald-400">
              ${calculo.totalCobrarCliente.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
            </p>
          </div>
        </div>
        
        {/* Tipo de cambio efectivo */}
        <div className="flex justify-center">
          <div className="px-4 py-2 rounded-full bg-white/5 border border-white/10">
            <span className="text-white/60 text-sm">TC Efectivo: </span>
            <span className="text-white font-mono font-bold">
              ${calculo.tipoCambioAjustado.toFixed(4)} MXN/{calculo.divisa}
            </span>
          </div>
        </div>
      </div>

      {/* Desglose */}
      <div className="space-y-2">
        <div className="flex justify-between items-center py-2 border-b border-white/10">
          <span className="text-white/60">Tipo de cambio base (competencia)</span>
          <span className="text-white font-mono">${calculo.tipoCambioBase.toFixed(2)} MXN</span>
        </div>
        
        <div className="flex justify-between items-center py-2 border-b border-white/10">
          <span className="text-white/60">Monto base</span>
          <span className="text-white">${calculo.montoBaseMxn.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
        </div>
        
        <div className="flex justify-between items-center py-2 border-b border-white/10">
          <span className="text-white/60 flex items-center gap-1">
            <Percent className="h-4 w-4" />
            Comisión método ({calculo.comisionMetodoPorcentaje}%)
          </span>
          <span className={cn(
            'font-medium',
            calculo.comisionMetodoMonto > 0 ? 'text-amber-400' : 'text-green-400'
          )}>
            {calculo.comisionMetodoMonto > 0 ? '+' : ''}${calculo.comisionMetodoMonto.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
          </span>
        </div>
        
        {calculo.aplicaDescuentoVolumen && (
          <div className="flex justify-between items-center py-2 border-b border-white/10">
            <span className="text-white/60 flex items-center gap-1">
              <Gift className="h-4 w-4 text-green-400" />
              Descuento VIP (volumen)
            </span>
            <span className="text-green-400 font-medium">
              -${calculo.descuentoVolumenMonto.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
            </span>
          </div>
        )}
      </div>

      {/* Rentabilidad (para el negocio) */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 to-green-500/10 border border-emerald-500/20">
        <h4 className="text-sm font-medium text-white/70 mb-3 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-emerald-400" />
          Rentabilidad de esta operación
        </h4>
        
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-white/50">Ganancia Spread</p>
            <p className="text-lg font-bold text-white">
              ${calculo.gananciaSpread.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div>
            <p className="text-xs text-white/50">Ganancia Comisión</p>
            <p className="text-lg font-bold text-amber-400">
              ${calculo.gananciaComision.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div>
            <p className="text-xs text-white/50">Total Ganancia</p>
            <p className="text-lg font-bold text-emerald-400">
              ${calculo.gananciaTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
        
        <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between">
          <span className="text-white/60">Rentabilidad</span>
          <span className={cn(
            'text-2xl font-bold',
            calculo.rentabilidadPorcentaje >= 5 ? 'text-emerald-400' : 
            calculo.rentabilidadPorcentaje >= 2 ? 'text-amber-400' : 'text-white'
          )}>
            {calculo.rentabilidadPorcentaje.toFixed(2)}%
          </span>
        </div>
      </div>

      {/* Alertas */}
      {calculo.alertas.length > 0 && (
        <div className="space-y-2">
          {calculo.alertas.map((alerta, i) => (
            <div 
              key={i}
              className={cn(
                'flex items-start gap-2 p-3 rounded-lg text-sm',
                alerta.includes('⚠️') || alerta.includes('📋') 
                  ? 'bg-amber-500/10 border border-amber-500/20 text-amber-400'
                  : 'bg-blue-500/10 border border-blue-500/20 text-blue-400'
              )}
            >
              <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
              {alerta}
            </div>
          ))}
        </div>
      )}
    </motion.div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// COMPONENTE: TABLA DE DESCUENTOS POR VOLUMEN
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const TablaDescuentosVolumen = memo(function TablaDescuentosVolumen({
  montoActual,
}: {
  montoActual: number
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <h4 className="text-sm font-medium text-white/70 mb-3 flex items-center gap-2">
        <Gift className="h-4 w-4 text-green-400" />
        Descuentos por Volumen
      </h4>
      
      <div className="space-y-2">
        {CONFIG_DESCUENTOS_VOLUMEN.map((descuento, i) => {
          const esActivo = montoActual >= descuento.montoMinimo && montoActual <= descuento.montoMaximo
          const esAlcanzable = montoActual < descuento.montoMinimo
          
          return (
            <div 
              key={i}
              className={cn(
                'flex items-center justify-between p-2 rounded-lg text-sm transition-all',
                esActivo ? 'bg-green-500/20 border border-green-500/30' : 'bg-white/5'
              )}
            >
              <span className={cn(
                esActivo ? 'text-green-400 font-medium' : 'text-white/60'
              )}>
                {descuento.montoMaximo === Infinity 
                  ? `$${descuento.montoMinimo.toLocaleString()}+`
                  : `$${descuento.montoMinimo.toLocaleString()} - $${descuento.montoMaximo.toLocaleString()}`
                }
              </span>
              <span className={cn(
                'font-mono',
                esActivo ? 'text-green-400 font-bold' : 
                descuento.descuentoCentavos > 0 ? 'text-amber-400' : 'text-white/40'
              )}>
                {descuento.descuentoCentavos > 0 
                  ? `-$0.${String(descuento.descuentoCentavos).padStart(2, '0')}`
                  : 'Sin descuento'
                }
                {esActivo && ' ✓'}
                {esAlcanzable && descuento.descuentoCentavos > 0 && (
                  <span className="text-xs text-white/40 ml-2">
                    (faltan ${(descuento.montoMinimo - montoActual).toLocaleString()})
                  </span>
                )}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const ProfitCalculadoraRentabilidad = memo(function ProfitCalculadoraRentabilidad({
  className,
}: Props) {
  // Estado
  const [divisa, setDivisa] = useState<string>('USD')
  const [cantidad, setCantidad] = useState<string>('')
  const [metodoPago, setMetodoPago] = useState<MetodoPagoVenta | null>(null)
  const [esRecargaTarjeta, setEsRecargaTarjeta] = useState(false)
  const [calculo, setCalculo] = useState<CalculoVentaCliente | null>(null)
  const [cargando, setCargando] = useState(false)

  // Cliente para tarjeta negra
  const [clienteNombre, setClienteNombre] = useState('')
  const [tarjetasCliente, setTarjetasCliente] = useState<TarjetaNegraCliente[]>([])
  const [tarjetaSeleccionada, setTarjetaSeleccionada] = useState<string | null>(null)

  // Calcular cuando cambian los valores
  useEffect(() => {
    if (!divisa || !cantidad || !metodoPago || parseFloat(cantidad) <= 0) {
      setCalculo(null)
      return
    }

    try {
      const resultado = profitRentabilidadService.calcularVentaCliente({
        divisa,
        cantidadDivisa: parseFloat(cantidad),
        metodoPago,
        esRecargaTarjeta: metodoPago === 'tarjeta_negra' && esRecargaTarjeta,
        tarjetaNegraId: tarjetaSeleccionada ?? undefined,
      })
      setCalculo(resultado)
    } catch {
      setCalculo(null)
    }
  }, [divisa, cantidad, metodoPago, esRecargaTarjeta, tarjetaSeleccionada])

  // Emitir tarjeta negra
  const emitirTarjetaNegra = useCallback(async () => {
    if (!clienteNombre || !cantidad || parseFloat(cantidad) <= 0) {
      toast.error('Ingresa nombre del cliente y monto')
      return
    }

    setCargando(true)
    try {
      const resultado = profitRentabilidadService.emitirTarjetaNegra({
        clienteId: `cli_${Date.now()}`,
        clienteNombre,
        montoInicial: parseFloat(cantidad),
        divisa,
      })

      toast.success(
        `Tarjeta ${resultado.tarjeta.numeroTarjeta} emitida con saldo $${resultado.tarjeta.saldoActual.toLocaleString()}`,
        { duration: 5000 }
      )

      // Reset
      setClienteNombre('')
      setCantidad('')
    } catch {
      toast.error('Error emitiendo tarjeta')
    } finally {
      setCargando(false)
    }
  }, [clienteNombre, cantidad, divisa])

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <PiggyBank className="h-7 w-7 text-emerald-400" />
          Calculadora de Rentabilidad
        </h2>
        <p className="text-sm text-white/50 mt-1">
          Simula ventas y visualiza ganancias por método de pago
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Columna izquierda: Configuración */}
        <div className="space-y-6">
          {/* Selector de divisa */}
          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-5">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-violet-400" />
              Divisa y Monto
            </h3>

            <div className="grid grid-cols-5 gap-2 mb-4">
              {DIVISAS.map((d) => (
                <button
                  key={d.id}
                  onClick={() => setDivisa(d.id)}
                  className={cn(
                    'flex flex-col items-center p-3 rounded-xl border-2 transition-all',
                    divisa === d.id
                      ? 'border-violet-500 bg-violet-500/10'
                      : 'border-white/10 bg-white/5 hover:border-white/20'
                  )}
                >
                  <span className="text-2xl mb-1">{d.bandera}</span>
                  <span className={cn('text-sm font-medium', divisa === d.id ? 'text-violet-400' : 'text-white')}>
                    {d.id}
                  </span>
                </button>
              ))}
            </div>

            <div>
              <label className="text-xs text-white/50 mb-1 block">Cantidad a vender</label>
              <input
                type="number"
                value={cantidad}
                onChange={(e) => setCantidad(e.target.value)}
                className="w-full px-4 py-4 rounded-xl bg-white/5 border border-white/10 text-white text-2xl font-bold placeholder-white/30 focus:border-violet-500 focus:outline-none text-center"
                placeholder="0.00"
                min="0"
                step="100"
              />
            </div>
          </div>

          {/* Selector de método de pago */}
          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-5">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Wallet className="h-5 w-5 text-amber-400" />
              Método de Pago del Cliente
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(['efectivo', 'transferencia', 'cripto', 'tarjeta_negra'] as MetodoPagoVenta[]).map((metodo) => (
                <MetodoConComision
                  key={metodo}
                  metodo={metodo}
                  isSelected={metodoPago === metodo}
                  onSelect={() => {
                    setMetodoPago(metodo)
                    if (metodo !== 'tarjeta_negra') {
                      setEsRecargaTarjeta(false)
                      setTarjetaSeleccionada(null)
                    }
                  }}
                  esRecarga={metodoPago === 'tarjeta_negra' && esRecargaTarjeta}
                />
              ))}
            </div>

            {/* Opciones adicionales para tarjeta negra */}
            {metodoPago === 'tarjeta_negra' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-4 p-4 rounded-xl bg-gray-800/50 border border-white/10"
              >
                <h4 className="text-sm font-medium text-white mb-3">Tipo de operación</h4>
                <div className="flex gap-3">
                  <button
                    onClick={() => { setEsRecargaTarjeta(false); setTarjetaSeleccionada(null) }}
                    className={cn(
                      'flex-1 py-3 rounded-xl border-2 transition-all font-medium',
                      !esRecargaTarjeta
                        ? 'border-amber-500 bg-amber-500/20 text-amber-400'
                        : 'border-white/10 text-white/60 hover:border-white/20'
                    )}
                  >
                    <Plus className="h-4 w-4 inline mr-2" />
                    Nueva tarjeta (8%)
                  </button>
                  <button
                    onClick={() => setEsRecargaTarjeta(true)}
                    className={cn(
                      'flex-1 py-3 rounded-xl border-2 transition-all font-medium',
                      esRecargaTarjeta
                        ? 'border-green-500 bg-green-500/20 text-green-400'
                        : 'border-white/10 text-white/60 hover:border-white/20'
                    )}
                  >
                    <RefreshCw className="h-4 w-4 inline mr-2" />
                    Recarga (3%)
                  </button>
                </div>

                {!esRecargaTarjeta && (
                  <div className="mt-4">
                    <label className="text-xs text-white/50 mb-1 block">Nombre del cliente</label>
                    <input
                      type="text"
                      value={clienteNombre}
                      onChange={(e) => setClienteNombre(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:border-amber-500 focus:outline-none"
                      placeholder="Nombre completo"
                    />
                  </div>
                )}
              </motion.div>
            )}
          </div>

          {/* Descuentos por volumen */}
          <TablaDescuentosVolumen montoActual={parseFloat(cantidad) || 0} />
        </div>

        {/* Columna derecha: Resultado */}
        <div className="space-y-6">
          <AnimatePresence mode="wait">
            {calculo ? (
              <ResumenCalculo key="calculo" calculo={calculo} />
            ) : (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-12 flex flex-col items-center justify-center text-center"
              >
                <Calculator className="h-16 w-16 text-white/20 mb-4" />
                <p className="text-white/50 text-lg">
                  Selecciona divisa, monto y método de pago
                </p>
                <p className="text-white/30 text-sm mt-2">
                  para ver el cálculo de rentabilidad
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Botón de acción para tarjeta negra */}
          {metodoPago === 'tarjeta_negra' && !esRecargaTarjeta && calculo && (
            <button
              onClick={emitirTarjetaNegra}
              disabled={cargando || !clienteNombre}
              className={cn(
                'w-full py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-2 transition-all',
                cargando || !clienteNombre
                  ? 'bg-white/10 text-white/30 cursor-not-allowed'
                  : 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white'
              )}
            >
              {cargando ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Emitiendo...
                </>
              ) : (
                <>
                  <CreditCard className="h-5 w-5" />
                  Emitir Tarjeta Negra
                </>
              )}
            </button>
          )}

          {/* Comparativa rápida */}
          {cantidad && parseFloat(cantidad) > 0 && (
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <h4 className="text-sm font-medium text-white/70 mb-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-violet-400" />
                Comparativa de Ganancia por Método
              </h4>
              
              <div className="space-y-2">
                {profitRentabilidadService.compararMetodosPago(divisa, parseFloat(cantidad)).map((item) => (
                  <div 
                    key={item.metodo}
                    className={cn(
                      'flex items-center justify-between p-3 rounded-lg',
                      metodoPago === item.metodo ? 'bg-emerald-500/20 border border-emerald-500/30' : 'bg-white/5'
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{item.config.icono}</span>
                      <span className={cn(
                        'font-medium',
                        metodoPago === item.metodo ? 'text-emerald-400' : 'text-white/70'
                      )}>
                        {item.config.nombre.split(' ')[0]}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className={cn(
                        'font-bold',
                        metodoPago === item.metodo ? 'text-emerald-400' : 'text-white'
                      )}>
                        ${item.calculo.gananciaTotal.toLocaleString('es-MX', { minimumFractionDigits: 0 })}
                      </p>
                      <p className="text-xs text-white/40">
                        {item.calculo.rentabilidadPorcentaje.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
})

export default ProfitCalculadoraRentabilidad
