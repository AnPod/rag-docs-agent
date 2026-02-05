'use client'

import { useState, useCallback } from 'react'

export function FileUpload({ onUpload }: { onUpload?: () => void }) {
  const [dragActive, setDragActive] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadedCount, setUploadedCount] = useState(0)

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const files = Array.from(e.dataTransfer.files)
    await uploadFiles(files)
  }, [])

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    await uploadFiles(files)
  }

  const uploadFiles = async (files: File[]) => {
    setUploading(true)
    let successCount = 0

    for (const file of files) {
      try {
        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch('/api/ingest', {
          method: 'POST',
          body: formData
        })

        if (response.ok) {
          successCount++
        }
      } catch (error) {
        console.error('Upload error:', error)
      }
    }

    setUploadedCount(prev => prev + successCount)
    setUploading(false)
    onUpload?.()
  }

  return (
    <div className="space-y-4">
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
        }`}
      >
        <input
          type="file"
          multiple
          accept=".md,.txt"
          onChange={handleChange}
          className="hidden"
          id="file-upload"
        />
        <label
          htmlFor="file-upload"
          className="cursor-pointer text-blue-500 hover:text-blue-600"
        >
          Click to upload
        </label>
        <span className="text-gray-500"> or drag and drop</span>
        <p className="text-sm text-gray-400 mt-2">Markdown and text files only</p>
      </div>

      {uploading && (
        <p className="text-blue-500 text-sm">Uploading...</p>
      )}

      {uploadedCount > 0 && (
        <p className="text-green-600 text-sm">
          ✓ {uploadedCount} file(s) uploaded successfully
        </p>
      )}
    </div>
  )
}
