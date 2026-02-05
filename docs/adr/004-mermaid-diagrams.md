# ADR 004: Mermaid for Architecture Diagrams

## Status
Accepted

## Context
README needs architecture diagrams. Options:
- PNG/SVG exports (static, update pain)
- Excalidraw (editable but separate file)
- Mermaid (text-based, renders in GitHub)

## Decision
Use **Mermaid** diagrams embedded in markdown.

## Rationale
| Approach | Pros | Cons |
|----------|------|------|
| Mermaid | Version controlled, GitHub renders natively, simple syntax | Limited styling |
| Draw.io | Visual editing, richer | Separate file, drift from code |
| ASCII | Always works | Hard to read, limited |

## Diagrams Included
1. **System Context** - High-level component view
2. **Sequence Diagram** - Data flow through system
3. **Component Diagram** - Frontend/Backend/Storage split

## Consequences
- Diagrams stay in sync with code changes
- No external dependencies to view
- Recruiters/engineers can see architecture immediately

## Links
- [Mermaid Live Editor](https://mermaid.live/)
- [GitHub Mermaid Support](https://github.blog/2022-02-14-include-diagrams-markdown-files-mermaid/)
