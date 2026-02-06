"use client";

import { useState, useCallback, useRef } from "react";

export function FileUpload({ onUpload }: { onUpload?: () => void }) {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedCount, setUploadedCount] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const uploadFiles = useCallback(
    async (files: File[]) => {
      setUploading(true);
      let successCount = 0;

      for (const file of files) {
        try {
          const formData = new FormData();
          formData.append("file", file);

          const response = await fetch("/api/ingest", {
            method: "POST",
            body: formData,
          });

          if (response.ok) {
            successCount++;
          }
        } catch (error) {
          console.error("Upload error:", error);
        }
      }

      setUploadedCount((prev) => prev + successCount);
      setUploading(false);
      onUpload?.();
    },
    [onUpload]
  );

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      const files = Array.from(e.dataTransfer.files);
      await uploadFiles(files);
    },
    [uploadFiles]
  );

  const handleChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      await uploadFiles(files);
    },
    [uploadFiles]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      inputRef.current?.click();
    }
  };

  return (
    <div className="space-y-4">
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={0}
        aria-label="Drop files here or press Enter to select files"
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".md,.txt"
          onChange={handleChange}
          className="hidden"
          id="file-upload"
          aria-label="File upload input"
        />
        <label
          htmlFor="file-upload"
          className="cursor-pointer text-blue-500 hover:text-blue-600"
        >
          Click to upload
        </label>
        <span className="text-gray-500"> or drag and drop</span>
        <p className="text-sm text-gray-400 mt-2">
          Markdown and text files only
        </p>
      </div>

      {/* Keyboard accessible upload button */}
      <button
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        aria-label="Select files to upload"
        className="w-full py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
      >
        Select Files
      </button>

      {uploading && (
        <div
          className="flex items-center gap-2 text-blue-500 text-sm"
          role="status"
          aria-live="polite"
        >
          <svg
            className="animate-spin h-4 w-4"
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
          <span>Uploading...</span>
        </div>
      )}

      {uploadedCount > 0 && !uploading && (
        <p className="text-green-600 text-sm" role="status">
          ✓ {uploadedCount} file(s) uploaded successfully
        </p>
      )}
    </div>
  );
}
