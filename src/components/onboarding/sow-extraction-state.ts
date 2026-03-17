import type { SowExtractionResult } from "@/lib/ai/sow-types"

export type ExtractSowState =
  | {
      status: "idle"
      fileName: string | null
      result: null
      error: null
    }
  | {
      status: "error"
      fileName: string | null
      result: null
      error: string
    }
  | {
      status: "success"
      fileName: string
      result: SowExtractionResult
      error: null
    }

export const initialExtractSowState: ExtractSowState = {
  status: "idle",
  fileName: null,
  result: null,
  error: null,
}
