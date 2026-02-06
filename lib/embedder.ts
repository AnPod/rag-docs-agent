import { getOpenAIClient } from "./openai";

export async function generateEmbedding(text: string): Promise<number[]> {
  if (!text || typeof text !== "string") {
    throw new Error("Text must be a non-empty string");
  }

  if (text.trim() === "") {
    throw new Error("Text cannot be empty or whitespace only");
  }

  try {
    const openai = getOpenAIClient();
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: text,
      encoding_format: "float",
    });

    const embedding = response.data[0]?.embedding;

    if (!embedding || !Array.isArray(embedding)) {
      throw new Error("Invalid embedding response from OpenAI");
    }

    return embedding;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to generate embedding: ${error.message}`);
    }
    throw new Error("Failed to generate embedding: Unknown error");
  }
}

export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  if (!Array.isArray(texts)) {
    throw new Error("Texts must be an array");
  }

  if (texts.length === 0) {
    return [];
  }

  // Validate all texts are non-empty strings
  for (const text of texts) {
    if (!text || typeof text !== "string") {
      throw new Error("All texts must be non-empty strings");
    }
    if (text.trim() === "") {
      throw new Error("Texts cannot be empty or whitespace only");
    }
  }

  try {
    const openai = getOpenAIClient();
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: texts,
      encoding_format: "float",
    });

    const embeddings = response.data.map((item) => item.embedding);

    // Validate we got the right number of embeddings
    if (embeddings.length !== texts.length) {
      throw new Error(
        `Embedding count mismatch: expected ${texts.length}, got ${embeddings.length}`
      );
    }

    return embeddings;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to generate embeddings: ${error.message}`);
    }
    throw new Error("Failed to generate embeddings: Unknown error");
  }
}
