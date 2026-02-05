import { expect, describe, it } from 'vitest'

describe('API Integration', () => {
  it('should have required environment variables', () => {
    expect(process.env.OPENAI_API_KEY).toBeDefined()
  })
})
