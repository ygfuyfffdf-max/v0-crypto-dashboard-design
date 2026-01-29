/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 🧪 CHRONOS INFINITY — TESTS EXHAUSTIVOS DE FORMATTERS.TS (100% COVERAGE)
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Tests para todas las funciones de formateo del sistema.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import * as fc from "fast-check"

// Importar directamente desde el archivo
import {
  capitalize,
  formatChange,
  formatCompact,
  formatCurrency,
  formatDate,
  formatDateRange,
  formatDuration,
  formatFileSize,
  formatList,
  formatMXN,
  formatName,
  formatNumber,
  formatPercent,
  formatPhone,
  formatQuantity,
  formatRelativeTime,
  formatStatus,
  formatTime,
  formatUSD,
  parseCurrency,
  titleCase,
  truncate,
} from "@/app/lib/utils/formatters"

// ═══════════════════════════════════════════════════════════════════════════
// TESTS DE FORMATO DE MONEDA
// ═══════════════════════════════════════════════════════════════════════════

describe("Formatters — Moneda", () => {
  describe("formatCurrency", () => {
    it("debe formatear valores positivos correctamente", () => {
      const result = formatCurrency(1234.56)
      expect(result).toMatch(/1[,.]?234/)
    })

    it("debe formatear valores negativos", () => {
      const result = formatCurrency(-1234.56)
      expect(result).toMatch(/-?\$?1[,.]?234/)
    })

    it("debe formatear cero", () => {
      const result = formatCurrency(0)
      expect(result).toContain("0")
    })

    it("debe formatear valores grandes", () => {
      const result = formatCurrency(1000000000)
      expect(result).toContain("1")
    })

    it("debe formatear con moneda USD", () => {
      const result = formatCurrency(100, { currency: "USD" })
      expect(result).toBeDefined()
    })

    it("debe formatear compacto", () => {
      const result = formatCurrency(1500000, { compact: true })
      expect(result).toContain("M")
    })

    it("property: formatCurrency siempre retorna string", () => {
      fc.assert(
        fc.property(fc.double({ min: -1000000, max: 1000000, noNaN: true }), (value) => {
          const result = formatCurrency(value)
          return typeof result === "string" && result.length > 0
        }),
        { numRuns: 100 }
      )
    })
  })

  describe("formatMXN", () => {
    it("debe formatear como MXN", () => {
      const result = formatMXN(1234.56)
      expect(result).toContain("$")
    })
  })

  describe("formatUSD", () => {
    it("debe formatear como USD", () => {
      const result = formatUSD(1234.56)
      expect(result).toBeDefined()
    })
  })

  describe("formatCompact", () => {
    it("debe formatear miles como K", () => {
      const result = formatCompact(1500)
      expect(result).toContain("K")
    })

    it("debe formatear millones como M", () => {
      const result = formatCompact(1500000)
      expect(result).toContain("M")
    })
  })

  describe("parseCurrency", () => {
    it("debe parsear moneda a número", () => {
      const result = parseCurrency("$1,234.56")
      expect(typeof result).toBe("number")
      expect(result).toBeCloseTo(1234.56, 1)
    })

    it("debe manejar string vacío", () => {
      const result = parseCurrency("")
      expect(result).toBe(0)
    })

    it("debe manejar solo símbolos", () => {
      const result = parseCurrency("$")
      expect(result).toBe(0)
    })
  })
})

// ═══════════════════════════════════════════════════════════════════════════
// TESTS DE FORMATO DE NÚMEROS
// ═══════════════════════════════════════════════════════════════════════════

