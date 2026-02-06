"use client";

import { useState, useRef } from "react";
import { ChatMessage } from "@/types";

interface ErrorMessage {
  message: string;
  details?: string;
  retryable: boolean;
}

export function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ErrorMessage | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const failedRequestRef = useRef<{ messages: ChatMessage[]; input: string } | null>(
    null
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const retryLastRequest = async () => {
    if (!failedRequestRef.current) return;

    const { messages: pendingMessages, input: pendingInput } =
      failedRequestRef.current;

    // Clear the error
    setError(null);

    // Reset input
    setInput(pendingInput);

    // Retry sending
    await sendMessageInternal(pendingMessages, pendingInput);
  };

  const sendMessageInternal = async (
    currentMessages: ChatMessage[],
    currentInput: string
  ) => {
    const userMessage: ChatMessage = {
      role: "user",
      content: currentInput,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput(currentInput);
    setInput("");
    setLoading(true);
    setError(null);

    // Store for retry
    failedRequestRef.current = { messages: currentMessages, input: currentInput };

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...currentMessages, userMessage] }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to get response");
      }

      if (!data.response || typeof data.response !== "string") {
        throw new Error("Invalid response format from server");
      }

      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: data.response,
        sources: data.sources,
      };

      setMessages((prev) => [...prev, assistantMessage]);
      failedRequestRef.current = null;
    } catch (err) {
      // Remove the user message that was added
      setMessages((prev) => prev.slice(0, -1));

      // Restore input
      setInput(currentInput);

      // Set error state
      const isNetworkError =
        err instanceof Error && err.message.toLowerCase().includes("fetch");

      const errorMessage: ErrorMessage = {
        message:
          err instanceof Error
            ? err.message
            : "Failed to send message. Please try again.",
        details:
          err instanceof Error
            ? err.message
            : "Unknown error occurred",
        retryable: true,
      };

      setError(errorMessage);
    } finally {
      setLoading(false);
      setTimeout(scrollToBottom, 100);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    await sendMessageInternal(messages, input);
  };

  return (
    <div className="flex flex-col h-[600px] border rounded-lg">
      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto p-4 space-y-4"
        role="log"
        aria-live="polite"
        aria-label="Chat messages"
      >
        {messages.length === 0 && (
          <p
            className="text-gray-500 text-center"
            role="status"
          >
            Upload documents and ask questions about them!
          </p>
        )}

        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`p-3 rounded-lg ${
              msg.role === "user" ? "bg-blue-100 ml-12" : "bg-gray-100 mr-12"
            }`}
          >
            <p className="text-sm font-semibold mb-1">
              {msg.role === "user" ? "You" : "Assistant"}
            </p>
            <p className="whitespace-pre-wrap">{msg.content}</p>

            {msg.sources && msg.sources.length > 0 && (
              <div className="mt-2 pt-2 border-t text-xs text-gray-600">
                <p className="font-semibold">Sources:</p>
                {msg.sources.map((s, i) => (
                  <span
                    key={i}
                    className="inline-block bg-gray-200 px-2 py-1 rounded mr-1 mt-1"
                  >
                    {s.metadata.source}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div
            className="bg-gray-100 mr-12 p-3 rounded-lg"
            role="status"
            aria-live="polite"
          >
            <div className="flex items-center gap-2">
              <svg
                className="animate-spin h-4 w-4 text-gray-500"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span className="text-sm text-gray-500">Thinking...</span>
            </div>
          </div>
        )}

        {error && (
          <div
            className="bg-red-50 border border-red-200 rounded-lg p-3 mx-12"
            role="alert"
            aria-live="assertive"
          >
            <div className="flex items-start gap-2">
              <svg
                className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800">
                  {error.message}
                </p>
                {error.details && error.details !== error.message && (
                  <p className="text-sm text-red-700 mt-1">{error.details}</p>
                )}
                {error.retryable && (
                  <button
                    onClick={retryLastRequest}
                    className="mt-2 text-sm text-blue-600 hover:text-blue-700 underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                  >
                    Click to retry
                  </button>
                )}
                <button
                  onClick={() => setError(null)}
                  className="mt-2 ml-3 text-sm text-red-600 hover:text-red-700 underline focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t p-4 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
          placeholder="Ask a question..."
          aria-label="Message input"
          disabled={loading}
          className="flex-1 border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        />
        <button
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          aria-label="Send message"
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-300 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed"
        >
          Send
        </button>
      </div>
    </div>
  );
}
