/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🧠 PARSE FORM INTENT API — Voice-to-Form Field Extraction
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Recibe un transcript de voz + definición de campos de formulario,
 * y usa OpenAI para extraer los valores apropiados para cada campo.
 *
 * Fallback local si OpenAI no está disponible.
 *
 * POST /api/ai/parse-form-intent
 * Body: { transcript: string, fields: VoiceFormField[] }
 * Response: { fields: Record<string, any>, confidence: number }
 *
 * @version 1.0.0
 */

import { NextRequest, NextResponse } from "next/server"

// ═══════════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════════

interface VoiceFormField {
  name: string
  label: string
  type: "text" | "number" | "currency" | "select" | "date"
  options?: { value: string; label: string }[]
}

interface ParseFormIntentRequest {
  transcript: string
  fields: VoiceFormField[]
}

interface ParsedFieldValues {
  fields: Record<string, string | number>
  confidence: number
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTES
// ═══════════════════════════════════════════════════════════════════════════════

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions"
const LOCAL_FALLBACK_CONFIDENCE = 0.4

/** Mapeo de números en español para fallback local */
const SPANISH_NUMBERS: Record<string, number> = {
  cero: 0,
  uno: 1,
  una: 1,
  dos: 2,
  tres: 3,
  cuatro: 4,
  cinco: 5,
  seis: 6,
  siete: 7,
  ocho: 8,
  nueve: 9,
  diez: 10,
  once: 11,
  doce: 12,
  trece: 13,
  catorce: 14,
  quince: 15,
  veinte: 20,
  treinta: 30,
  cuarenta: 40,
  cincuenta: 50,
  sesenta: 60,
  setenta: 70,
  ochenta: 80,
  noventa: 90,
  cien: 100,
  ciento: 100,
  doscientos: 200,
  trescientos: 300,
  cuatrocientos: 400,
  quinientos: 500,
  seiscientos: 600,
  setecientos: 700,
  ochocientos: 800,
  novecientos: 900,
  mil: 1000,
  millón: 1000000,
  millon: 1000000,
}

// ═══════════════════════════════════════════════════════════════════════════════
// SYSTEM PROMPT
// ═══════════════════════════════════════════════════════════════════════════════

function buildSystemPrompt(fields: VoiceFormField[]): string {
  const fieldDescriptions = fields
    .map((f) => {
      let desc = `- "${f.name}" (label: "${f.label}", type: ${f.type})`
      if (f.type === "select" && f.options) {
        desc += ` — opciones válidas: ${f.options.map((o) => `"${o.value}" (${o.label})`).join(", ")}`
      }
      if (f.type === "currency") {
        desc += " — valor numérico en moneda"
      }
      if (f.type === "date") {
        desc += " — formato YYYY-MM-DD"
      }
      return desc
    })
    .join("\n")

  return `You are a form field extraction AI. Given a user's voice transcript in Spanish and a list of form fields, extract the appropriate values for each field.

FORM FIELDS:
${fieldDescriptions}

RULES:
1. Return ONLY a valid JSON object with field names as keys and extracted values.
2. For "number" and "currency" fields, return numeric values (not strings).
3. For "date" fields, return dates in YYYY-MM-DD format. Convert relative dates like "hoy" (today), "ayer" (yesterday), "mañana" (tomorrow) to actual dates. Today is ${new Date().toISOString().split("T")[0]}.
4. For "select" fields, return the matching option "value" (not the label).
5. For "text" fields, return the extracted text string.
6. Only include fields where you found a clear value in the transcript.
7. Do NOT make up values. If a field value is not mentioned, omit it.
8. The transcript is in Spanish. Numbers may be written as words (e.g., "mil doscientos" = 1200).

RESPONSE FORMAT (strict JSON, nothing else):
{
  "fields": { "fieldName": value, ... },
  "confidence": 0.0-1.0
}

confidence should reflect how certain you are about the extraction:
- 0.9-1.0: Very clear, explicit values mentioned
- 0.7-0.89: Reasonably clear with some inference
- 0.5-0.69: Ambiguous, some guessing involved
- Below 0.5: Very uncertain`
}

// ═══════════════════════════════════════════════════════════════════════════════
// LOCAL FALLBACK PARSER
// ═══════════════════════════════════════════════════════════════════════════════

function extractNumber(text: string): number | null {
  // Patrón de moneda: $1,234.56
  const currencyMatch = text.match(/\$\s*([\d,]+(?:\.\d{1,2})?)/)
  if (currencyMatch) {
    const cleaned = currencyMatch[1].replace(/,/g, "")
    const num = parseFloat(cleaned)
    if (!isNaN(num)) return num
  }

  // Número directo
  const directMatch = text.match(/(\d[\d,.]*\d|\d+)/)
  if (directMatch) {
    const cleaned = directMatch[1].replace(/,/g, "")
    const num = parseFloat(cleaned)
    if (!isNaN(num)) return num
  }

  // Números en español
  const words = text.toLowerCase().split(/\s+/)
  let total = 0
  let current = 0
  let found = false

  for (const word of words) {
    const val = SPANISH_NUMBERS[word]
    if (val !== undefined) {
      found = true
      if (val === 1000) {
        current = current === 0 ? 1000 : current * 1000
      } else if (val === 1000000) {
        current = current === 0 ? 1000000 : current * 1000000
        total += current
        current = 0
      } else {
        current += val
      }
    }
  }

  if (found) {
    total += current
    return total
  }

  return null
}

function extractDate(text: string): string | null {
  const lower = text.toLowerCase()
  const today = new Date()

  if (lower.includes("hoy")) {
    return today.toISOString().split("T")[0]
  }
  if (lower.includes("ayer")) {
    const d = new Date(today)
    d.setDate(d.getDate() - 1)
    return d.toISOString().split("T")[0]
  }
  if (lower.includes("mañana") && !lower.includes("por la mañana")) {
    const d = new Date(today)
    d.setDate(d.getDate() + 1)
    return d.toISOString().split("T")[0]
  }

  const dateMatch = text.match(/(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{2,4})/)
  if (dateMatch) {
    const day = dateMatch[1].padStart(2, "0")
    const month = dateMatch[2].padStart(2, "0")
    let year = dateMatch[3]
    if (year.length === 2) year = "20" + year
    return `${year}-${month}-${day}`
  }

  return null
}

function localFallbackParse(transcript: string, fields: VoiceFormField[]): ParsedFieldValues {
  const result: Record<string, string | number> = {}
  const lower = transcript.toLowerCase()

  for (const field of fields) {
    switch (field.type) {
      case "number":
      case "currency": {
        const num = extractNumber(transcript)
        if (num !== null) {
          result[field.name] = num
        }
        break
      }

      case "date": {
        const date = extractDate(transcript)
        if (date) {
          result[field.name] = date
        }
        break
      }

      case "select": {
        if (field.options) {
          // Exact match on label
          for (const opt of field.options) {
            if (lower.includes(opt.label.toLowerCase())) {
              result[field.name] = opt.value
              break
            }
          }
          // Exact match on value
          if (!result[field.name]) {
            for (const opt of field.options) {
              if (lower.includes(opt.value.toLowerCase())) {
                result[field.name] = opt.value
                break
              }
            }
          }
        }
        break
      }

      case "text":
      default: {
        const textFields = fields.filter((f) => f.type === "text")
        if (textFields.length === 1) {
          result[field.name] = transcript.trim()
        }
        break
      }
    }
  }

  return {
    fields: result,
    confidence: LOCAL_FALLBACK_CONFIDENCE,
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// ROUTE HANDLER
// ═══════════════════════════════════════════════════════════════════════════════

export async function POST(request: NextRequest) {
  try {
    const body: ParseFormIntentRequest = await request.json()
    const { transcript, fields } = body

    // Validación
    if (!transcript || typeof transcript !== "string") {
      return NextResponse.json(
        { error: 'El campo "transcript" es requerido y debe ser un string' },
        { status: 400 }
      )
    }

    if (!fields || !Array.isArray(fields) || fields.length === 0) {
      return NextResponse.json(
        { error: 'El campo "fields" es requerido y debe ser un array no vacío' },
        { status: 400 }
      )
    }

    // Intentar con OpenAI
    const apiKey = process.env.OPENAI_API_KEY

    if (!apiKey) {
      console.warn("[parse-form-intent] OPENAI_API_KEY not set, using local fallback")
      const fallback = localFallbackParse(transcript, fields)
      return NextResponse.json(fallback)
    }

    try {
      const systemPrompt = buildSystemPrompt(fields)

      const openaiResponse = await fetch(OPENAI_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: transcript },
          ],
          temperature: 0.2,
          max_tokens: 500,
          response_format: { type: "json_object" },
        }),
      })