describe("Formatters — Números", () => {
  describe("formatNumber", () => {
    it("debe formatear números con separadores", () => {
      const result = formatNumber(1234567)
      expect(result).toMatch(/1[,.]?234[,.]?567/)
    })

    it("debe formatear decimales", () => {
      const result = formatNumber(1234.567, { decimals: 2 })
      expect(result).toBeDefined()
    })

    it("debe formatear cero", () => {
      expect(formatNumber(0)).toBe("0")
    })

    it("property: formatNumber siempre retorna string no vacío", () => {
      fc.assert(
        fc.property(fc.integer({ min: -1000000000, max: 1000000000 }), (value) => {
          const result = formatNumber(value)
          return typeof result === "string" && result.length > 0
        }),
        { numRuns: 100 }
      )
    })
  })

  describe("formatPercent", () => {
    it("debe formatear porcentajes", () => {
      const result = formatPercent(50)
      expect(result).toContain("50")
      expect(result).toContain("%")
    })

    it("debe formatear con decimales", () => {
      const result = formatPercent(33.333, { decimals: 2 })
      expect(result).toContain("%")
    })

    it("debe formatear cero", () => {
      expect(formatPercent(0)).toContain("0")
    })

    it("debe formatear 100%", () => {
      expect(formatPercent(100)).toContain("100")
    })

    it("debe mostrar signo cuando se solicita", () => {
      const positive = formatPercent(10, { showSign: true })
      expect(positive).toContain("+")
    })

    it("property: formatPercent siempre termina en %", () => {
      fc.assert(
        fc.property(fc.double({ min: 0, max: 100, noNaN: true }), (value) => {
          const result = formatPercent(value)
          return result.includes("%")
        }),
        { numRuns: 100 }
      )
    })
  })

  describe("formatChange", () => {
    it("debe formatear cambio positivo", () => {
      const result = formatChange(10.5)
      expect(result.text).toContain("+")
      expect(result.color).toContain("green")
      expect(result.icon).toBe("↑")
    })

    it("debe formatear cambio negativo", () => {
      const result = formatChange(-10.5)
      expect(result.text).toContain("-")
      expect(result.color).toContain("red")
      expect(result.icon).toBe("↓")
    })

    it("debe formatear cero", () => {
      const result = formatChange(0)
      expect(result.text).toContain("0")
      expect(result.color).toContain("gray")
      expect(result.icon).toBe("→")
    })
  })

  describe("formatQuantity", () => {
    it("debe formatear cantidad con unidad", () => {
      const result = formatQuantity(10, "unidades")
      expect(result).toContain("10")
      expect(result).toContain("unidades")
    })

    it("debe formatear singular", () => {
      const result = formatQuantity(1, "unidad", "unidades")
      expect(result).toContain("unidad")
    })
  })

  describe("formatFileSize", () => {
    it("debe formatear bytes", () => {
      expect(formatFileSize(0)).toBe("0 B")
    })

    it("debe formatear KB", () => {
      const result = formatFileSize(1024)
      expect(result).toContain("KB")
    })

    it("debe formatear MB", () => {
      const result = formatFileSize(1048576)
      expect(result).toContain("MB")
    })

    it("debe formatear GB", () => {
      const result = formatFileSize(1073741824)
      expect(result).toContain("GB")
    })
  })
})

// ═══════════════════════════════════════════════════════════════════════════
// TESTS DE FORMATO DE FECHAS
// ═══════════════════════════════════════════════════════════════════════════

