export type DeliverableFormat = {
  value: string
  label: string
  type: "file" | "text"
  // For file formats: accepted extensions for the <input accept> attribute
  accept?: string
  // For text formats: placeholder hint shown in the input
  placeholder?: string
}

export const DELIVERABLE_FORMATS: DeliverableFormat[] = [
  // ── File formats ───────────────────────────────────────────────────────────
  { value: ".ai",   label: ".ai — Adobe Illustrator",  type: "file", accept: ".ai" },
  { value: ".eps",  label: ".eps — EPS Vector",         type: "file", accept: ".eps" },
  { value: ".psd",  label: ".psd — Photoshop",          type: "file", accept: ".psd" },
  { value: ".svg",  label: ".svg — SVG Vector",         type: "file", accept: ".svg" },
  { value: ".fig",  label: ".fig — Figma",              type: "file", accept: ".fig" },
  { value: ".png",  label: ".png — PNG Image",          type: "file", accept: ".png" },
  { value: ".jpg",  label: ".jpg — JPEG Image",         type: "file", accept: ".jpg,.jpeg" },
  { value: ".webp", label: ".webp — WebP Image",        type: "file", accept: ".webp" },
  { value: ".pdf",  label: ".pdf — PDF Document",       type: "file", accept: ".pdf" },
  { value: ".docx", label: ".docx — Word Document",     type: "file", accept: ".docx" },
  { value: ".xlsx", label: ".xlsx — Excel Spreadsheet", type: "file", accept: ".xlsx" },
  { value: ".mp4",  label: ".mp4 — Video",              type: "file", accept: ".mp4" },
  { value: ".mp3",  label: ".mp3 — Audio",              type: "file", accept: ".mp3,.wav" },
  { value: ".zip",  label: ".zip — Archive",            type: "file", accept: ".zip" },

  // ── Text / value formats ───────────────────────────────────────────────────
  { value: "hex",  label: "Hex Color",  type: "text", placeholder: "#FF5733" },
  { value: "url",  label: "URL / Link", type: "text", placeholder: "https://…" },
  { value: "text", label: "Plain Text", type: "text", placeholder: "Enter value…" },
]

export const FORMAT_VALUES = DELIVERABLE_FORMATS.map((f) => f.value)

export function getFormat(value: string | null | undefined): DeliverableFormat | null {
  if (!value) return null
  return DELIVERABLE_FORMATS.find((f) => f.value === value) ?? null
}

export function isTextFormat(value: string | null | undefined): boolean {
  return getFormat(value)?.type === "text"
}

export function isFileFormat(value: string | null | undefined): boolean {
  return getFormat(value)?.type === "file"
}

// Gemini prompt snippet — injected into extraction instructions
export const FORMAT_LIST_FOR_PROMPT = FORMAT_VALUES.join(", ")
