import { describe, it, expect, vi } from 'vitest'
import { generateEmbedding } from '@/lib/embedder'

describe('generateEmbedding', () => {
  it('should return embedding array for text', async () => {
    const result = await generateEmbedding('test text')
    
    expect(result).toBeInstanceOf(Array)
    expect(result.length).toBe(1536)
    expect(typeof result[0]).toBe('number')
  })

  it('should handle empty string', async () => {
    const result = await generateEmbedding('')
    
    expect(result).toBeInstanceOf(Array)
    expect(result.length).toBe(1536)
  })

  it('should handle long text', async () => {
    const longText = 'word '.repeat(10000)
    const result = await generateEmbedding(longText)
    
    expect(result).toBeInstanceOf(Array)
    expect(result.length).toBe(1536)
  })
})
