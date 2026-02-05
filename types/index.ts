export interface DocumentChunk {
  id: string
  content: string
  metadata: {
    source: string
    startLine?: number
    endLine?: number
    [key: string]: unknown
  }
}

export interface SearchResult {
  chunk: DocumentChunk
  score: number
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  sources?: DocumentChunk[]
}

export interface IngestResponse {
  success: boolean
  chunkCount: number
  error?: string
}
