import { NextResponse } from "next/server";
import OpenAI from "openai";
import { generateEmbedding, ChromaClient } from "@/lib";
import { ChatMessage } from "@/types";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { messages }: { messages: ChatMessage[] } = await request.json();
    const lastMessage = messages[messages.length - 1];

    if (!lastMessage || lastMessage.role !== "user") {
      return NextResponse.json(
        { error: "Invalid message format" },
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
${context}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages.map((m) => ({ role: m.role, content: m.content })),
      ],
      stream: false,
    });

    const response = completion.choices[0].message.content;
    const sources = results.map((r) => r.chunk);

    return NextResponse.json({
      response,
      sources,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
