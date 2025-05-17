import { useState, useCallback } from "react"
import { MaterialInfo, getAllMaterials } from "@/lib/material-utils"

export function useMaterial() {
  const [materials, setMaterials] = useState<MaterialInfo[]>([])
  const [selectedMaterial, setSelectedMaterial] = useState<string | null>(null)

  const extractMaterials = useCallback((scene: any) => {
    if (!scene) {
      setMaterials([])
      setSelectedMaterial(null)
      return
    }

    const materialInfos = getAllMaterials(scene)
    setMaterials(materialInfos)
    
    // Auto-select first material if available
    if (materialInfos.length > 0 && !selectedMaterial) {
      setSelectedMaterial(materialInfos[0].name)
    }
  }, [selectedMaterial])

  const selectMaterial = useCallback((materialName: string | null) => {
    setSelectedMaterial(materialName)
  }, [])

  const getSelectedMaterialInfo = useCallback(() => {
    if (!selectedMaterial) return null
    return materials.find(mat => mat.name === selectedMaterial) || null
  }, [materials, selectedMaterial])

  return {
    materials,
    selectedMaterial,
    selectedMaterialInfo: getSelectedMaterialInfo(),
    extractMaterials,
    selectMaterial
  }
}

// %%%%%LAST%%%%%