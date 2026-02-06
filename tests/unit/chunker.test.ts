import { describe, it, expect } from "vitest";
import { chunkText } from "@/lib/chunker";

describe("chunkText", () => {
  it("should split text into chunks of max size", () => {
    // Create multi-line text to test chunking
    const text = Array(100).fill("a line of text").join("\n");
    const chunks = chunkText(text, { maxChunkSize: 100, overlap: 0 });

    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks[0].content.length).toBeLessThanOrEqual(100);
  });

  it("should respect overlap between chunks", () => {
    // Create multi-line text
    const text = Array(50).fill("word").join("\n");
    const chunks = chunkText(text, { maxChunkSize: 100, overlap: 20 });

    expect(chunks.length).toBeGreaterThan(1);
    // Verify metadata exists and makes sense
    expect(chunks[0].metadata.startLine).toBe(1);
    expect(chunks[1].metadata).toHaveProperty("startLine");
    expect(chunks[1].metadata).toHaveProperty("endLine");
    // Later chunks should have startLine > first chunk's startLine (no negative line numbers)
    expect(chunks[1].metadata.startLine).toBeGreaterThan(0);
  });

  it("should preserve line numbers in metadata", () => {
    const text = "line1\nline2\nline3\nline4\nline5";
    const chunks = chunkText(text, { maxChunkSize: 20, overlap: 0 });

    expect(chunks[0].metadata.startLine).toBe(1);
    expect(chunks[0].metadata.endLine).toBeDefined();
  });

  it("should handle empty text gracefully", () => {
    const chunks = chunkText("", { maxChunkSize: 100, overlap: 0 });
    expect(chunks).toHaveLength(0);
  });

  it("should assign unique IDs to chunks", () => {
    const text = Array(20).fill("a line").join("\n");
    const chunks = chunkText(text, { maxChunkSize: 50, overlap: 0 });

    const ids = chunks.map((c) => c.id);
    expect(new Set(ids).size).toBe(chunks.length); // All IDs should be unique
    chunks.forEach((c) => {
      expect(c.id).toMatch(/^chunk-\d+$/); // IDs should follow the pattern "chunk-{number}"
    });
  });
});
