import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'

export const server = setupServer(
  // Mock OpenAI embeddings
  http.post('https://api.openai.com/v1/embeddings', () => {
    return HttpResponse.json({
      data: [{
        embedding: Array(1536).fill(0).map(() => Math.random() - 0.5),
        index: 0,
        object: 'embedding'
      }],
      model: 'text-embedding-3-small',
      object: 'list',
      usage: { prompt_tokens: 10, total_tokens: 10 }
    })
  }),

  // Mock OpenAI chat completions
  http.post('https://api.openai.com/v1/chat/completions', () => {
    return HttpResponse.json({
      id: 'chatcmpl-mock',
      object: 'chat.completion',
      created: Date.now(),
      model: 'gpt-4o',
      choices: [{
        index: 0,
        message: {
          role: 'assistant',
          content: 'This is a mocked response for testing purposes.'
        },
        finish_reason: 'stop'
      }],
      usage: { prompt_tokens: 50, completion_tokens: 20, total_tokens: 70 }
    })
  })
)
