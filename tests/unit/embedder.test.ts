import { describe, it, expect, vi, beforeEach } from "vitest";
import { generateEmbedding, generateEmbeddings } from "@/lib/embedder";

// Mock OpenAI at the top level before any imports
vi.mock("openai", () => ({
  default: vi.fn().mockImplementation(() => ({
    embeddings: {
      create: vi.fn().mockImplementation(({ input }) => {
        const isSingle = typeof input === "string";
        const responses = isSingle
          ? [
              {
                embedding: Array(1536)
                  .fill(0)
                  .map(() => Math.random()),
                index: 0,
                object: "embedding",
              },
            ]
          : (input as string[]).map((_, i) => ({
              embedding: Array(1536)
                .fill(0)
                .map(() => Math.random()),
              index: i,
              object: "embedding",
            }));
        return {
          data: responses,
          model: "text-embedding-3-small",
          object: "list",
          usage: {
            prompt_tokens: isSingle ? 10 : input.length * 10,
            total_tokens: isSingle ? 10 : input.length * 10,
          },
        };
      }),
    },
  })),
}));

describe("generateEmbedding", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return embedding array for text", async () => {
    const result = await generateEmbedding("test text");

    expect(result).toBeInstanceOf(Array);
    expect(result.length).toBe(1536);
    expect(typeof result[0]).toBe("number");
  });

  it("should handle empty string", async () => {
    const result = await generateEmbedding("");

    expect(result).toBeInstanceOf(Array);
    expect(result.length).toBe(1536);
  });

  it("should handle long text", async () => {
    const longText = "word ".repeat(10000);
    const result = await generateEmbedding(longText);

    expect(result).toBeInstanceOf(Array);
    expect(result.length).toBe(1536);
  });
});

describe("generateEmbeddings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return embeddings array for multiple texts", async () => {
    const texts = ["test text 1", "test text 2", "test text 3"];
    const result = await generateEmbeddings(texts);

    expect(result).toBeInstanceOf(Array);
    expect(result.length).toBe(3);
    result.forEach((embedding) => {
      expect(embedding).toBeInstanceOf(Array);
      expect(embedding.length).toBe(1536);
      expect(typeof embedding[0]).toBe("number");
    });
  });

  it("should handle empty array", async () => {
    const result = await generateEmbeddings([]);

    expect(result).toBeInstanceOf(Array);
    expect(result.length).toBe(0);
  });

  it("should handle single element array", async () => {
    const texts = ["test text"];
    const result = await generateEmbeddings(texts);

    expect(result).toBeInstanceOf(Array);
    expect(result.length).toBe(1);
    expect(result[0].length).toBe(1536);
  });

  it("should handle texts with different lengths", async () => {
    const texts = ["a", "a longer text", "the longest text with many words"];
    const result = await generateEmbeddings(texts);

    expect(result).toBeInstanceOf(Array);
    expect(result.length).toBe(3);
    result.forEach((embedding) => {
      expect(embedding).toBeInstanceOf(Array);
      expect(embedding.length).toBe(1536);
    });
  });
});
