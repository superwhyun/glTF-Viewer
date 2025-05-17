import { useState, useCallback } from "react"
import { useFileDrop } from "./use-file-drop"

export function useModelViewerDrag(onFileDrop: (file: File) => void) {
  const [isDragging, setIsDragging] = useState(false)
  const { handleDrop: baseHandleDrop } = useFileDrop()

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    baseHandleDrop(e, onFileDrop)
  }, [baseHandleDrop, onFileDrop])

  return {
    isDragging,
    handleDragOver,
    handleDragLeave,
    handleDrop
  }
}

// %%%%%LAST%%%%%