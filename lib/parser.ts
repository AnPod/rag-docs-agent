import { DocumentChunk } from "@/types";

interface ParseResult {
  content: string;
  metadata: {
    source: string;
    lineCount: number;
    [key: string]: unknown;
  };
}

const SUPPORTED_MIME_TYPES = ["text/markdown", "text/plain", "text/x-markdown"];
const ALLOWED_EXTENSIONS = [".md", ".txt", ".markdown", ".text"];

function isAllowedFileName(filename: string): boolean {
  if (!filename || typeof filename !== "string") {
    return false;
  }
  const ext = filename.toLowerCase().slice(filename.lastIndexOf("."));
  return ALLOWED_EXTENSIONS.includes(ext);
}

export async function extractTextFromFile(file: File): Promise<ParseResult> {
  // Validate file object
  if (!file || !(file instanceof File)) {
    throw new Error("Invalid file object provided");
  }

  // Validate filename is not empty
  if (!file.name || file.name.trim() === "") {
    throw new Error("File name cannot be empty");
  }

  // Validate filename has allowed extension
  if (!isAllowedFileName(file.name)) {
    throw new Error(
      `Unsupported file extension. Allowed: ${ALLOWED_EXTENSIONS.join(", ")}`
    );
  }

  // Validate MIME type (note: this is a secondary check since MIME types can be unreliable)
  if (file.type && !SUPPORTED_MIME_TYPES.includes(file.type)) {
    throw new Error(`Unsupported file type: ${file.type}`);
  }

  const content = await file.text();

  // Validate content is not empty after extraction
  if (!content || content.trim() === "") {
    return {
      content: "",
      metadata: {
        source: file.name,
        lineCount: 0,
      },
    };
  }

  const lines = content.split("\n");

  return {
    content,
    metadata: {
      source: file.name,
      lineCount: lines.length,
    },
  };
}
