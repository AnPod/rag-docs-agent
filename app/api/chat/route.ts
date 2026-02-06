import { NextResponse } from "next/server";
import { getOpenAIClient, generateEmbedding } from "@/lib";
import { ChromaClient } from "@/lib";
import { ChatMessage } from "@/types";

export async function POST(request: Request) {
  try {
    const { messages }: { messages: ChatMessage[] } = await request.json();

    // Validate input
    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Invalid message format: messages must be a non-empty array" },
        { status: 400 }
      );
    }

    const lastMessage = messages[messages.length - 1];

    if (!lastMessage || lastMessage.role !== "user") {
      return NextResponse.json(
        { error: "Last message must be from user" },
        { status: 400 }
      );
    }

    if (!lastMessage.content || typeof lastMessage.content !== "string") {
      return NextResponse.json(
        { error: "User message content is missing or invalid" },
        { status: 400 }
      );
    }

    if (lastMessage.content.trim() === "") {
      return NextResponse.json(
        { error: "User message cannot be empty" },
        { status: 400 }
      );
    }

    // Search for relevant context
    const queryEmbedding = await generateEmbedding(lastMessage.content);
    const chroma = new ChromaClient();
    const results = await chroma.search(queryEmbedding, 5);

    // Build context from search results
    const context = results
      .map((r) => `Source: ${r.chunk.metadata.source}\n${r.chunk.content}`)
      .join("\n\n---\n\n");

    // Generate response with context
    const systemPrompt = `You are a helpful assistant that answers questions based on the provided documentation.
Use the following context to answer the user's question. If the context doesn't contain the answer, say so.

Context:
${context || "No context available."}`;

    try {
      const openai = getOpenAIClient();
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages.map((m) => ({ role: m.role, content: m.content })),
        ],
        stream: false,
      });

      const response = completion.choices[0]?.message?.content;

      if (!response || typeof response !== "string") {
        throw new Error("Invalid response from OpenAI");
      }

      const sources = results.map((r) => r.chunk);

      return NextResponse.json({
        response,
        sources,
      });
    } catch (openaiError) {
      console.error("OpenAI API error:", openaiError);

      if (openaiError instanceof Error) {
        // Handle specific OpenAI API errors
        if (
          openaiError.message.includes("API key") ||
          openaiError.message.includes("authentication")
        ) {
          return NextResponse.json(
            {
              error: "Authentication error with OpenAI API. Please check API key.",
            },
            { status: 401 }
          );
        }

        if (
          openaiError.message.includes("rate limit") ||
          openaiError.message.includes("quota")
        ) {
          return NextResponse.json(
            {
              error: "Rate limit exceeded. Please try again later.",
            },
            { status: 429 }
          );
        }

        if (openaiError.message.includes("timeout")) {
          return NextResponse.json(
            { error: "Request timed out. Please try again." },
            { status: 504 }
          );
        }

        return NextResponse.json(
          { error: `OpenAI API error: ${openaiError.message}` },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { error: "Failed to get response from OpenAI" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Chat route error:", error);

    if (error instanceof Error) {
      // Handle specific error types
      if (
        error.message.includes("OPENAI_API_KEY") ||
        error.message.includes("environment variable")
      ) {
        return NextResponse.json(
          { error: "Server configuration error: OpenAI API key not set" },
          { status: 500 }
        );
      }

      if (error.message.includes("Failed to generate embedding")) {
        return NextResponse.json(
          { error: "Failed to process query. Please try again." },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { error: error.message || "Unknown error occurred" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
