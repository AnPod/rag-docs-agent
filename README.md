# RAG Docs Agent

A conversational AI agent that ingests documentation and codebases to answer questions with source-cited responses.

Built with **OpenAI Assistants API**, **ChromaDB**, **Next.js 14**, and **Vercel AI SDK**.

---

## 🏗️ Architecture

### System Context
```mermaid
graph TB
    User([User]) -->|Uploads files / Asks questions| UI[Next.js UI]
    UI -->|API calls| Server[Next.js API Routes]
    Server -->|Store/Query| Chroma[(ChromaDB)]
    Server -->|Generate| OpenAI[OpenAI API]
    Server -->|File parsing| Parser[Document Parser]
```

### Data Flow
```mermaid
sequenceDiagram
    participant U as User
    participant API as API Route
    participant P as Parser
    participant C as ChromaDB
    participant O as OpenAI

    U->>API: Upload document
    API->>P: Extract text
    P->>API: Return chunks
    API->>C: Store embeddings
    C->>API: Confirm storage
    API->>U: Upload complete

    U->>API: Ask question
    API->>C: Query similar chunks
    C->>API: Return context
    API->>O: Generate answer with context
    O->>API: Return response + citations
    API->>U: Stream answer with sources
```

### Component Architecture
```mermaid
graph LR
    subgraph Frontend
        Chat[Chat Interface]
        Upload[File Upload]
        Sources[Source Viewer]
    end
    
    subgraph API Layer
        ingest[/api/ingest\]
        chat[/api/chat\]
        search[/api/search\]
    end
    
    subgraph Core
        Parser[Document Parser]
        Chunker[Text Chunker]
        Embedder[Embedding Service]
    end
    
    subgraph Storage
        Chroma[(ChromaDB)]
    end
    
    Upload --> ingest
    ingest --> Parser
    Parser --> Chunker
    Chunker --> Embedder
    Embedder --> Chroma
    
    Chat --> chat
    chat --> search
    search --> Chroma
    chat --> Embedder
    chat --> Sources
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- OpenAI API key

### Setup

```bash
# Clone and install
git clone <repo-url>
cd rag-docs-agent
npm install

# Environment
cp .env.example .env.local
# Add your OPENAI_API_KEY to .env.local

# Run tests
npm test

# Start dev server
npm run dev
```

---

## 🧪 Testing Strategy

| Test Type | Tool | Coverage |
|-----------|------|----------|
| Unit | Vitest | Services, utilities |
| Integration | Vitest + MSW | API routes, mocks |
| Component | Testing Library | React components |

All OpenAI calls are mocked with MSW for fast, deterministic tests.

---

## 📁 Project Structure

```
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── components/        # React components
│   └── page.tsx           # Main chat UI
├── lib/                   # Core logic
│   ├── parser.ts          # Document parsing
│   ├── chunker.ts         # Text chunking
│   ├── embedder.ts        # Embedding service
│   └── chroma.ts          # ChromaDB client
├── tests/                 # Test files
│   ├── unit/             
│   ├── integration/
│   └── mocks/
└── types/                 # TypeScript types
```

---

## 🔧 Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14 (App Router) |
| UI | React 18 + Tailwind CSS |
| AI SDK | Vercel AI SDK |
| LLM | OpenAI GPT-4o |
| Vector DB | ChromaDB |
| Testing | Vitest + MSW |
| Deployment | Vercel |

---

## 📝 License

MIT
