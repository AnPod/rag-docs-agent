import { describe, it, expect, beforeEach, vi } from 'vitest'
import { POST } from '@/app/api/ingest/route'

// Mock the lib functions that the test should control
vi.mock('@/lib', () => ({
  extractTextFromFile: vi.fn(),
  chunkText: vi.fn(),
  generateEmbeddings: vi.fn(),
  ChromaClient: vi.fn().mockImplementation(() => ({
    storeChunks: vi.fn().mockResolvedValue(undefined)
  }))
}))

describe('POST /api/ingest', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Validation', () => {
    it('should return 400 when no file is provided', async () => {
      const FormDataMock = {
        get: vi.fn().mockReturnValue(null)
      }
      
      const request = {
        formData: vi.fn().mockResolvedValue(FormDataMock)
      } as unknown as Request

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toBe('No file provided')
    })

    it('should return 400 for unsupported file types (should reject non .md/.txt)', async () => {
      const mockFile = new File(['content'], 'test.js', { type: 'application/javascript' })
      const FormDataMock = {
        get: vi.fn().mockReturnValue(mockFile)
      }

      const request = {
        formData: vi.fn().mockResolvedValue(FormDataMock)
      } as unknown as Request

      const { extractTextFromFile } = await import('@/lib')
      vi.mocked(extractTextFromFile).mockResolvedValue({
        content: 'content',
        metadata: { source: 'test.js' }
      })

      const response = await POST(request)
      const data = await response.json()

      // This will fail initially because there's no file type validation
      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toContain('file type')
    })

    it('should accept .md files', async () => {
      const mockFile = new File(['content'], 'test.md', { type: 'text/markdown' })
      const FormDataMock = {
        get: vi.fn().mockReturnValue(mockFile)
      }

      const request = {
        formData: vi.fn().mockResolvedValue(FormDataMock)
      } as unknown as Request

      const { extractTextFromFile, chunkText, generateEmbeddings, ChromaClient } = await import('@/lib')
      
      vi.mocked(extractTextFromFile).mockResolvedValue({
        content: 'test content',
        metadata: { source: 'test.md' }
      })
      vi.mocked(chunkText).mockReturnValue([{ 
        content: 'test content', 
        metadata: { source: 'test.md' } 
      }])
      vi.mocked(generateEmbeddings).mockResolvedValue([[1, 2, 3]])

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
    })

    it('should accept .txt files', async () => {
      const mockFile = new File(['content'], 'test.txt', { type: 'text/plain' })
      const FormDataMock = {
        get: vi.fn().mockReturnValue(mockFile)
      }

      const request = {
        formData: vi.fn().mockResolvedValue(FormDataMock)
      } as unknown as Request

      const { extractTextFromFile, chunkText, generateEmbeddings } = await import('@/lib')
      
      vi.mocked(extractTextFromFile).mockResolvedValue({
        content: 'test content',
        metadata: { source: 'test.txt' }
      })
      vi.mocked(chunkText).mockReturnValue([{ 
        content: 'test content', 
        metadata: { source: 'test.txt' } 
      }])
      vi.mocked(generateEmbeddings).mockResolvedValue([[1, 2, 3]])

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
    })
  })

  describe('Large file handling', () => {
    it('should return 400 for files larger than 10MB', async () => {
      // Create a file larger than 10MB
      const largeContent = 'a'.repeat(11 * 1024 * 1024) // 11MB
      const mockFile = new File([largeContent], 'large.md', { type: 'text/markdown' })
      const FormDataMock = {
        get: vi.fn().mockReturnValue(mockFile)
      }

      const request = {
        formData: vi.fn().mockResolvedValue(FormDataMock)
      } as unknown as Request

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toContain('too large')
    })
  })

  describe('Error handling', () => {
    it('should return 500 when extractTextFromFile fails', async () => {
      const error = new Error('Extraction failed')
      const mockFile = new File(['content'], 'test.txt', { type: 'text/plain' })
      const FormDataMock = {
        get: vi.fn().mockReturnValue(mockFile)
      }

      const request = {
        formData: vi.fn().mockResolvedValue(FormDataMock)
      } as unknown as Request

      const { extractTextFromFile } = await import('@/lib')
      vi.mocked(extractTextFromFile).mockRejectedValue(error)

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Extraction failed')
    })

    it('should return 500 when chunkText fails', async () => {
      const error = new Error('Chunking failed')
      const mockFile = new File(['content'], 'test.txt', { type: 'text/plain' })
      const FormDataMock = {
        get: vi.fn().mockReturnValue(mockFile)
      }

      const request = {
        formData: vi.fn().mockResolvedValue(FormDataMock)
      } as unknown as Request

      const { extractTextFromFile, chunkText } = await import('@/lib')
      vi.mocked(extractTextFromFile).mockResolvedValue({
        content: 'test content',
        metadata: { source: 'test.txt' }
      })
      vi.mocked(chunkText).mockImplementation(() => { throw error })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Chunking failed')
    })
  })

  describe('Edge cases', () => {
    it('should handle filenames with special characters', async () => {
      const mockFile = new File(['content'], ' файл с пробелами.md', { type: 'text/markdown' })
      const FormDataMock = {
        get: vi.fn().mockReturnValue(mockFile)
      }

      const request = {
        formData: vi.fn().mockResolvedValue(FormDataMock)
      } as unknown as Request

      const { extractTextFromFile, chunkText, generateEmbeddings } = await import('@/lib')
      
      vi.mocked(extractTextFromFile).mockResolvedValue({
        content: 'test content',
        metadata: { source: ' файл с пробелами.md' }
      })
      vi.mocked(chunkText).mockReturnValue([{ 
        content: 'test content', 
        metadata: { source: ' файл с пробелами.md' } 
      }])
      vi.mocked(generateEmbeddings).mockResolvedValue([[1, 2, 3]])

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
    })

    it('should handle empty files gracefully', async () => {
      const mockFile = new File([''], 'empty.md', { type: 'text/markdown' })
      const FormDataMock = {
        get: vi.fn().mockReturnValue(mockFile)
      }

      const request = {
        formData: vi.fn().mockResolvedValue(FormDataMock)
      } as unknown as Request

      const { extractTextFromFile, chunkText, generateEmbeddings } = await import('@/lib')
      
      vi.mocked(extractTextFromFile).mockResolvedValue({
        content: '',
        metadata: { source: 'empty.md' }
      })
      vi.mocked(chunkText).mockReturnValue([])
      vi.mocked(generateEmbeddings).mockResolvedValue([])

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.chunkCount).toBe(0)
    })
  })
})