      if (!openaiResponse.ok) {
        const errorText = await openaiResponse.text()
        console.error("[parse-form-intent] OpenAI error:", openaiResponse.status, errorText)
        throw new Error(`OpenAI API error: ${openaiResponse.status}`)
      }

      const openaiData = await openaiResponse.json()
      const content = openaiData.choices?.[0]?.message?.content

      if (!content) {
        throw new Error("Empty response from OpenAI")
      }

      // Parsear la respuesta JSON de OpenAI
      const parsed = JSON.parse(content)

      // Validar y sanitizar los campos retornados
      const sanitizedFields: Record<string, string | number> = {}

      const fieldNames = new Set(fields.map((f) => f.name))
      const fieldMap = new Map(fields.map((f) => [f.name, f]))

      const rawFields = parsed.fields || parsed
      for (const [key, value] of Object.entries(rawFields)) {
        if (!fieldNames.has(key)) continue

        const fieldDef = fieldMap.get(key)
        if (!fieldDef) continue

        // Sanitizar según tipo
        switch (fieldDef.type) {
          case "number":
          case "currency": {
            const num = typeof value === "number" ? value : parseFloat(String(value))
            if (!isNaN(num)) {
              sanitizedFields[key] = num
            }
            break
          }

          case "select": {
            const strVal = String(value)
            if (fieldDef.options?.some((o) => o.value === strVal)) {
              sanitizedFields[key] = strVal
            }
            break
          }

          case "date": {
            const dateStr = String(value)
            // Validar formato YYYY-MM-DD
            if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
              sanitizedFields[key] = dateStr
            }
            break
          }

          case "text":
          default: {
            sanitizedFields[key] = String(value)
            break
          }
        }
      }

      const confidence =
        typeof parsed.confidence === "number" ? Math.min(1, Math.max(0, parsed.confidence)) : 0.75

      return NextResponse.json({
        fields: sanitizedFields,
        confidence,
      })
    } catch (openaiError) {
      // OpenAI falló — usar fallback local
      console.warn("[parse-form-intent] OpenAI failed, using local fallback:", openaiError)
      const fallback = localFallbackParse(transcript, fields)
      return NextResponse.json(fallback)
    }
  } catch (error) {
    console.error("[parse-form-intent] Internal error:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
