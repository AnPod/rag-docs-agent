import { cache } from 'react'
import OpenAI from 'openai'

export const getOpenAIClient = cache(() => {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  })
})
