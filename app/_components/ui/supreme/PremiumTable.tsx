/**
 * 📋 PREMIUM TABLE SYSTEM — Sistema de Tablas Ultra-Premium
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * Tablas con sorting, filtros, paginación y animaciones avanzadas
 * ═══════════════════════════════════════════════════════════════════════════════════════
 */

'use client'

import { AnimatePresence, motion } from 'motion/react'
import { ArrowDown, ArrowUp, ChevronsUpDown, Search } from 'lucide-react'
import React, { ReactNode, useMemo, useState } from 'react'
import { GlassCard, PremiumButton, PremiumInput } from './ChronosDesignSystem'

// ═══════════════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════

interface Column<T> {
  key: keyof T | string
  label: string
  sortable?: boolean
  width?: string
  render?: (row: T) => ReactNode
  align?: 'left' | 'center' | 'right'
}

interface PremiumTableProps<T> {
  data: T[]
  columns: Column<T>[]
  title?: string
  subtitle?: string
  searchable?: boolean
  searchPlaceholder?: string
  rowsPerPage?: number
  onRowClick?: (row: T) => void
  emptyMessage?: string
  className?: string
}

type SortDirection = 'asc' | 'desc' | null

// ═══════════════════════════════════════════════════════════════════════════════════════
// PREMIUM TABLE
// ═══════════════════════════════════════════════════════════════════════════════════════

export function PremiumTable<T extends Record<string, any>>({
  data,
  columns,
  title,
  subtitle,
  searchable = true,
  searchPlaceholder = 'Buscar...',
  rowsPerPage = 10,
  onRowClick,
  emptyMessage = 'No hay datos disponibles',
  className = '',
}: PremiumTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>(null)
  const [currentPage, setCurrentPage] = useState(1)

  // Filtrar datos por búsqueda
  const filteredData = useMemo(() => {
    if (!searchTerm) return data

    return data.filter((row) =>
      Object.values(row).some((value) =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    )
  }, [data, searchTerm])

  // Ordenar datos
  const sortedData = useMemo(() => {
    if (!sortColumn || !sortDirection) return filteredData

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortColumn]
      const bValue = b[sortColumn]

      if (aValue === bValue) return 0

      const comparison = aValue < bValue ? -1 : 1
      return sortDirection === 'asc' ? comparison : -comparison
    })
  }, [filteredData, sortColumn, sortDirection])

  // Paginación
  const totalPages = Math.ceil(sortedData.length / rowsPerPage)
  const paginatedData = sortedData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)

  // Handle sorting
  const handleSort = (columnKey: string) => {
    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : sortDirection === 'desc' ? null : 'asc')
      if (sortDirection === 'desc') {
        setSortColumn(null)
      }
    } else {
      setSortColumn(columnKey)
      setSortDirection('asc')
    }
  }

  // Reset page cuando cambie el filtro
  React.useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, sortColumn, sortDirection])

  return (
    <GlassCard className={className}>
      <div className="p-6">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between gap-4">
          <div className="flex-1">
            {title && <h3 className="text-lg font-semibold text-white">{title}</h3>}
            {subtitle && <p className="mt-1 text-sm text-white/60">{subtitle}</p>}
          </div>

          {/* Search */}
          {searchable && (
            <div className="w-64">
              <PremiumInput
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={setSearchTerm}
                icon={<Search className="h-4 w-4" />}
                fullWidth
              />
            </div>
          )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            {/* Header */}
            <thead>
              <tr className="border-b border-white/10">
                {columns.map((column, index) => (
                  <th
                    key={index}
                    className={`px-4 py-3 text-${column.align || 'left'} text-sm font-semibold text-white/70`}
                    style={{ width: column.width }}
                  >
                    {column.sortable ? (
                      <button
                        onClick={() => handleSort(column.key as string)}
                        className="group inline-flex items-center gap-2 hover:text-white"
                      >
                        <span>{column.label}</span>
                        <motion.div
                          initial={false}
                          animate={{
                            opacity: sortColumn === column.key ? 1 : 0.3,
                          }}
                        >
                          {sortColumn === column.key ? (
                            sortDirection === 'asc' ? (
                              <ArrowUp className="h-4 w-4" />
                            ) : (
                              <ArrowDown className="h-4 w-4" />
                            )
                          ) : (
                            <ChevronsUpDown className="h-4 w-4 opacity-0 group-hover:opacity-100" />
                          )}
                        </motion.div>
                      </button>
                    ) : (
                      column.label
                    )}
                  </th>
                ))}
              </tr>
            </thead>

            {/* Body */}
            <tbody>
              <AnimatePresence mode="popLayout">
                {paginatedData.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length} className="py-12 text-center">
                      <p className="text-sm text-white/40">{emptyMessage}</p>
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((row, rowIndex) => (
                    <motion.tr
                      key={rowIndex}
                      className="group border-b border-white/5 transition-colors hover:bg-white/5"
                      onClick={() => onRowClick?.(row)}
                      style={{ cursor: onRowClick ? 'pointer' : 'default' }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{
                        delay: rowIndex * 0.05,
                        type: 'spring',
                        stiffness: 500,
                        damping: 30,
                      }}
                      layout
                    >
                      {columns.map((column, colIndex) => (
                        <td
                          key={colIndex}
                          className={`px-4 py-3 text-${column.align || 'left'} text-sm text-white`}
                        >
                          {column.render
                            ? column.render(row)
                            : String(row[column.key as keyof T] ?? '')}
                        </td>
                      ))}
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-white/60">
              Mostrando {(currentPage - 1) * rowsPerPage + 1} a{' '}
              {Math.min(currentPage * rowsPerPage, sortedData.length)} de {sortedData.length}{' '}
              resultados
            </p>

            <div className="flex gap-2">
              <PremiumButton
                size="sm"
                variant="ghost"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              >
                Anterior
              </PremiumButton>

              {/* Page numbers */}
              <div className="flex gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                  // Show first, last, current, and adjacent pages
                  if (page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1) {
                    return (
                      <motion.button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-semibold transition-colors"
                        style={{
                          background:
                            page === currentPage
                              ? 'rgba(139, 92, 246, 0.3)'
                              : 'rgba(255, 255, 255, 0.05)',
                          color: page === currentPage ? '#ffffff' : '#ffffff80',
                        }}
                        whileHover={{
                          background: 'rgba(139, 92, 246, 0.2)',
                          color: '#ffffff',
                        }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {page}
                      </motion.button>
                    )
                  } else if (Math.abs(page - currentPage) === 2) {
                    return (
                      <span key={page} className="flex items-center text-white/40">
                        ...
                      </span>
                    )
                  }
                  return null
                })}
              </div>

              <PremiumButton
                size="sm"
                variant="ghost"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              >
                Siguiente
              </PremiumButton>
            </div>
          </div>
        )}
      </div>
    </GlassCard>
  )
}