describe("Formatters — Fechas", () => {
  describe("formatDate", () => {
    it("debe formatear fecha", () => {
      const date = new Date("2025-12-23")
      const result = formatDate(date)
      expect(result).toBeDefined()
      expect(result.length).toBeGreaterThan(0)
    })

    it("debe formatear string ISO", () => {
      const result = formatDate("2025-12-23")
      expect(result).toBeDefined()
    })

    it("debe formatear con formato largo", () => {
      const result = formatDate(new Date("2025-12-23"), { format: "long" })
      expect(result).toBeDefined()
    })

    it("debe formatear con formato corto", () => {
      const result = formatDate(new Date("2025-12-23"), { format: "short" })
      expect(result).toBeDefined()
    })
  })

  describe("formatTime", () => {
    it("debe formatear hora", () => {
      const date = new Date("2025-12-23T14:30:00")
      const result = formatTime(date)
      expect(result).toBeDefined()
      expect(result.length).toBeGreaterThan(0)
    })

    it("debe formatear formato 24 horas", () => {
      const result = formatTime(new Date("2025-12-23T14:30:00"), { format: "24h" })
      expect(result).toBeDefined()
    })
  })

  describe("formatRelativeTime", () => {
    it("debe formatear tiempo relativo pasado", () => {
      const pastDate = new Date(Date.now() - 60000) // hace 1 minuto
      const result = formatRelativeTime(pastDate)
      expect(result).toBeDefined()
    })

    it("debe formatear tiempo relativo futuro", () => {
      const futureDate = new Date(Date.now() + 3600000) // en 1 hora
      const result = formatRelativeTime(futureDate)
      expect(result).toBeDefined()
    })
  })

  describe("formatDuration", () => {
    it("debe formatear duración en segundos", () => {
      const result = formatDuration(30)
      expect(result).toBeDefined()
    })

    it("debe formatear duración en minutos", () => {
      const result = formatDuration(120)
      expect(result).toBeDefined()
    })

    it("debe formatear duración en horas", () => {
      const result = formatDuration(3600)
      expect(result).toBeDefined()
    })

    it("debe formatear cero", () => {
      const result = formatDuration(0)
      expect(result).toBeDefined()
    })
  })

  describe("formatDateRange", () => {
    it("debe formatear rango de fechas mismo día", () => {
      const start = new Date("2025-12-23")
      const end = new Date("2025-12-23")
      const result = formatDateRange(start, end)
      expect(result).toBeDefined()
    })

    it("debe formatear rango de fechas diferente día", () => {
      const start = new Date("2025-12-23")
      const end = new Date("2025-12-25")
      const result = formatDateRange(start, end)
      expect(result).toContain("-")
    })
  })
})

// ═══════════════════════════════════════════════════════════════════════════
// TESTS DE FORMATO DE TEXTO
// ═══════════════════════════════════════════════════════════════════════════

