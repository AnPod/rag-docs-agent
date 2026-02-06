import OpenAI from "openai";

// Singleton instance for the OpenAI client
let openaiClient: OpenAI | null = null;

export function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      throw new Error("OPENAI_API_KEY environment variable is not set");
    }

    openaiClient = new OpenAI({
      apiKey,
    });
  }

  return openaiClient;
}

// Export a convenience function to reset the client (useful for testing)
export function resetOpenAIClient(): void {
  openaiClient = null;
}
