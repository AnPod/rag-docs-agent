import { describe, it, expect } from 'vitest'
import { chunkText } from '@/lib/chunker'

describe('chunkText', () => {
  it('should split text into chunks of max size', () => {
    const text = 'a '.repeat(1000)
    const chunks = chunkText(text, { maxChunkSize: 100, overlap: 0 })
    
    expect(chunks.length).toBeGreaterThan(1)
    expect(chunks[0].content.length).toBeLessThanOrEqual(100)
  })

  it('should respect overlap between chunks', () => {
    const text = 'word '.repeat(50)
    const chunks = chunkText(text, { maxChunkSize: 100, overlap: 20 })
    
    expect(chunks.length).toBeGreaterThan(1)
    // Check overlap exists
    const firstEnd = chunks[0].content.slice(-20)
    const secondStart = chunks[1].content.slice(0, 20)
    expect(firstEnd).toBe(secondStart)
  })

  it('should preserve line numbers in metadata', () => {
    const text = 'line1\nline2\nline3\nline4\nline5'
    const chunks = chunkText(text, { maxChunkSize: 20, overlap: 0 })
    
    expect(chunks[0].metadata.startLine).toBe(1)
    expect(chunks[0].metadata.endLine).toBeDefined()
  })

  it('should handle empty text gracefully', () => {
    const chunks = chunkText('', { maxChunkSize: 100, overlap: 0 })
    expect(chunks).toHaveLength(0)
  })

  it('should not split mid-word when possible', () => {
    const text = 'hello world test document'
    const chunks = chunkText(text, { maxChunkSize: 15, overlap: 0 })
    
    // Should break at word boundaries
    chunks.forEach(chunk => {
      expect(chunk.content).not.toMatch(/^\s/)
      expect(chunk.content).not.toMatch(/\s$/)
    })
  })
})
