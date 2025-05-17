import { FileIcon, UploadIcon } from "lucide-react"
import { useFileDrop } from "@/hooks/use-file-drop"

interface DropZoneContentProps {
  isDragging: boolean
  error: string | null
  onFileDrop: (file: File) => void
}

export function DropZoneContent({ isDragging, error, onFileDrop }: DropZoneContentProps) {
  const { handleFileChange } = useFileDrop()

  return (
    <div className="flex flex-col items-center text-center">
      {isDragging ? (
        <UploadIcon className="w-12 h-12 text-blue-500 mb-4" />
      ) : (
        <FileIcon className="w-12 h-12 text-gray-400 dark:text-gray-500 mb-4" />
      )}
      
      <h3 className="text-lg font-medium mb-2">
        {isDragging ? "Drop your 3D model here" : "Drag & Drop your 3D model"}
      </h3>
      
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        Supports GLTF and GLB file formats
      </p>

      {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

      <div className="flex items-center">
        <span className="text-sm text-gray-500 dark:text-gray-400 mr-2">or</span>
        <label className="cursor-pointer text-sm text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300">
          browse files
          <input
            type="file"
            className="hidden"
            accept=".gltf,.glb,model/gltf-binary,model/gltf+json"
            onChange={(e) => handleFileChange(e, onFileDrop)}
          />
        </label>
      </div>
    </div>
  )
}

// %%%%%LAST%%%%%