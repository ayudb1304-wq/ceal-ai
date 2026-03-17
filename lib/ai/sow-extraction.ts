import "server-only"

import type { SowExtractionResult } from "@/lib/ai/sow-types"

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024
const GEMINI_MODEL = "gemini-2.5-flash"

const EXTRACTION_INSTRUCTIONS = [
  "Extract all specific deliverables and technical credentials required in this SOW.",
  "Return only valid JSON. Use the schema exactly.",
  "Deliverables: output each as a SINGLE checklist item—one upload per row. One deliverable = one concrete asset (e.g. 'Vector Logo Source', 'Brand Guidelines PDF'), not umbrella items like 'All Project Files' or 'Verified Project Files'.",
  "requiredFormat must be a specific format or tight alternative (e.g. '.ai or .eps', '.pdf', '.mp4'). Never use 'Various' or long lists like '.ai, .eps, .psd, .mov, .mp4, .pdf'.",
  "Credentials: name each from the SOW (e.g. 'Staging Server Login', 'API Key'). Avoid generic labels like 'Generic Encrypted Project Keys' unless the SOW uses that wording.",
  "If the SOW is vague, still output concrete deliverable titles and put ambiguity in the notes array.",
].join("\n")

function getGeminiApiKey() {
  const value = process.env.GEMINI_API_KEY

  if (!value) {
    throw new Error("Missing GEMINI_API_KEY")
  }

  return value
}

function sanitizeText(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
}

function normalizeResult(data: unknown): SowExtractionResult {
  const source = typeof data === "object" && data !== null ? data : {}
  const payload = source as {
    deliverables?: unknown[]
    credentials?: unknown[]
    notes?: unknown[]
  }

  return {
    deliverables: Array.isArray(payload.deliverables)
      ? payload.deliverables
          .map((item) => {
            const value = typeof item === "object" && item !== null ? item : {}
            return {
              title: sanitizeText((value as Record<string, unknown>).title),
              description: sanitizeText((value as Record<string, unknown>).description),
              requiredFormat: sanitizeText((value as Record<string, unknown>).requiredFormat),
              category: sanitizeText((value as Record<string, unknown>).category),
            }
          })
          .filter((item) => item.title)
      : [],
    credentials: Array.isArray(payload.credentials)
      ? payload.credentials
          .map((item) => {
            const value = typeof item === "object" && item !== null ? item : {}
            return {
              label: sanitizeText((value as Record<string, unknown>).label),
              description: sanitizeText((value as Record<string, unknown>).description),
            }
          })
          .filter((item) => item.label)
      : [],
    notes: Array.isArray(payload.notes)
      ? payload.notes.map((item) => sanitizeText(item)).filter(Boolean)
      : [],
  }
}

async function buildGeminiPartsFromFile(file: File) {
  if (file.size === 0) {
    throw new Error("The uploaded SOW file is empty.")
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error("Please upload a SOW smaller than 10 MB.")
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  const mimeType = file.type
  const fileName = file.name.toLowerCase()

  if (mimeType === "application/pdf" || fileName.endsWith(".pdf")) {
    return [
      {
        text: `${EXTRACTION_INSTRUCTIONS}\n\nThe attached file is a PDF SOW.`,
      },
      {
        inlineData: {
          mimeType: "application/pdf",
          data: buffer.toString("base64"),
        },
      },
    ]
  }

  if (
    mimeType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    fileName.endsWith(".docx")
  ) {
    const mammoth = await import("mammoth")
    const result = await mammoth.extractRawText({ buffer })
    return [
      {
        text: `${EXTRACTION_INSTRUCTIONS}\n\nSOW content:\n${result.value.trim()}`,
      },
    ]
  }

  if (
    mimeType === "text/plain" ||
    mimeType === "text/markdown" ||
    fileName.endsWith(".txt") ||
    fileName.endsWith(".md")
  ) {
    return [
      {
        text: `${EXTRACTION_INSTRUCTIONS}\n\nSOW content:\n${buffer.toString("utf8").trim()}`,
      },
    ]
  }

  throw new Error("Unsupported SOW format. Please upload a PDF, DOCX, TXT, or MD file.")
}

export async function extractDeliverablesFromSow(file: File): Promise<SowExtractionResult> {
  const parts = await buildGeminiPartsFromFile(file)

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${getGeminiApiKey()}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts,
          },
        ],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            required: ["deliverables", "credentials", "notes"],
            properties: {
              deliverables: {
                type: "ARRAY",
                items: {
                  type: "OBJECT",
                  required: ["title", "description", "requiredFormat", "category"],
                  properties: {
                    title: { type: "STRING" },
                    description: { type: "STRING" },
                    requiredFormat: { type: "STRING" },
                    category: { type: "STRING" },
                  },
                },
              },
              credentials: {
                type: "ARRAY",
                items: {
                  type: "OBJECT",
                  required: ["label", "description"],
                  properties: {
                    label: { type: "STRING" },
                    description: { type: "STRING" },
                  },
                },
              },
              notes: {
                type: "ARRAY",
                items: { type: "STRING" },
              },
            },
          },
        },
      }),
    }
  )

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Gemini request failed: ${errorText}`)
  }

  const payload = (await response.json()) as {
    candidates?: Array<{
      content?: {
        parts?: Array<{
          text?: string
        }>
      }
    }>
  }

  const jsonText = payload.candidates?.[0]?.content?.parts?.[0]?.text

  if (!jsonText) {
    throw new Error("Gemini did not return structured extraction data.")
  }

  let parsed: unknown

  try {
    parsed = JSON.parse(jsonText)
  } catch {
    throw new Error("Gemini returned invalid JSON for the SOW extraction.")
  }

  return normalizeResult(parsed)
}
