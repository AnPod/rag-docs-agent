import { DocumentChunk } from "@/types";

interface ParseResult {
  content: string;
  metadata: {
    source: string;
    lineCount: number;
    [key: string]: unknown;
  };
}

const SUPPORTED_TYPES = ["text/markdown", "text/plain", "text/x-markdown"];

export async function extractTextFromFile(file: File): Promise<ParseResult> {
  if (!SUPPORTED_TYPES.includes(file.type)) {
    throw new Error(`Unsupported file type: ${file.type}`);
  }

  const content = await file.text();
  const lines = content.split("\n");

  return {
    content,
    metadata: {
      source: file.name,
      lineCount: lines.length,
    },
  };
}
