import { useState } from "react"
import { ChevronDown, Eye, EyeOff, Palette } from "lucide-react"
import { MaterialInfo, formatMapType } from "@/lib/material-utils"

interface MaterialPanelProps {
  materials: MaterialInfo[]
  selectedMaterial: string | null
  onMaterialSelect: (materialName: string) => void
}

export function MaterialPanel({ materials, selectedMaterial, onMaterialSelect }: MaterialPanelProps) {
  const [showMaterialList, setShowMaterialList] = useState(false)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['properties']))

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev)
      if (newSet.has(section)) {
        newSet.delete(section)
      } else {
        newSet.add(section)
      }
      return newSet
    })
  }

  const selectedMaterialInfo = materials.find(mat => mat.name === selectedMaterial)

  const formatValue = (value: any, type?: string): string => {
    if (value === null || value === undefined) return 'N/A'
    if (typeof value === 'boolean') return value ? 'Yes' : 'No'
    if (typeof value === 'number') {
      if (type === 'percentage') return `${(value * 100).toFixed(1)}%`
      return value.toFixed(3)
    }
    return String(value)
  }

  const ColorSwatch = ({ color }: { color?: string }) => {
    if (!color || color === '#000000') return null
    return (
      <div 
        className="w-4 h-4 rounded border border-gray-300 ml-2"
        style={{ backgroundColor: color }}
        title={color}
      />
    )
  }

  if (materials.length === 0) {
    return (
      <div className="p-4 border rounded-lg bg-card">
        <h3 className="text-lg font-semibold mb-3">Materials</h3>
        <p className="text-muted-foreground text-sm">No materials found in this model</p>
      </div>
    )
  }

  return (
    <div className="p-4 border rounded-lg bg-card">
      <h3 className="text-lg font-semibold mb-3">Materials ({materials.length})</h3>
      
      {/* Material Selector */}
      <div className="mb-4">
        <div className="relative">
          <button
            onClick={() => setShowMaterialList(!showMaterialList)}
            className="w-full flex items-center justify-between p-2 border rounded bg-background hover:bg-accent"
          >
            <div className="flex items-center">
              <Palette className="w-4 h-4 mr-2" />
              <span className="text-sm truncate">
                {selectedMaterial || "Select Material"}
              </span>
            </div>
            <ChevronDown className={`w-4 h-4 transition-transform ${showMaterialList ? "rotate-180" : ""}`} />
          </button>
          
          {showMaterialList && (
            <div className="absolute top-full left-0 right-0 mt-1 border rounded bg-background shadow-lg z-10 max-h-40 overflow-y-auto">
              {materials.map((material) => (
                <button
                  key={material.name}
                  onClick={() => {
                    onMaterialSelect(material.name)
                    setShowMaterialList(false)
                  }}
                  className={`w-full text-left p-2 text-sm hover:bg-accent flex items-center justify-between ${
                    selectedMaterial === material.name ? "bg-accent" : ""
                  }`}
                >
                  <div className="flex items-center">
                    <span className="truncate">{material.name}</span>
                    <ColorSwatch color={material.color} />
                  </div>
                  <span className="text-xs text-muted-foreground ml-2">
                    {material.type}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Material Details */}
      {selectedMaterialInfo && (
        <div className="space-y-3">
          {/* Basic Properties */}
          <div>
            <button
              onClick={() => toggleSection('properties')}
              className="flex items-center justify-between w-full p-2 hover:bg-accent rounded"
            >
              <span className="font-medium">Properties</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${
                expandedSections.has('properties') ? "rotate-180" : ""
              }`} />
            </button>
            
            {expandedSections.has('properties') && (
              <div className="mt-2 space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Type:</span>
                  <span className="font-medium">{selectedMaterialInfo.type}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Visible:</span>
                  <div className="flex items-center">
                    {selectedMaterialInfo.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    <span className="ml-1">{formatValue(selectedMaterialInfo.visible)}</span>
                  </div>
                </div>

                {selectedMaterialInfo.color && (
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Color:</span>
                    <div className="flex items-center">
                      <span className="font-medium">{selectedMaterialInfo.color}</span>
                      <ColorSwatch color={selectedMaterialInfo.color} />
                    </div>
                  </div>
                )}

                {selectedMaterialInfo.emissive && selectedMaterialInfo.emissive !== '#000000' && (
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Emissive:</span>
                    <div className="flex items-center">
                      <span className="font-medium">{selectedMaterialInfo.emissive}</span>
                      <ColorSwatch color={selectedMaterialInfo.emissive} />
                    </div>
                  </div>
                )}

                {selectedMaterialInfo.metalness !== undefined && (
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Metalness:</span>
                    <span className="font-medium">{formatValue(selectedMaterialInfo.metalness, 'percentage')}</span>
                  </div>
                )}

                {selectedMaterialInfo.roughness !== undefined && (
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Roughness:</span>
                    <span className="font-medium">{formatValue(selectedMaterialInfo.roughness, 'percentage')}</span>
                  </div>
                )}

                {selectedMaterialInfo.opacity !== undefined && selectedMaterialInfo.opacity < 1 && (
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Opacity:</span>
                    <span className="font-medium">{formatValue(selectedMaterialInfo.opacity, 'percentage')}</span>
                  </div>
                )}

                {selectedMaterialInfo.transparent !== undefined && (
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Transparent:</span>
                    <span className="font-medium">{formatValue(selectedMaterialInfo.transparent)}</span>
                  </div>
                )}

                {selectedMaterialInfo.doubleSided !== undefined && (
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Double Sided:</span>
                    <span className="font-medium">{formatValue(selectedMaterialInfo.doubleSided)}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Texture Maps */}
          {Object.keys(selectedMaterialInfo.maps).length > 0 && (
            <div>
              <button
                onClick={() => toggleSection('textures')}
                className="flex items-center justify-between w-full p-2 hover:bg-accent rounded"
              >
                <span className="font-medium">Texture Maps ({Object.keys(selectedMaterialInfo.maps).length})</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${
                  expandedSections.has('textures') ? "rotate-180" : ""
                }`} />
              </button>
              
              {expandedSections.has('textures') && (
                <div className="mt-2 space-y-2 text-sm">
                  {Object.entries(selectedMaterialInfo.maps).map(([mapName, mapValue]) => (
                    <div key={mapName} className="flex justify-between items-center">
                      <span className="text-muted-foreground">{formatMapType(mapName)}:</span>
                      <span className="font-medium text-xs truncate max-w-32" title={mapValue}>
                        {mapValue}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// %%%%%LAST%%%%%