# ADR 002: ChromaDB over OpenAI Built-in Vector Store

## Status

Accepted

## Context

RAG requires vector storage for document chunks. Two main options:

1. OpenAI's built-in vector store (Assistants API)
2. Self-hosted/managed vector DB

## Decision

Use **ChromaDB** as the vector database.

## Rationale

| Criteria       | OpenAI Built-in     | ChromaDB                         |
| -------------- | ------------------- | -------------------------------- |
| Cost           | Pay per query       | Self-hosted = predictable        |
| Control        | Limited (black box) | Full query control               |
| Portability    | Locked to OpenAI    | Swap LLM providers easily        |
| Local dev      | Requires API calls  | Works offline                    |
| Learning value | Less interesting    | Shows understanding of RAG stack |

## Trade-offs

- **Added complexity**: Must run ChromaDB (local or cloud)
- **Benefit**: Demonstrates knowledge of vector DB architecture

## Consequences

- Need Docker/local ChromaDB for development
- Can swap to Pinecone/Weaviate later with minimal code changes
- Cleaner separation of concerns

## Links

- [ChromaDB](https://docs.trychroma.com/)
