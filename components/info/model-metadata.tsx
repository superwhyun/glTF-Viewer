interface ModelMetadataProps {
  fileName: string
  fileSize: number
  modelData?: any
}

export function ModelMetadata({ fileName, fileSize, modelData }: ModelMetadataProps) {
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
  }

  const getGltfVersion = () => {
    if (modelData?.asset?.version) {
      return modelData.asset.version
    }
    return 'Unknown'
  }

  const getGenerator = () => {
    if (modelData?.asset?.generator) {
      return modelData.asset.generator
    }
    return 'Unknown'
  }

  return (
    <div className="p-4 border rounded-lg bg-card">
      <h3 className="text-lg font-semibold mb-3">Model Information</h3>
      
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">File Name:</span>
          <span className="font-medium">{fileName}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-muted-foreground">File Size:</span>
          <span className="font-medium">{formatFileSize(fileSize)}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-muted-foreground">glTF Version:</span>
          <span className="font-medium">{getGltfVersion()}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-muted-foreground">Generator:</span>
          <span className="font-medium">{getGenerator()}</span>
        </div>
      </div>
    </div>
  )
}

// %%%%%LAST%%%%%