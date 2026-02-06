import { ChromaClient as OriginalChromaClient } from "chromadb";
import { DocumentChunk, SearchResult } from "@/types";

export class ChromaClient {
  private client: OriginalChromaClient;
  private collection: any = null;

  constructor() {
    const chromaUrl = process.env.CHROMA_URL || "http://localhost:8000";

    if (!chromaUrl || typeof chromaUrl !== "string") {
      throw new Error("CHROMA_URL environment variable must be a valid URL");
    }

    this.client = new OriginalChromaClient({
      path: chromaUrl,
    });
  }

  private async getCollection() {
    if (!this.collection) {
      const collectionName =
        process.env.CHROMA_COLLECTION || "documents";

      if (!collectionName) {
        throw new Error("CHROMA_COLLECTION environment variable is required");
      }

      this.collection = await this.client.getOrCreateCollection({
        name: collectionName,
      });
    }
    return this.collection;
  }

  async storeChunks(
    chunks: DocumentChunk[],
    embeddings: number[][]
  ): Promise<void> {
    // Validate inputs
    if (!Array.isArray(chunks) || chunks.length === 0) {
      throw new Error("chunks must be a non-empty array");
    }

    if (!Array.isArray(embeddings) || embeddings.length === 0) {
      throw new Error("embeddings must be a non-empty array");
    }

    if (chunks.length !== embeddings.length) {
      throw new Error(
        `Mismatch: ${chunks.length} chunks but ${embeddings.length} embeddings`
      );
    }

    // Validate each chunk
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      if (!chunk.id || typeof chunk.id !== "string") {
        throw new Error(`Chunk at index ${i}: invalid or missing id`);
      }
      if (!chunk.content || typeof chunk.content !== "string") {
        throw new Error(`Chunk at index ${i}: invalid or missing content`);
      }
      if (!chunk.metadata || typeof chunk.metadata !== "object") {
        throw new Error(`Chunk at index ${i}: invalid or missing metadata`);
      }

      // Validate each embedding
      const embedding = embeddings[i];
      if (!Array.isArray(embedding)) {
        throw new Error(`Embedding at index ${i}: must be an array`);
      }
      if (embedding.length === 0) {
        throw new Error(`Embedding at index ${i}: cannot be empty`);
      }
    }

    try {
      const collection = await this.getCollection();

      await collection.add({
        ids: chunks.map((c) => c.id),
        documents: chunks.map((c) => c.content),
        metadatas: chunks.map((c) => c.metadata),
        embeddings: embeddings,
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to store chunks in ChromaDB: ${error.message}`);
      }
      throw new Error("Failed to store chunks in ChromaDB");
    }
  }

  async search(
    queryEmbedding: number[],
    nResults: number = 5
  ): Promise<SearchResult[]> {
    // Validate query embedding
    if (!Array.isArray(queryEmbedding) || queryEmbedding.length === 0) {
      throw new Error("queryEmbedding must be a non-empty array");
    }

    // Validate nResults
    if (typeof nResults !== "number" || nResults <= 0) {
      throw new Error("nResults must be a positive number");
    }

    if (nResults > 100) {
      throw new Error("nResults cannot exceed 100");
    }

    try {
      const collection = await this.getCollection();

      const results = await collection.query({
        queryEmbeddings: [queryEmbedding],
        nResults: nResults,
      });

      // Validate response structure
      if (
        !results ||
        !results.ids ||
        !Array.isArray(results.ids) ||
        results.ids.length === 0
      ) {
        throw new Error("Invalid response from ChromaDB: missing ids");
      }

      const ids = results.ids[0];
      const documents = results.documents?.[0];
      const metadatas = results.metadatas?.[0];
      const distances = results.distances?.[0];

      if (
        !Array.isArray(ids) ||
        !Array.isArray(documents) ||
        !Array.isArray(metadatas) ||
        !Array.isArray(distances)
      ) {
        throw new Error("Invalid response format from ChromaDB");
      }

      // Ensure all arrays have the same length
      if (
        ids.length !== documents.length ||
        ids.length !== metadatas.length ||
        ids.length !== distances.length
      ) {
        throw new Error("Inconsistent result arrays from ChromaDB");
      }

      return ids.map((id: string, index: number) => ({
        chunk: {
          id,
          content: documents[index],
          metadata: metadatas[index],
        },
        score: distances[index],
      }));
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to search ChromaDB: ${error.message}`);
      }
      throw new Error("Failed to search ChromaDB");
    }
  }
}
