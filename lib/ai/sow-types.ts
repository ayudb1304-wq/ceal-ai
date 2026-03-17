export type ExtractedDeliverable = {
  title: string
  description: string
  requiredFormat: string
  category: string
}

export type ExtractedCredential = {
  label: string
  description: string
}

export type SowExtractionResult = {
  deliverables: ExtractedDeliverable[]
  credentials: ExtractedCredential[]
  notes: string[]
}
