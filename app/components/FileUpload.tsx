"use client";

import { useState, useCallback, useRef } from "react";

interface UploadError {
  fileName: string;
  message: string;
}

export function FileUpload({
  onUpload,
  onError,
}: {
  onUpload?: () => void;
  onError?: (errors: UploadError[]) => void;
}) {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedCount, setUploadedCount] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);
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
      setErrors([]);
      let successCount = 0;
      const uploadErrors: { fileName: string; message: string }[] = [];

      // Validate files before upload
      const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
      const ALLOWED_EXTENSIONS = [".md", ".txt", ".markdown", ".text"];

      for (const file of files) {
        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
          const error = `${file.name}: File too large (max 10MB)`;
          setErrors((prev) => [...prev, error]);
          uploadErrors.push({ fileName: file.name, message: "File too large" });
          continue;
        }

        // Validate file extension
        const ext = file.name
          .toLowerCase()
          .slice(file.name.lastIndexOf("."));
        if (!ALLOWED_EXTENSIONS.includes(ext)) {
          const error = `${file.name}: Invalid file type (.md/.txt only)`;
          setErrors((prev) => [...prev, error]);
          uploadErrors.push({
            fileName: file.name,
            message: "Invalid file type",
          });
          continue;
        }

        try {
          const formData = new FormData();
          formData.append("file", file);

          const response = await fetch("/api/ingest", {
            method: "POST",
            body: formData,
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error || `HTTP ${response.status}`);
          }

          if (data.success) {
            successCount++;
          } else {
            throw new Error(data.error || "Upload failed");
          }
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Unknown error";
          setErrors((prev) => [...prev, `${file.name}: ${errorMessage}`]);
          uploadErrors.push({
            fileName: file.name,
            message: errorMessage,
          });
        }
      }

      setUploadedCount((prev) => prev + successCount);
      setUploading(false);

      if (uploadErrors.length > 0) {
        onError?.(uploadErrors);
      }

      if (successCount > 0) {
        onUpload?.();
      }

      // Clear errors after 10 seconds
      if (errors.length > 0) {
        setTimeout(() => setErrors([]), 10000);
      }
    },
    [onUpload, onError, errors.length]
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
      // Reset input so same file can be selected again
      e.target.value = "";
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
          accept=".md,.txt,.markdown,.text"
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
          Markdown and text files only (max 10MB)
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

      {errors.length > 0 && !uploading && (
        <div
          className="space-y-1"
          role="alert"
          aria-live="assertive"
        >
          {errors.map((error, idx) => (
            <p key={idx} className="text-red-600 text-sm flex items-center gap-2">
              <svg
                className="h-4 w-4 flex-shrink-0"
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
              <span>{error}</span>
            </p>
          ))}
        </div>
      )}

      {uploadedCount > 0 && !uploading && errors.length === 0 && (
        <p className="text-green-600 text-sm" role="status" aria-live="polite">
          ✓ {uploadedCount} file(s) uploaded successfully
        </p>
      )}
    </div>
  );
}
