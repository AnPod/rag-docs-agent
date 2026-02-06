import { describe, it, expect, vi, beforeEach } from "vitest";
import { ChromaClient } from "@/lib/chroma";

// Mock ChromaDB
vi.mock("chromadb", () => ({
  ChromaClient: vi.fn().mockImplementation(() => ({
    getOrCreateCollection: vi.fn().mockResolvedValue({
      add: vi.fn().mockResolvedValue(undefined),
      query: vi.fn().mockResolvedValue({
        ids: [["id1", "id2"]],
        documents: [["content1", "content2"]],
        metadatas: [[{ source: "test.md" }, { source: "test.md" }]],
        distances: [[0.1, 0.2]],
      }),
    }),
  })),
}));

describe("ChromaClient", () => {
  let client: ChromaClient;

  beforeEach(() => {
    client = new ChromaClient();
  });

  it("should store chunks with embeddings", async () => {
    const chunks = [
      { id: "1", content: "test", metadata: { source: "test.md" } },
      { id: "2", content: "test2", metadata: { source: "test.md" } },
    ];
    const embeddings = [
      [0.1, 0.2],
      [0.3, 0.4],
    ];

    await expect(client.storeChunks(chunks, embeddings)).resolves.not.toThrow();
  });

  it("should search and return results", async () => {
    const queryEmbedding = [0.1, 0.2, 0.3];
    const results = await client.search(queryEmbedding, 5);

    expect(results).toBeInstanceOf(Array);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0]).toHaveProperty("chunk");
    expect(results[0]).toHaveProperty("score");
  });
});