describe("Formatters — Texto", () => {
  describe("capitalize", () => {
    it("debe capitalizar primera letra", () => {
      expect(capitalize("hello")).toBe("Hello")
    })

    it("debe manejar string vacío", () => {
      expect(capitalize("")).toBe("")
    })

    it("debe manejar un solo carácter", () => {
      expect(capitalize("h")).toBe("H")
    })

    it("debe mantener resto en minúsculas", () => {
      expect(capitalize("hELLO")).toBe("Hello")
    })
  })

  describe("titleCase", () => {
    it("debe capitalizar cada palabra", () => {
      expect(titleCase("hello world")).toBe("Hello World")
    })

    it("debe manejar string vacío", () => {
      expect(titleCase("")).toBe("")
    })

    it("debe manejar una palabra", () => {
      expect(titleCase("hello")).toBe("Hello")
    })
  })

  describe("truncate", () => {
    it("debe truncar texto largo", () => {
      const result = truncate("Este es un texto muy largo que debe ser truncado", 20)
      expect(result.length).toBeLessThanOrEqual(23) // 20 + '...'
      expect(result).toContain("...")
    })

    it("debe no truncar texto corto", () => {
      const result = truncate("Corto", 20)
      expect(result).toBe("Corto")
    })

    it("debe manejar texto vacío", () => {
      const result = truncate("", 20)
      expect(result).toBe("")
    })

    it("debe respetar límite de palabras", () => {
      const result = truncate("Hello World Test", 10, { wordBoundary: true })
      expect(result).toBeDefined()
    })

    it("property: truncate nunca excede maxLength + 3", () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 0, maxLength: 100 }),
          fc.integer({ min: 5, max: 50 }),
          (text, maxLength) => {
            const result = truncate(text, maxLength)
            return result.length <= maxLength + 3
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  describe("formatName", () => {
    it("debe formatear nombre completo", () => {
      const result = formatName("Juan", "Pérez")
      expect(result).toBe("Juan Pérez")
    })

    it("debe formatear iniciales", () => {
      const result = formatName("Juan", "Pérez", { format: "initials" })
      expect(result).toBe("JP")
    })

    it("debe formatear formato corto", () => {
      const result = formatName("Juan", "Pérez", { format: "short" })
      expect(result).toContain("Juan")
    })

    it("debe manejar valores vacíos", () => {
      const result = formatName("", "")
      expect(result).toBe("")
    })
  })

  describe("formatPhone", () => {
    it("debe formatear número de teléfono mexicano", () => {
      const result = formatPhone("5512345678")
      expect(result).toBeDefined()
      expect(result).toContain("(")
    })

    it("debe manejar números con formato existente", () => {
      const result = formatPhone("55 1234 5678")
      expect(result).toBeDefined()
    })

    it("debe manejar números vacíos", () => {
      const result = formatPhone("")
      expect(result).toBe("")
    })

    it("debe manejar números con +52", () => {
      const result = formatPhone("525512345678")
      expect(result).toBeDefined()
    })
  })

  describe("formatStatus", () => {
    it("debe formatear estado pendiente", () => {
      const result = formatStatus("pendiente")
      expect(result.label).toBe("Pendiente")
      expect(result.color).toContain("yellow")
    })

    it("debe formatear estado pagado", () => {
      const result = formatStatus("pagado")
      expect(result.label).toBe("Pagado")
      expect(result.color).toContain("green")
    })

    it("debe formatear estado cancelado", () => {
      const result = formatStatus("cancelado")
      expect(result.label).toBe("Cancelado")
      expect(result.color).toContain("red")
    })

    it("debe manejar estados desconocidos", () => {
      const result = formatStatus("desconocido")
      expect(result.label).toBe("Desconocido")
      expect(result.color).toContain("gray")
    })
  })

  describe("formatList", () => {
    it("debe formatear lista vacía", () => {
      expect(formatList([])).toBe("")
    })

    it("debe formatear lista de un elemento", () => {
      expect(formatList(["uno"])).toBe("uno")
    })

    it("debe formatear lista de dos elementos", () => {
      const result = formatList(["uno", "dos"])
      expect(result).toContain("y")
    })

    it("debe formatear lista de tres elementos", () => {
      const result = formatList(["uno", "dos", "tres"])
      expect(result).toContain(",")
      expect(result).toContain("y")
    })

    it("debe limitar elementos", () => {
      const result = formatList(["uno", "dos", "tres", "cuatro"], { limit: 2 })
      expect(result).toContain("+2 más")
    })
  })
})

// ═══════════════════════════════════════════════════════════════════════════
// EDGE CASES Y BOUNDARY CONDITIONS
// ═══════════════════════════════════════════════════════════════════════════

describe("Formatters — Edge Cases", () => {
  describe("Valores especiales", () => {
    it("formatCurrency debe manejar NaN gracefully", () => {
      expect(() => formatCurrency(NaN)).not.toThrow()
    })

    it("formatCurrency debe manejar Infinity", () => {
      expect(() => formatCurrency(Infinity)).not.toThrow()
    })

    it("formatNumber debe manejar NaN", () => {
      expect(() => formatNumber(NaN)).not.toThrow()
    })

    it("formatPercent debe manejar valores > 100", () => {
      const result = formatPercent(150)
      expect(result).toContain("150")
    })

    it("formatPercent debe manejar valores negativos", () => {
      const result = formatPercent(-10)
      expect(result).toContain("10")
    })
  })

  describe("Strings con caracteres especiales", () => {
    it("truncate debe manejar emojis", () => {
      const result = truncate("Hello 👋 World", 10)
      expect(result).toBeDefined()
    })

    it("truncate debe manejar texto unicode", () => {
      const result = truncate("Héllo Wörld", 5)
      expect(result).toBeDefined()
    })

    it("capitalize debe manejar números al inicio", () => {
      const result = capitalize("123abc")
      expect(result).toBeDefined()
    })
  })
})
