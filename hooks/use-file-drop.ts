import { useState, useCallback } from "react"

interface UseFileDropResult {
  isDragging: boolean
  error: string | null
  handleDragOver: (e: React.DragEvent) => void
  handleDragLeave: (e: React.DragEvent) => void
  handleDrop: (e: React.DragEvent, onFileDrop: (file: File) => void) => void
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>, onFileDrop: (file: File) => void) => void
  setError: (error: string | null) => void
}

export function useFileDrop(): UseFileDropResult {
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const validateGltfFile = (file: File): boolean => {
    return (
      file.name.endsWith(".gltf") ||
      file.name.endsWith(".glb") ||
      file.type === "model/gltf-binary" ||
      file.type === "model/gltf+json"
    )
  }

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent, onFileDrop: (file: File) => void) => {
    e.preventDefault()
    setIsDragging(false)
    setError(null)

    if (e.dataTransfer.files?.length > 0) {
      const file = e.dataTransfer.files[0]
      if (validateGltfFile(file)) {
        onFileDrop(file)
      } else {
        setError("Please drop a GLTF or GLB file")
      }
    }
  }, [])

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>, onFileDrop: (file: File) => void) => {
    setError(null)
    if (e.target.files?.length > 0) {
      const file = e.target.files[0]
      if (validateGltfFile(file)) {
        onFileDrop(file)
      } else {
        setError("Please select a GLTF or GLB file")
      }
    }
  }, [])

  return {
    isDragging,
    error,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleFileChange,
    setError
  }
}

// %%%%%LAST%%%%%