"use client"

import { useFileDrop } from "@/hooks/use-file-drop"
import { DropZoneContent } from "./file-drop/drop-zone-content"

interface FileDropZoneProps {
  onFileDrop: (file: File) => void
}

export default function FileDropZone({ onFileDrop }: FileDropZoneProps) {
  const { isDragging, error, handleDragOver, handleDragLeave, handleDrop } = useFileDrop()

  return (
    <div
      className={`w-full max-w-2xl h-64 border-2 border-dashed rounded-lg flex items-center justify-center p-6 transition ${
        isDragging ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : "border-gray-300 dark:border-gray-700"
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={(e) => handleDrop(e, onFileDrop)}
    >
      <DropZoneContent isDragging={isDragging} error={error} onFileDrop={onFileDrop} />
    </div>
  )
}

// %%%%%LAST%%%%%