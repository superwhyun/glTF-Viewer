import { useState, useCallback } from "react"
import { MaterialInfo, getAllMaterials } from "@/lib/material-utils"

export function useMaterial() {
  const [materials, setMaterials] = useState<MaterialInfo[]>([])
  const [selectedMaterial, setSelectedMaterial] = useState<string | null>(null)
  const [sceneRef, setSceneRef] = useState<any>(null)

  const extractMaterials = useCallback((scene: any) => {
    if (!scene) {
      setMaterials([])
      setSelectedMaterial(null)
      setSceneRef(null)
      return
    }

    setSceneRef(scene)
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

  const toggleMaterialVisibility = useCallback((materialName: string) => {
    if (!sceneRef) return
    
    // Find all meshes using this material
    sceneRef.traverse((child: any) => {
      if (child.isMesh && child.material) {
        // Handle both single material and material arrays
        const materials = Array.isArray(child.material) ? child.material : [child.material]
        
        materials.forEach((mat: any) => {
          if (mat.name === materialName) {
            child.visible = !child.visible
          }
        })
      }
    })

    // Update the materials state to reflect visibility changes
    setMaterials(prev => prev.map(mat => 
      mat.name === materialName 
        ? { ...mat, visible: !mat.visible }
        : mat
    ))
  }, [sceneRef])

  const getSelectedMaterialInfo = useCallback(() => {
    if (!selectedMaterial) return null
    return materials.find(mat => mat.name === selectedMaterial) || null
  }, [materials, selectedMaterial])

  return {
    materials,
    selectedMaterial,
    selectedMaterialInfo: getSelectedMaterialInfo(),
    extractMaterials,
    selectMaterial,
    toggleMaterialVisibility
  }
}

// %%%%%LAST%%%%%