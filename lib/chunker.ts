import { DocumentChunk } from '@/types'

interface ChunkOptions {
  maxChunkSize: number
  overlap: number
}

export function chunkText(
  text: string,
  options: ChunkOptions
): DocumentChunk[] {
  if (!text.trim()) return []
  
  const { maxChunkSize, overlap } = options
  const chunks: DocumentChunk[] = []
  const lines = text.split('\n')
  
  let currentChunk = ''
  let startLine = 1
  let currentLine = 1
  
  for (const line of lines) {
    const lineWithNewline = line + '\n'
    
    if (currentChunk.length + lineWithNewline.length > maxChunkSize && currentChunk.length > 0) {
      // Store current chunk
      chunks.push({
        id: `chunk-${chunks.length}`,
        content: currentChunk.trim(),
        metadata: {
          source: 'unknown',
          startLine,
          endLine: currentLine - 1
        }
      })
      
      // Handle overlap
      if (overlap > 0) {
        const words = currentChunk.split(' ')
        const overlapWords = words.slice(-Math.ceil(overlap / 5))
        currentChunk = overlapWords.join(' ') + ' '
        startLine = currentLine - overlapWords.length
      } else {
        currentChunk = ''
        startLine = currentLine
      }
    }
    
    currentChunk += lineWithNewline
    currentLine++
  }
  
  // Push final chunk
  if (currentChunk.trim()) {
    chunks.push({
      id: `chunk-${chunks.length}`,
      content: currentChunk.trim(),
      metadata: {
        source: 'unknown',
        startLine,
        endLine: currentLine - 1
      }
    })
  }
  
  return chunks
}
