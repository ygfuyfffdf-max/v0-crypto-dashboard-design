/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🧪 CHRONOS INFINITY 2026 — Sanitization Tests
 * ═══════════════════════════════════════════════════════════════════════════════
 * Tests para el módulo de sanitización de inputs
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import {
  detectPathTraversal,
  detectSqlInjection,
  detectXss,
  escapeHtml,
  sanitizeDate,
  sanitizeEmail,
  sanitizeMonetaryAmount,
  sanitizeNumericId,
  sanitizeObject,
  sanitizePhone,
  sanitizeString,
  stripHtmlTags,
} from "@/app/lib/security/sanitize"

describe("🛡️ Sanitization Module Tests", () => {
  describe("escapeHtml", () => {
    it("should escape HTML special characters", () => {
      expect(escapeHtml("<script>")).toBe("&lt;script&gt;")
      expect(escapeHtml('"test"')).toBe("&quot;test&quot;")
      expect(escapeHtml("'test'")).toBe("&#x27;test&#x27;")
      expect(escapeHtml("a & b")).toBe("a &amp; b")
    })

    it("should handle empty strings", () => {
      expect(escapeHtml("")).toBe("")
    })

    it("should not modify safe strings", () => {
      expect(escapeHtml("Hello World")).toBe("Hello World")
    })
  })

  describe("stripHtmlTags", () => {
    it("should remove all HTML tags", () => {
      expect(stripHtmlTags("<p>Hello</p>")).toBe("Hello")
      expect(stripHtmlTags('<script>alert("xss")</script>')).toBe('alert("xss")')
      expect(stripHtmlTags("<div><span>Nested</span></div>")).toBe("Nested")
    })

    it("should handle self-closing tags", () => {
      expect(stripHtmlTags("Hello<br/>World")).toBe("HelloWorld")
    })
  })

  describe("detectXss", () => {
    const xssPayloads = [
      "<script>alert(1)</script>",
      "javascript:alert(1)",
      "onclick=alert(1)",
      '<iframe src="evil.com">',
      "<img src=x onerror=alert(1)>",
    ]

    it.each(xssPayloads)("should detect XSS payload: %s", (payload) => {
      const threats = detectXss(payload)
      expect(threats.length).toBeGreaterThan(0)
    })

    it("should not flag safe input", () => {
      const threats = detectXss("Hello, this is a normal message")
      expect(threats.length).toBe(0)
    })
  })

  describe("detectSqlInjection", () => {
    const sqlPayloads = [
      "' OR '1'='1",
      "1; DROP TABLE users--",
      "UNION SELECT * FROM users",
      "'; DELETE FROM orders; --",
    ]

    it.each(sqlPayloads)("should detect SQL injection: %s", (payload) => {
      const threats = detectSqlInjection(payload)
      expect(threats.length).toBeGreaterThan(0)
    })

    it("should not flag safe input", () => {
      const threats = detectSqlInjection("Juan Pérez")
      expect(threats.length).toBe(0)
    })
  })

  describe("detectPathTraversal", () => {
    const pathPayloads = ["../../../etc/passwd", "..\\..\\windows\\system32", "%2e%2e%2fetc/passwd"]

    it.each(pathPayloads)("should detect path traversal: %s", (payload) => {
      const threats = detectPathTraversal(payload)
      expect(threats.length).toBeGreaterThan(0)
    })
  })

  describe("sanitizeString", () => {
    it("should trim whitespace by default", () => {
      const result = sanitizeString("  hello world  ")
      expect(result.value).toBe("hello world")
      expect(result.wasModified).toBe(true)
    })

    it("should enforce max length", () => {
      const result = sanitizeString("a".repeat(100), { maxLength: 50 })
      expect(result.value.length).toBe(50)
      expect(result.threats).toContain("Truncated to 50 characters")
    })

    it("should escape HTML by default", () => {
      const result = sanitizeString("<script>alert(1)</script>")
      expect(result.value).not.toContain("<script>")
      expect(result.wasModified).toBe(true)
    })

    it("should detect XSS threats", () => {
      const result = sanitizeString("onclick=alert(1)")
      expect(result.threats.some((t) => t.includes("XSS"))).toBe(true)
    })

    it("should detect SQL injection threats", () => {
      const result = sanitizeString("' OR 1=1 --")
      expect(result.threats.some((t) => t.includes("SQL"))).toBe(true)
    })

    it("should remove path traversal attempts", () => {
      const result = sanitizeString("../../etc/passwd")
      expect(result.value).not.toContain("../")
      expect(result.wasModified).toBe(true)
    })

    it("should handle alphanumeric only option", () => {
      const result = sanitizeString("Hello123!@#", { alphanumericOnly: true })
      expect(result.value).toBe("Hello123")
    })

    it("should handle allowed chars with alphanumeric", () => {
      const result = sanitizeString("hello-world_123", {
        alphanumericOnly: true,
        allowedChars: "-_",
      })
      expect(result.value).toBe("hello-world_123")
    })
  })

  describe("sanitizeObject", () => {
    it("should sanitize nested strings", () => {
      const obj = {
        name: "  John  ",
        email: "john@example.com",
        nested: {
          comment: "<script>bad</script>",
        },
      }
      const result = sanitizeObject(obj)
      expect(result.value.name).toBe("John")
      expect(result.value.nested.comment).not.toContain("<script>")
    })

    it("should preserve non-string values", () => {
      const obj = {
        id: 123,
        active: true,
        items: [1, 2, 3],
      }
      const result = sanitizeObject(obj)
      expect(result.value.id).toBe(123)
      expect(result.value.active).toBe(true)
      expect(result.value.items).toEqual([1, 2, 3])
    })

    it("should sanitize array of strings", () => {
      const obj = {
        tags: ["  tag1  ", "<b>tag2</b>"],
      }
      const result = sanitizeObject(obj)
      expect(result.value.tags[0]).toBe("tag1")
      expect(result.value.tags[1]).not.toContain("<b>")
    })
  })

  describe("sanitizeEmail", () => {
    it("should validate correct emails", () => {
      const result = sanitizeEmail("User@Example.COM")
      expect(result.value).toBe("user@example.com")
      expect(result.threats.some((t) => t.includes("Invalid email"))).toBe(false)
    })

    it("should flag invalid emails", () => {
      const result = sanitizeEmail("not-an-email")
      expect(result.threats).toContain("Invalid email format")
    })

    it("should trim whitespace", () => {
      const result = sanitizeEmail("  test@example.com  ")
      expect(result.value).toBe("test@example.com")
    })
  })

  describe("sanitizePhone", () => {
    it("should keep valid phone characters", () => {
      const result = sanitizePhone("+1 (555) 123-4567")
      expect(result.value).toBe("+1 (555) 123-4567")
    })

    it("should remove invalid characters", () => {
      const result = sanitizePhone("+1 555 ABC 1234")
      expect(result.value).not.toContain("ABC")
      expect(result.wasModified).toBe(true)
    })

    it("should flag too short phone numbers", () => {
      const result = sanitizePhone("123")
      expect(result.threats.some((t) => t.includes("length invalid"))).toBe(true)
    })
  })

  describe("sanitizeNumericId", () => {
    it("should return valid numeric IDs", () => {
      expect(sanitizeNumericId("123")).toBe(123)
      expect(sanitizeNumericId(456)).toBe(456)
    })

    it("should return null for invalid IDs", () => {
      expect(sanitizeNumericId("abc")).toBeNull()
      expect(sanitizeNumericId(-1)).toBeNull()
      expect(sanitizeNumericId(1.5)).toBeNull()
    })
  })

  describe("sanitizeDate", () => {
    it("should parse valid dates", () => {
      const result = sanitizeDate("2025-12-23")
      expect(result).toBeInstanceOf(Date)
      expect(result?.getFullYear()).toBe(2025)
    })

    it("should return null for invalid dates", () => {
      expect(sanitizeDate("not-a-date")).toBeNull()
      expect(sanitizeDate("2025-13-45")).toBeNull()
    })
  })

  describe("sanitizeMonetaryAmount", () => {
    it("should parse valid amounts", () => {
      expect(sanitizeMonetaryAmount("1234.56")).toBe(1234.56)
      expect(sanitizeMonetaryAmount("$1,234.56")).toBe(1234.56)
      expect(sanitizeMonetaryAmount(99.99)).toBe(99.99)
    })

    it("should round to 2 decimal places", () => {
      expect(sanitizeMonetaryAmount("123.456")).toBe(123.46)
    })

    it("should return null for invalid amounts", () => {
      expect(sanitizeMonetaryAmount("abc")).toBeNull()
      expect(sanitizeMonetaryAmount(Infinity)).toBeNull()
    })
  })

  describe("Security edge cases", () => {
    it("should handle null bytes", () => {
      const result = sanitizeString("hello\x00world")
      expect(result.value).not.toContain("\x00")
    })

    it("should handle unicode attacks", () => {
      const result = sanitizeString("hello\u202Eworld") // RTL override
      expect(result.value).toBeDefined()
    })

    it("should handle very long inputs", () => {
      const longInput = "a".repeat(100000)
      const result = sanitizeString(longInput, { maxLength: 10000 })
      expect(result.value.length).toBe(10000)
    })

    it("should handle nested XSS attempts", () => {
      const payload = "<scr<script>ipt>alert(1)</scr</script>ipt>"
      const result = sanitizeString(payload, { stripTags: true })
      expect(result.value).not.toContain("<script>")
    })
  })
})
