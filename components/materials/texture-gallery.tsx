import { useState } from "react"
import { Image, Download, ZoomIn, Info } from "lucide-react"
import { TextureInfo } from "@/lib/material-utils"

interface TextureGalleryProps {
  textures: TextureInfo[]
  texturesByType: { [key: string]: TextureInfo[] }
  selectedTexture: string | null
  onTextureSelect: (textureName: string) => void
}

export function TextureGallery({ textures, texturesByType, selectedTexture, onTextureSelect }: TextureGalleryProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [imageModal, setImageModal] = useState<TextureInfo | null>(null)

  const filteredTextures = selectedType === 'all' 
    ? textures 
    : texturesByType[selectedType] || []

  const downloadTexture = (texture: TextureInfo) => {
    if (texture.dataUrl) {
      const link = document.createElement('a')
      link.href = texture.dataUrl
      link.download = `${texture.name}.png`
      link.click()
    }
  }

  const formatFileSize = (width?: number, height?: number): string => {
    if (!width || !height) return 'Unknown'
    return `${width} × ${height}`
  }

  if (textures.length === 0) {
    return (
      <div className="p-4 border rounded-lg bg-card">
        <h3 className="text-lg font-semibold mb-3">Texture Gallery</h3>
        <p className="text-muted-foreground text-sm">No textures found in this model</p>
      </div>
    )
  }

  return (
    <div className="p-4 border rounded-lg bg-card">
      <h3 className="text-lg font-semibold mb-3">Texture Gallery ({textures.length})</h3>
      
      {/* Controls */}
      <div className="flex items-center justify-between mb-4">
        {/* Type Filter */}
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="px-3 py-1 border rounded bg-background text-sm"
        >
          <option value="all">All Types</option>
          {Object.keys(texturesByType).map(type => (
            <option key={type} value={type}>
              {type.charAt(0).toUpperCase() + type.slice(1)} ({texturesByType[type].length})
            </option>
          ))}
        </select>

        {/* View Mode */}
        <div className="flex border rounded overflow-hidden">
          <button
            onClick={() => setViewMode('grid')}
            className={`px-3 py-1 text-sm ${viewMode === 'grid' ? 'bg-accent' : 'hover:bg-accent'}`}
          >
            Grid
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1 text-sm ${viewMode === 'list' ? 'bg-accent' : 'hover:bg-accent'}`}
          >
            List
          </button>
        </div>
      </div>

      {/* Gallery */}
      <div className={`${
        viewMode === 'grid' 
          ? 'grid grid-cols-2 gap-4 max-h-80 overflow-y-auto'
          : 'space-y-2 max-h-80 overflow-y-auto'
      }`}>
        {filteredTextures.map((texture) => (
          <div
            key={texture.name}
            className={`border rounded p-2 cursor-pointer transition-colors ${
              selectedTexture === texture.name ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-accent'
            }`}
            onClick={() => onTextureSelect(texture.name)}
          >
            {viewMode === 'grid' ? (
              // Grid View
              <div className="space-y-2">
                <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded overflow-hidden">
                  {texture.dataUrl ? (
                    <img
                      src={texture.dataUrl}
                      alt={texture.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Image className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium truncate" title={texture.name}>
                    {texture.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {texture.mapTypeLabel}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(texture.width, texture.height)}
                  </p>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setImageModal(texture)
                    }}
                    className="p-1 hover:bg-background rounded"
                    title="View full size"
                  >
                    <ZoomIn className="w-3 h-3" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      downloadTexture(texture)
                    }}
                    className="p-1 hover:bg-background rounded"
                    title="Download texture"
                  >
                    <Download className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ) : (
              // List View
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded overflow-hidden flex-shrink-0">
                  {texture.dataUrl ? (
                    <img
                      src={texture.dataUrl}
                      alt={texture.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Image className="w-4 h-4 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{texture.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {texture.mapTypeLabel} • {formatFileSize(texture.width, texture.height)}
                  </p>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setImageModal(texture)
                    }}
                    className="p-1 hover:bg-background rounded"
                    title="View full size"
                  >
                    <ZoomIn className="w-3 h-3" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      downloadTexture(texture)
                    }}
                    className="p-1 hover:bg-background rounded"
                    title="Download texture"
                  >
                    <Download className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Image Modal */}
      {imageModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          onClick={() => setImageModal(null)}
        >
          <div
            className="max-w-4xl max-h-4xl p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
              <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">{imageModal.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {imageModal.mapTypeLabel} • {formatFileSize(imageModal.width, imageModal.height)}
                    </p>
                  </div>
                  <button
                    onClick={() => setImageModal(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                </div>
              </div>
              <div className="p-4">
                {imageModal.dataUrl ? (
                  <img
                    src={imageModal.dataUrl}
                    alt={imageModal.name}
                    className="max-w-full max-h-96 mx-auto"
                  />
                ) : (
                  <div className="w-64 h-64 flex items-center justify-center border rounded">
                    <Image className="w-16 h-16 text-gray-400" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// %%%%%LAST%%%%%