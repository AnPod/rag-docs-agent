import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/chat/route";

// Mock OpenAI at module level BEFORE any imports
vi.mock("openai", () => {
  const mockChatCompletions = {
    create: vi.fn().mockResolvedValue({
      choices: [
        {
          index: 0,
          message: {
            role: "assistant",
            content: "This is a test response from the assistant.",
          },
          finish_reason: "stop",
        },
      ],
    }),
  };
  return {
    default: vi.fn().mockImplementation(() => ({
      chat: {
        completions: mockChatCompletions,
      },
    })),
  };
});

// Mock the lib functions at module level
const mockSearch = vi.fn();
const mockOpenAIClient = {
  chat: {
    completions: {
      create: vi.fn().mockResolvedValue({
        choices: [
          {
            index: 0,
            message: {
              role: "assistant",
              content: "This is a test response from the assistant.",
            },
            finish_reason: "stop",
          },
        ],
      }),
    },
  },
};

vi.mock("@/lib", () => ({
  generateEmbedding: vi.fn(),
  ChromaClient: vi.fn().mockImplementation(() => ({
    search: mockSearch,
  })),
  getOpenAIClient: vi.fn(() => mockOpenAIClient),
}));

describe("POST /api/chat", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearch.mockReset();
  });

  it("should return 200 for valid request", async () => {
    const mockSearchResults = [
      {
        chunk: {
          id: "chunk-1",
          content: "Test content 1",
          metadata: { source: "test.md", startLine: 1, endLine: 5 },
        },
        score: 0.1,
      },
      {
        chunk: {
          id: "chunk-2",
          content: "Test content 2",
          metadata: { source: "test.md", startLine: 6, endLine: 10 },
        },
        score: 0.2,
      },
    ];

    const { generateEmbedding } = await import("@/lib");
    vi.mocked(generateEmbedding).mockResolvedValue(Array(1536).fill(0));
    mockSearch.mockResolvedValue(mockSearchResults);

    const request = {
      json: vi.fn().mockResolvedValue({
        messages: [{ role: "user", content: "What is this about?" }],
      }),
    } as unknown as Request;

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.response).toBe("This is a test response from the assistant.");
    expect(data.sources).toEqual([
      mockSearchResults[0].chunk,
      mockSearchResults[1].chunk,
    ]);
  });

  it("should return 400 for invalid message format", async () => {
    const request = {
      json: vi.fn().mockResolvedValue({
        messages: [{ role: "assistant", content: "Hello" }],
      }),
    } as unknown as Request;

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Last message must be from user");
  });

  it("should return 400 for empty messages", async () => {
    const request = {
      json: vi.fn().mockResolvedValue({
        messages: [],
      }),
    } as unknown as Request;

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe(
      "Invalid message format: messages must be a non-empty array"
    );
  });

  it("should return 500 on error", async () => {
    const { generateEmbedding } = await import("@/lib");
    vi.mocked(generateEmbedding).mockRejectedValue(new Error("API Error"));

    const request = {
      json: vi.fn().mockResolvedValue({
        messages: [{ role: "user", content: "What is this about?" }],
      }),
    } as unknown as Request;

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("API Error");
  });

  it("should handle multiple messages in conversation", async () => {
    const mockSearchResults = [
      {
        chunk: {
          id: "chunk-1",
          content: "Test content",
          metadata: { source: "test.md" },
        },
        score: 0.1,
      },
    ];

    const { generateEmbedding } = await import("@/lib");
    vi.mocked(generateEmbedding).mockResolvedValue(Array(1536).fill(0));
    mockSearch.mockResolvedValue(mockSearchResults);

    const request = {
      json: vi.fn().mockResolvedValue({
        messages: [
          { role: "user", content: "What is this?" },
          { role: "assistant", content: "It is a test." },
          { role: "user", content: "Tell me more." },
        ],
      }),
    } as unknown as Request;

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.response).toBeDefined();
    expect(data.sources).toHaveLength(1);
  });

  it("should handle empty search results gracefully", async () => {
    const { generateEmbedding } = await import("@/lib");
    vi.mocked(generateEmbedding).mockResolvedValue(Array(1536).fill(0));
    mockSearch.mockResolvedValue([]);

    const request = {
      json: vi.fn().mockResolvedValue({
        messages: [{ role: "user", content: "What is this about?" }],
      }),
    } as unknown as Request;

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.response).toBeDefined();
    expect(data.sources).toEqual([]);
  });
});
