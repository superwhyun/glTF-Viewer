interface StructureInfoProps {
  modelData?: any
}

export function StructureInfo({ modelData }: StructureInfoProps) {
  const getStructureData = () => {
    if (!modelData) return null

    return {
      nodes: modelData.nodes?.length || 0,
      meshes: modelData.meshes?.length || 0,
      materials: modelData.materials?.length || 0,
      textures: modelData.textures?.length || 0,
      animations: modelData.animations?.length || 0,
      scenes: modelData.scenes?.length || 0
    }
  }

  const structure = getStructureData()

  if (!structure) {
    return (
      <div className="p-4 border rounded-lg bg-card">
        <h3 className="text-lg font-semibold mb-3">Structure Information</h3>
        <p className="text-muted-foreground text-sm">No model data available</p>
      </div>
    )
  }

  return (
    <div className="p-4 border rounded-lg bg-card">
      <h3 className="text-lg font-semibold mb-3">Structure Information</h3>
      
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Scenes:</span>
          <span className="font-medium">{structure.scenes}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-muted-foreground">Nodes:</span>
          <span className="font-medium">{structure.nodes}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-muted-foreground">Meshes:</span>
          <span className="font-medium">{structure.meshes}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-muted-foreground">Materials:</span>
          <span className="font-medium">{structure.materials}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-muted-foreground">Textures:</span>
          <span className="font-medium">{structure.textures}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-muted-foreground">Animations:</span>
          <span className="font-medium">{structure.animations}</span>
        </div>
      </div>
    </div>
  )
}

// %%%%%LAST%%%%%