'use client'

import { memo, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { cn } from '@/app/_lib/utils'
import { useCurrency } from '@/app/hooks/useCurrency'
import {
  DollarSign,
  RefreshCw,
  ChevronDown,
  Check,
} from 'lucide-react'

// ============================================
// CURRENCY SETTINGS PANEL
// ============================================

interface CurrencySettingsProps {
  className?: string
  compact?: boolean
}

export const CurrencySettings = memo(function CurrencySettings({
  className,
  compact = false,
}: CurrencySettingsProps) {
  const {
    displayCurrency,
    exchangeRate,
    showDualCurrency,
    setDisplayCurrency,
    setExchangeRate,
    setShowDualCurrency,
  } = useCurrency()

  const [isOpen, setIsOpen] = useState(false)
  const [inputRate, setInputRate] = useState(exchangeRate.toString())

  const handleRateChange = useCallback((value: string) => {
    setInputRate(value)
    const rate = parseFloat(value)
    if (!isNaN(rate) && rate >= 10 && rate <= 30) {
      setExchangeRate(rate)
    }
  }, [setExchangeRate])

  const presetRates = [17.00, 17.50, 18.00, 18.50, 19.00]

  if (compact) {
    return (
      <button
        onClick={() => setDisplayCurrency(displayCurrency === 'USD' ? 'MXN' : 'USD')}
        className={cn(
          'flex items-center gap-2 px-3 py-1.5 rounded-lg',
          'bg-white/5 hover:bg-white/10 transition-colors',
          'text-sm font-medium',
          className
        )}
      >
        <DollarSign className="w-4 h-4 text-emerald-400" />
        <span>{displayCurrency}</span>
        <span className="text-gray-500 text-xs">@ {exchangeRate.toFixed(2)}</span>
      </button>
    )
  }

  return (
    <div className={cn('relative', className)}>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-3 px-4 py-2.5 rounded-xl w-full',
          'bg-gradient-to-r from-emerald-500/10 to-teal-500/10',
          'border border-emerald-500/20 hover:border-emerald-500/40',
          'transition-all duration-200'
        )}
      >
        <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
          <DollarSign className="w-5 h-5 text-emerald-400" />
        </div>
        <div className="flex-1 text-left">
          <p className="text-sm font-medium text-white">Moneda: {displayCurrency}</p>
          <p className="text-xs text-gray-400">1 USD = {exchangeRate.toFixed(2)} MXN</p>
        </div>
        <ChevronDown
          className={cn(
            'w-5 h-5 text-gray-400 transition-transform',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {/* Dropdown Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-2 z-50"
          >
            <div className="p-4 rounded-xl bg-gray-900/95 backdrop-blur-xl border border-white/10 shadow-2xl">
              {/* Currency Selector */}
              <div className="mb-4">
                <label className="block text-xs text-gray-400 mb-2">Mostrar valores en</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['USD', 'MXN'] as const).map((currency) => (
                    <button
                      key={currency}
                      onClick={() => setDisplayCurrency(currency)}
                      className={cn(
                        'px-3 py-2 rounded-lg text-sm font-medium transition-all',
                        displayCurrency === currency
                          ? 'bg-emerald-500 text-white'
                          : 'bg-white/5 text-gray-400 hover:bg-white/10'
                      )}
                    >
                      {currency === 'USD' ? 'Dólares (USD)' : 'Pesos (MXN)'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dual Currency Toggle */}
              <div className="mb-4">
                <button
                  onClick={() => setShowDualCurrency(!showDualCurrency)}
                  className={cn(
                    'flex items-center justify-between w-full p-3 rounded-lg',
                    'bg-white/5 hover:bg-white/10 transition-colors'
                  )}
                >
                  <div>
                    <p className="text-sm font-medium text-white">Mostrar conversión</p>
                    <p className="text-xs text-gray-400">Ver USD y MXN juntos</p>
                  </div>
                  <div
                    className={cn(
                      'w-10 h-6 rounded-full relative transition-colors',
                      showDualCurrency ? 'bg-emerald-500' : 'bg-gray-700'
                    )}
                  >
                    <motion.div
                      animate={{ x: showDualCurrency ? 16 : 0 }}
                      className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white"
                    />
                  </div>
                </button>
              </div>

              {/* Exchange Rate */}
              <div>
                <label className="block text-xs text-gray-400 mb-2">
                  Tipo de cambio (USD → MXN)
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="number"
                    value={inputRate}
                    onChange={(e) => handleRateChange(e.target.value)}
                    min={10}
                    max={30}
                    step={0.01}
                    className={cn(
                      'flex-1 px-3 py-2 rounded-lg',
                      'bg-white/5 border border-white/10',
                      'text-white text-sm font-mono',
                      'focus:outline-none focus:border-emerald-500'
                    )}
                  />
                  <button
                    onClick={() => handleRateChange('17.50')}
                    className="px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400"
                    title="Resetear"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>

                {/* Preset rates */}
                <div className="flex flex-wrap gap-1">
                  {presetRates.map((rate) => (
                    <button
                      key={rate}
                      onClick={() => handleRateChange(rate.toString())}
                      className={cn(
                        'px-2 py-1 rounded text-xs transition-colors',
                        Math.abs(exchangeRate - rate) < 0.01
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-white/5 text-gray-400 hover:bg-white/10'
                      )}
                    >
                      {rate.toFixed(2)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
})

// ============================================
// INLINE CURRENCY TOGGLE
// ============================================

export const CurrencyToggle = memo(function CurrencyToggle({
  className,
}: {
  className?: string
}) {
  const { displayCurrency, setDisplayCurrency, exchangeRate } = useCurrency()

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <button
        onClick={() => setDisplayCurrency(displayCurrency === 'USD' ? 'MXN' : 'USD')}
        className={cn(
          'flex items-center gap-1.5 px-2.5 py-1 rounded-lg',
          'bg-white/5 hover:bg-white/10 transition-colors text-sm'
        )}
      >
        <span className={displayCurrency === 'USD' ? 'text-emerald-400 font-medium' : 'text-gray-500'}>
          USD
        </span>
        <span className="text-gray-600">/</span>
        <span className={displayCurrency === 'MXN' ? 'text-emerald-400 font-medium' : 'text-gray-500'}>
          MXN
        </span>
      </button>
      <span className="text-xs text-gray-500">@ {exchangeRate.toFixed(2)}</span>
    </div>
  )
})
