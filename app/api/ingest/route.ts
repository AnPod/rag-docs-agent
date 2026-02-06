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
  const ext = filename.toLowerCase().slice(filename.lastIndexOf("."));
  return ALLOWED_EXTENSIONS.includes(ext);
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!isAllowedFileType(file.name)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid file type. Only .md and .txt files are allowed",
        },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: "File too large. Maximum size is 10MB" },
        { status: 400 }
      );
    }

    // Parse file
    const { content, metadata } = await extractTextFromFile(file);

    // Chunk content
    const chunks = chunkText(content, {
      maxChunkSize: 500,
      overlap: 50,
    });

    // Update source in metadata
    chunks.forEach((chunk) => {
      chunk.metadata.source = metadata.source;
    });

    // Generate embeddings
    const texts = chunks.map((c) => c.content);
    const embeddings = await generateEmbeddings(texts);

    // Store in ChromaDB
    const chroma = new ChromaClient();
    await chroma.storeChunks(chunks, embeddings);

    return NextResponse.json({
      success: true,
      chunkCount: chunks.length,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
