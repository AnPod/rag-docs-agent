# ADR 006: Simple React + Tailwind UI

## Status

Accepted

## Context

Need a clean, functional UI without spending time on design systems.

## Decision

Use **React** with **Tailwind CSS**, no heavy UI library.

## Rationale

| Option        | Pros                                 | Cons                       |
| ------------- | ------------------------------------ | -------------------------- |
| Tailwind only | Fast, no extra deps, shows CSS skill | Must build components      |
| shadcn/ui     | Beautiful, accessible                | More setup, less "my code" |
| MUI/Chakra    | Complete component set               | Heavy, looks generic       |

## Approach

- Custom components: `ChatInterface`, `FileUpload`
- Tailwind for all styling
- Focus on functionality over polish
- Responsive grid layout (3-col desktop, stacked mobile)

## Consequences

- Smaller bundle size
- Shows raw React/TypeScript competence
- Faster iteration
- Less accessible than dedicated UI libraries (acceptable for portfolio)

## Future

Could add shadcn/ui later if needed, or keep minimal for "look at my clean code" factor.
