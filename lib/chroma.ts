import { ChromaClient as OriginalChromaClient } from "chromadb";
import { DocumentChunk, SearchResult } from "@/types";

export class ChromaClient {
  private client: OriginalChromaClient;
  private collection: any;

  constructor() {
    this.client = new OriginalChromaClient({
      path: process.env.CHROMA_URL || "http://localhost:8000",
    });
  }

  private async getCollection() {
    if (!this.collection) {
      this.collection = await this.client.getOrCreateCollection({
        name: process.env.CHROMA_COLLECTION || "documents",
      });
    }
    return this.collection;
  }

  async storeChunks(
    chunks: DocumentChunk[],
    embeddings: number[][]
  ): Promise<void> {
    const collection = await this.getCollection();

    await collection.add({
      ids: chunks.map((c) => c.id),
      documents: chunks.map((c) => c.content),
      metadatas: chunks.map((c) => c.metadata),
      embeddings: embeddings,
    });
  }

  async search(
    queryEmbedding: number[],
    nResults: number = 5
  ): Promise<SearchResult[]> {
    const collection = await this.getCollection();

    const results = await collection.query({
      queryEmbeddings: [queryEmbedding],
      nResults: nResults,
    });

    return results.ids[0].map((id: string, index: number) => ({
      chunk: {
        id,
        content: results.documents[0][index],
        metadata: results.metadatas[0][index],
      },
      score: results.distances[0][index],
    }));
  }
}
