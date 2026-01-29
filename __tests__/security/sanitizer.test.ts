/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🧪 CHRONOS INFINITY 2026 — Sanitizer Tests
 * ═══════════════════════════════════════════════════════════════════════════════
 * Tests comprehensivos para el módulo de sanitización
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import {
  detectPathTraversal,
  detectSqlInjection,
  escapeHtml,
  sanitizeEmail,
  sanitizeFormInput,
  sanitizeId,
  sanitizeMonetaryAmount,
  sanitizeNumber,
  sanitizeObject,
  sanitizePhone,
  sanitizeString,
} from "@/app/lib/security/sanitizer"

describe("🛡️ Sanitizer Module", () => {
  describe("sanitizeString", () => {
    it("should escape HTML entities by default", () => {
      const input = '<script>alert("xss")</script>'
      const result = sanitizeString(input)
      expect(result).not.toContain("<script>")
      expect(result).toContain("&lt;script&gt;")
    })

    it("should block javascript: protocol", () => {
      const input = "javascript:alert(1)"
      const result = sanitizeString(input)
      expect(result).not.toContain("javascript:")
      expect(result).toContain("blocked:")
    })

    it("should block event handlers", () => {
      const input = "<img onerror=alert(1)>"
      const result = sanitizeString(input)
      expect(result).not.toContain("onerror=")
    })

    it("should truncate long strings", () => {
      const input = "a".repeat(20000)
      const result = sanitizeString(input, { maxLength: 100 })
      expect(result.length).toBe(100)
    })

    it("should remove null bytes", () => {
      const input = "test\x00attack"
      const result = sanitizeString(input)
      expect(result).not.toContain("\x00")
    })

    it("should block template injection", () => {
      const input = '{{constructor.constructor("alert(1)")()}}'
      const result = sanitizeString(input)
      expect(result).toContain("[BLOCKED]")
    })

    it("should handle empty input", () => {
      expect(sanitizeString("")).toBe("")
      expect(sanitizeString(null as unknown as string)).toBe("")
      expect(sanitizeString(undefined as unknown as string)).toBe("")
    })
  })

  describe("escapeHtml", () => {
    it("should escape all dangerous characters", () => {
      const input = "<script>\"test\" & 'value' `backtick`</script>"
      const result = escapeHtml(input)
      expect(result).toBe(
        "&lt;script&gt;&quot;test&quot; &amp; &#x27;value&#x27; &#x60;backtick&#x60;&lt;/script&gt;"
      )
    })
  })

  describe("sanitizeObject", () => {
    it("should sanitize all string values in object", () => {
      const input = {
        name: "<script>alert(1)</script>",
        age: 25,
        nested: {
          value: "javascript:void(0)",
        },
      }
      const result = sanitizeObject(input)
      expect(result.name).not.toContain("<script>")
      expect(result.age).toBe(25)
      expect(result.nested.value).toContain("blocked:")
    })

    it("should handle arrays", () => {
      const input = {
        tags: ["<script>", "normal", "javascript:"],
      }
      const result = sanitizeObject(input as unknown as Record<string, unknown>)
      expect(Array.isArray(result.tags)).toBe(true)
    })
  })

  describe("sanitizeEmail", () => {
    it("should accept valid emails", () => {
      expect(sanitizeEmail("test@example.com")).toBe("test@example.com")
      expect(sanitizeEmail("User.Name@domain.org")).toBe("user.name@domain.org")
    })

    it("should reject invalid emails", () => {
      expect(sanitizeEmail("notanemail")).toBeNull()
      expect(sanitizeEmail("@nodomain.com")).toBeNull()
      expect(sanitizeEmail(".starts@dot.com")).toBeNull()
      expect(sanitizeEmail("")).toBeNull()
    })

    it("should lowercase emails", () => {
      expect(sanitizeEmail("TEST@EXAMPLE.COM")).toBe("test@example.com")
    })
  })

  describe("sanitizePhone", () => {
    it("should accept valid phone numbers", () => {
      expect(sanitizePhone("+1234567890")).toBe("+1234567890")
      expect(sanitizePhone("(555) 123-4567")).toBe("5551234567")
      expect(sanitizePhone("+52 55 1234 5678")).toBe("+525512345678")
    })

    it("should reject invalid phone numbers", () => {
      expect(sanitizePhone("123")).toBeNull() // Too short
      expect(sanitizePhone("1234567890123456789")).toBeNull() // Too long
      expect(sanitizePhone("")).toBeNull()
    })
  })

  describe("sanitizeId", () => {
    it("should accept valid IDs", () => {
      expect(sanitizeId("user-123")).toBe("user-123")
      expect(sanitizeId("abc_DEF_456")).toBe("abc_DEF_456")
    })

    it("should reject dangerous characters", () => {
      expect(sanitizeId("../../../etc/passwd")).toBe("etcpasswd")
      expect(sanitizeId("id; DROP TABLE users;")).toBe("idDROPTABLEusers")
    })

    it("should reject invalid IDs", () => {
      expect(sanitizeId("")).toBeNull()
      expect(sanitizeId("a".repeat(200))).toBeNull() // Too long
    })
  })

  describe("sanitizeNumber", () => {
    it("should accept valid numbers", () => {
      expect(sanitizeNumber(42)).toBe(42)
      expect(sanitizeNumber("3.14")).toBe(3.14)
      expect(sanitizeNumber("-10")).toBe(-10)
    })

    it("should reject invalid numbers", () => {
      expect(sanitizeNumber("not a number")).toBeNull()
      expect(sanitizeNumber(NaN)).toBeNull()
      expect(sanitizeNumber(Infinity)).toBeNull()
    })
  })

  describe("sanitizeMonetaryAmount", () => {
    it("should accept valid monetary amounts", () => {
      expect(sanitizeMonetaryAmount(100.5)).toBe(100.5)
      expect(sanitizeMonetaryAmount("99.999")).toBe(100) // Rounds to 2 decimals
      expect(sanitizeMonetaryAmount("1234.56")).toBe(1234.56)
    })

    it("should reject invalid amounts", () => {
      expect(sanitizeMonetaryAmount(-100)).toBeNull() // Negative
      expect(sanitizeMonetaryAmount("abc")).toBeNull()
    })

    it("should round to 2 decimal places", () => {
      expect(sanitizeMonetaryAmount(10.12345)).toBe(10.12)
      expect(sanitizeMonetaryAmount(10.999)).toBe(11)
    })
  })

  describe("sanitizeFormInput", () => {
    it("should sanitize based on field type", () => {
      expect(sanitizeFormInput("test@example.com", "email")).toBe("test@example.com")
      expect(sanitizeFormInput("+1234567890", "phone")).toBe("+1234567890")
      expect(sanitizeFormInput("100.50", "money")).toBe(100.5)
      expect(sanitizeFormInput("user-123", "id")).toBe("user-123")
      expect(sanitizeFormInput("<script>", "text")).not.toContain("<script>")
    })

    it("should handle null/undefined", () => {
      expect(sanitizeFormInput(null, "text")).toBeNull()
      expect(sanitizeFormInput(undefined, "email")).toBeNull()
    })
  })

  describe("detectSqlInjection", () => {
    const sqlPayloads = [
      "'; DROP TABLE users; --", // Has '--
      "1; DELETE FROM clientes WHERE 1=1; --", // Has 'delete from'
      "' OR 1=1 --", // Has 'or 1=1' pattern
      "1; exec xp_cmdshell('dir')", // Has xp_
      "INSERT INTO users VALUES", // Has 'insert into'
    ]

    it.each(sqlPayloads)("should detect SQL injection: %s", (payload) => {
      expect(detectSqlInjection(payload)).toBe(true)
    })

    it("should not flag normal inputs", () => {
      expect(detectSqlInjection("John Doe")).toBe(false)
      expect(detectSqlInjection("test@example.com")).toBe(false)
      expect(detectSqlInjection("1234567890")).toBe(false)
      expect(detectSqlInjection("Normal text input")).toBe(false)
    })
  })

  describe("detectPathTraversal", () => {
    it("should detect Unix path traversal", () => {
      expect(detectPathTraversal("../../../etc/passwd")).toBe(true)
      expect(detectPathTraversal("file/../etc/shadow")).toBe(true)
      expect(detectPathTraversal("data/../../../var/log")).toBe(true)
    })

    it("should not flag normal paths", () => {
      expect(detectPathTraversal("/home/user/file.txt")).toBe(false)
      expect(detectPathTraversal("documents/report.pdf")).toBe(false)
      expect(detectPathTraversal("path/to/file")).toBe(false)
    })
  })
})
