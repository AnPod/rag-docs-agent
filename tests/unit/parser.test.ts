import { describe, it, expect } from "vitest";
import { extractTextFromFile } from "@/lib/parser";

describe("extractTextFromFile", () => {
  it("should extract text from markdown file", async () => {
    const file = new File(["# Hello\n\nWorld"], "test.md", {
      type: "text/markdown",
    });
    const result = await extractTextFromFile(file);

    expect(result.content).toBe("# Hello\n\nWorld");
    expect(result.metadata.source).toBe("test.md");
  });

  it("should extract text from text file", async () => {
    const file = new File(["plain text content"], "test.txt", {
      type: "text/plain",
    });
    const result = await extractTextFromFile(file);

    expect(result.content).toBe("plain text content");
  });

  it("should reject unsupported file types", async () => {
    const file = new File(["<html></html>"], "test.html", {
      type: "text/html",
    });

    await expect(extractTextFromFile(file)).rejects.toThrow(
      "Unsupported file type"
    );
  });

  it("should count lines correctly", async () => {
    const file = new File(["line1\nline2\nline3"], "test.md", {
      type: "text/markdown",
    });
    const result = await extractTextFromFile(file);

    expect(result.metadata.lineCount).toBe(3);
  });
});
