import { DocumentChunk } from "@/types";

interface ChunkOptions {
  maxChunkSize: number;
  overlap: number;
}

interface ValidatedChunkOptions {
  maxChunkSize: number;
  overlap: number;
}

function validateChunkOptions(options: ChunkOptions): ValidatedChunkOptions {
  const { maxChunkSize, overlap } = options;

  if (typeof maxChunkSize !== "number" || maxChunkSize <= 0) {
    throw new Error("maxChunkSize must be a positive number");
  }

  if (typeof overlap !== "number" || overlap < 0) {
    throw new Error("overlap must be a non-negative number");
  }

  if (overlap >= maxChunkSize) {
    throw new Error("overlap must be less than maxChunkSize");
  }

  return { maxChunkSize, overlap };
}

export function chunkText(
  text: string,
  options: ChunkOptions
): DocumentChunk[] {
  // Validate input
  if (typeof text !== "string") {
    throw new Error("text must be a string");
  }

  if (!text.trim()) {
    return [];
  }

  const { maxChunkSize, overlap } = validateChunkOptions(options);
  const chunks: DocumentChunk[] = [];
  const lines = text.split("\n");

  let currentChunk = "";
  let startLine = 1;
  let currentLine = 1;

  for (const line of lines) {
    const lineWithNewline = line + "\n";

    if (
      currentChunk.length + lineWithNewline.length > maxChunkSize &&
      currentChunk.length > 0
    ) {
      // Store current chunk
      chunks.push({
        id: `chunk-${chunks.length}`,
        content: currentChunk.trim(),
        metadata: {
          source: "unknown",
          startLine,
          endLine: currentLine - 1,
        },
      });

      // Handle overlap - ensure we don't get negative line numbers
      if (overlap > 0) {
        const words = currentChunk.split(" ");
        const overlapWordCount = Math.min(
          Math.ceil(overlap / 5),
          words.length - 1
        );
        const overlapWords = words.slice(-overlapWordCount);
        currentChunk = overlapWords.join(" ") + " ";

        // Calculate new start line, ensuring it's at least 1
        const overlappingLines = overlapWords.length;
        startLine = Math.max(1, currentLine - overlappingLines);
      } else {
        currentChunk = "";
        startLine = currentLine;
      }
    }

    currentChunk += lineWithNewline;
    currentLine++;
  }

  // Push final chunk if there's content
  if (currentChunk.trim()) {
    chunks.push({
      id: `chunk-${chunks.length}`,
      content: currentChunk.trim(),
      metadata: {
        source: "unknown",
        startLine,
        endLine: currentLine - 1,
      },
    });
  }

  return chunks;
}
