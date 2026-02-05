# ADR 001: Next.js 14 with App Router

## Status
Accepted

## Context
Need a full-stack framework for the RAG Documentation Agent that supports:
- Server-side API routes for document processing
- React frontend for chat interface
- Easy deployment to Vercel
- TypeScript first-class support

## Decision
Use **Next.js 14** with the App Router.

## Rationale
| Alternative | Pros | Cons | Verdict |
|-------------|------|------|---------|
| Next.js 14 | Full-stack, Vercel-native, streaming, great DX | Serverless limits for long jobs | ✅ Best fit |
| Express + React | Familiar, flexible | Two repos/deps, more setup | ❌ More complex |
| FastAPI + Vite | Python for AI, fast API | Split codebase, harder deploy | ❌ Overkill |
| SvelteKit | Lighter, fast | Smaller ecosystem | ❌ Less hiring signal |

## Consequences
- API routes colocated with frontend
- Serverless functions handle async work
- Vercel Edge Runtime ready

## Links
- [Next.js Docs](https://nextjs.org/docs)
