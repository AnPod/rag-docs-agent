import { expect, afterEach, beforeAll, afterAll } from "vitest";
import { cleanup } from "@testing-library/react";
import { server } from "./mocks/server";

// Extend matchers
import "@testing-library/jest-dom";

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// MSW setup
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// Polyfill File.text() for jsdom environment
beforeAll(() => {
  if (!File.prototype.text) {
    File.prototype.text = async function (this: File) {
      // We need to read the file content
      // In tests with File objects created from strings, this won't work directly
      // So we'll use a workaround for testing
      const reader = new FileReader();
      return new Promise((resolve) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => resolve("");
        reader.readAsText(this);
      });
    };
  }
});
