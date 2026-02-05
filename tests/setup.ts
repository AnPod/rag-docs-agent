import { expect, afterEach, beforeAll, afterAll } from 'vitest'
import { cleanup } from '@testing-library/react'
import { server } from './mocks/server'

// Extend matchers
import '@testing-library/jest-dom'

// Cleanup after each test
afterEach(() => {
  cleanup()
})

// MSW setup
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
