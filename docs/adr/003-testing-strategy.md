# ADR 003: Vitest + MSW for Testing

## Status
Accepted

## Context
Testing strategy needed that:
- Runs fast in CI
- Doesn't hit OpenAI APIs (cost control)
- Tests both unit logic and integration flows

## Decision
Use **Vitest** for test runner, **MSW** for API mocking.

## Rationale
| Tool | Purpose | Why |
|------|---------|-----|
| Vitest | Test runner | Fast, native TS, Jest-compatible |
| MSW | Mock OpenAI API | Intercepts HTTP, realistic mocking |
| @testing-library/react | Component tests | User-centric assertions |

## Mock Strategy
All OpenAI calls mocked via MSW:
- `/v1/embeddings` → returns random 1536-dim vectors
- `/v1/chat/completions` → returns deterministic responses

## Consequences
- Tests run in ~1s vs 10s+ with real API
- No API costs during development
- Can run offline
- Deterministic, no flaky tests from LLM variance

## Trade-offs
- Mock may diverge from real API (monitor schema changes)
- Integration tests need staging env for "real" validation

## Links
- [Vitest](https://vitest.dev/)
- [MSW](https://mswjs.io/)
