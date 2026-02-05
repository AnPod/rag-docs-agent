# ADR 005: Test-Driven Development (TDD)

## Status
Accepted

## Context
Building portfolio project to demonstrate engineering rigor.

## Decision
Apply **TDD**: Write tests first, then implementation.

## Process
1. Write failing test describing desired behavior
2. Write minimal code to pass
3. Refactor with confidence

## Coverage Areas
| Module | Tests |
|--------|-------|
| `chunker.ts` | Chunk size, overlap, line numbers, word boundaries |
| `parser.ts` | File type validation, content extraction, line counting |
| `embedder.ts` | Embedding shape, empty input handling |
| `chroma.ts` | Store/query operations (mocked client) |

## Consequences
- Proves code works before shipping
- Documents expected behavior via tests
- Safe refactoring as project grows
- Slightly slower initial development, faster long-term

## Trade-offs
- Test maintenance overhead
- Some "obvious" code still needs tests for coverage

## Example
```typescript
// Test first
it('should split text into chunks of max size', () => {
  const chunks = chunkText('a '.repeat(1000), { maxChunkSize: 100 })
  expect(chunks[0].content.length).toBeLessThanOrEqual(100)
})

// Then implement
export function chunkText(text: string, options: ChunkOptions) {
  // ...implementation
}
```

## Links
- [Vitest docs](https://vitest.dev/guide/)
