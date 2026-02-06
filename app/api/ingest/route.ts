import { NextResponse } from "next/server";
import {
  extractTextFromFile,
  chunkText,
  generateEmbeddings,
  ChromaClient,
} from "@/lib";

const ALLOWED_EXTENSIONS = [".md", ".txt", ".markdown", ".text"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

function isAllowedFileType(filename: string): boolean {
  if (!filename || typeof filename !== "string") {
    return false;
  }
  const ext = filename.toLowerCase().slice(filename.lastIndexOf("."));
  return ALLOWED_EXTENSIONS.includes(ext);
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    // Validate file exists and is a File object
    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { success: false, error: "No valid file provided" },
        { status: 400 }
      );
    }

    // Validate filename
    if (!file.name || file.name.trim() === "") {
      return NextResponse.json(
        { success: false, error: "File name cannot be empty" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!isAllowedFileType(file.name)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid file type. Allowed: ${ALLOWED_EXTENSIONS.join(
            ", "
          )}`,
        },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          error: `File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
        },
        { status: 400 }
      );
    }

    // Parse file
    const { content, metadata } = await extractTextFromFile(file);

    // Handle empty content gracefully
    if (!content || content.trim() === "") {
      return NextResponse.json({
        success: true,
        chunkCount: 0,
        message: "File was empty, no chunks created",
      });
    }

    // Chunk content
    const chunks = chunkText(content, {
      maxChunkSize: 500,
      overlap: 50,
    });

    // Validate chunks were created
    if (chunks.length === 0) {
      throw new Error("Failed to create chunks from content");
    }

    // Update source in metadata
    chunks.forEach((chunk) => {
      chunk.metadata.source = metadata.source;
    });

    // Generate embeddings
    const texts = chunks.map((c) => c.content);
    const embeddings = await generateEmbeddings(texts);

    // Validate embeddings
    if (!embeddings || embeddings.length !== chunks.length) {
      throw new Error("Failed to generate embeddings for all chunks");
    }

    // Store in ChromaDB
    const chroma = new ChromaClient();
    await chroma.storeChunks(chunks, embeddings);

    return NextResponse.json({
      success: true,
      chunkCount: chunks.length,
    });
  } catch (error) {
    console.error("Ingest error:", error);

    // Handle specific error types
    if (error instanceof Error) {
      // Parse error (invalid file)
      if (
        error.message.includes("Unsupported file") ||
        error.message.includes("Invalid file")
      ) {
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 400 }
        );
      }

      // Chunker error (invalid parameters)
      if (
        error.message.includes("maxChunkSize") ||
        error.message.includes("overlap")
      ) {
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 400 }
        );
      }

      // Network/API errors
      if (error.message.includes("fetch") || error.message.includes("network")) {
        return NextResponse.json(
          { success: false, error: "Network error, please try again" },
          { status: 503 }
        );
      }

      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Unknown error occurred" },
      { status: 500 }
    );
  }
}
