# Contributing to RAG Docs Agent

Thank you for your interest in contributing! This guide will help you get started.

---

## 🤝 How to Contribute

We welcome contributions in the form of bug reports, feature requests, documentation improvements, and code changes.

### Reporting Bugs

1. Check existing issues to avoid duplicates
2. Create a new issue with:
   - Descriptive title
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details (OS, Node.js version)
3. Add labels if applicable (bug, enhancement, documentation)

### Suggesting Features

1. Check if a similar feature has been proposed
2. Create a new issue with:
   - Clear description of the feature
   - Use case scenarios
   - Possible implementation approach

### Submitting Code Changes

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make your changes
4. Run tests and ensure they pass
5. Commit your changes with clear messages
6. Push to your fork: `git push origin feature/my-feature`
7. Create a Pull Request

---

## ⚙️ Development Setup

### Prerequisites

- Node.js 18+
- npm or yarn
- OpenAI API key (for local development)

### Setup

```bash
# Fork and clone the repository
git clone https://github.com/YOUR_USERNAME/rag-docs-agent.git
cd rag-docs-agent

# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local
# Add your OPENAI_API_KEY to .env.local

# Start development server
npm run dev

# Open http://localhost:3000
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm test

# Run specific test file
npm test path/to/file.test.ts
```

### Linting and Formatting

```bash
# Run ESLint
npm run lint

# Run type checker
npx tsc --noEmit

# Format code with Prettier
npx prettier --write "**/*.{ts,tsx,js,jsx,json,md}"
```

### Before Submitting

Ensure all of the following pass:
- ✅ All tests pass: `npm test -- --run`
- ✅ No linting errors: `npm run lint`
- ✅ No type errors: `npx tsc --noEmit`
- ✅ Code is formatted: `npx prettier --write .`

---

## 📋 Code Style Guide

### TypeScript

- Use TypeScript for all new files
- Define types in `types/` directory for shared types
- Use interfaces for object shapes
- Avoid `any` type; use `unknown` instead when necessary

### Naming Conventions

- Files: `camelCase.ts` or `PascalCase.tsx` for components
- Variables/Functions: `camelCase`
- Constants: `UPPER_SNAKE_CASE`
- Classes/Interfaces/Types: `PascalCase`

### Component Guidelines

- Use functional components with hooks
- Keep components focused and single-purpose
- Use TypeScript for props typing
- Add accessibility attributes (aria labels, roles)

### Testing Guidelines

- Write tests before implementing features (TDD)
- Mock external dependencies (OpenAI, ChromaDB)
- Test both happy paths and error cases
- Aim for high coverage on core logic
- Keep tests fast and deterministic

### Commit Messages

Format: `type(scope): description`

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

Examples:
```
feat(embedder): add support for larger embeddings
fix(parser): handle empty files gracefully
docs(api): update ingest endpoint documentation
test(chroma): add tests for error handling
```

---

## 📁 Project Structure Overview

```
├── app/                    # Next.js App Router
│   ├── api/               # API endpoints (ingest, chat)
│   ├── components/        # React components
│   └── layout.tsx         # Root layout
├── lib/                   # Core business logic
│   ├── parser.ts          # Document parsing
│   ├── chunker.ts         # Text chunking
│   ├── embedder.ts        # OpenAI embeddings
│   └── chroma.ts          # ChromaDB client
├── tests/                 # Test files
│   ├── unit/              # Unit tests for lib/ functions
│   ├── integration/       # API route tests
│   └── mocks/             # MSW mock services
└── types/                 # TypeScript type definitions
```

### Where to Add Code

- **New lib function:** Add to `lib/` and export from `lib/index.ts`
- **New API endpoint:** Add to `app/api/` directory
- **New component:** Add to `app/components/`
- **Shared types:** Add to `types/index.ts`
- **Tests:** Add to appropriate `tests/` subdirectory

---

## 🔧 Development Workflow

1. **Pick an issue** from the Issues page or create one
2. **Comment on the issue** you're working on
3. **Create a branch** for your work
4. **Write tests first** (TDD approach)
5. **Implement the feature** while watching tests pass
6. **Run full test suite** to ensure nothing broke
7. **Update documentation** if needed
8. **Commit and push** your changes
9. **Create Pull Request** with a clear description

---

## 📜 Pull Request Process

When submitting a PR:

1. **Title:** Follow the commit message format
2. **Description:** Explain what you did and why
3. **Linked Issues:** Reference related issues with `#123`
4. **Screenshots:** Add UI changes if applicable
5. **Checklist:** Ensure all items are complete:
   - [ ] Code follows style guidelines
   - [ ] Tests added and passing
   - [ ] Documentation updated
   - [ ] No breaking changes (or documented)

### PR Review Feedback

- Address review comments promptly
- If disagreeing, explain your reasoning
- Keep conversation constructive
- Be open to suggestions

---

## 💨 Getting Help

- Read existing issues and discussions
- Check the Troubleshooting section in README.md
- Ask questions in GitHub Discussions
- Contact maintainers via GitHub issues

---

## 📄 License

By contributing to this project, you agree that your contributions will be licensed under the MIT License.

---

## 🙏 Thank You

We appreciate all contributions! Whether it's a small typo fix or a major feature, every contribution makes the project better.
