import { useState, useCallback } from "react"
import { TextureInfo, getAllTextures } from "@/lib/material-utils"

export function useTexture() {
  const [textures, setTextures] = useState<TextureInfo[]>([])
  const [selectedTexture, setSelectedTexture] = useState<string | null>(null)

  const extractTextures = useCallback(async (scene: any) => {
    if (!scene) {
      setTextures([])
      setSelectedTexture(null)
      return
    }

    try {
      const textureInfos = await getAllTextures(scene)
      setTextures(textureInfos)
      
      // Auto-select first texture if available
      if (textureInfos.length > 0 && !selectedTexture) {
        setSelectedTexture(textureInfos[0].name)
      }
    } catch (error) {
      console.error('Failed to extract textures:', error)
      setTextures([])
      setSelectedTexture(null)
    }
  }, [selectedTexture])

  const selectTexture = useCallback((textureName: string | null) => {
    setSelectedTexture(textureName)
  }, [])

  const getSelectedTextureInfo = useCallback(() => {
    if (!selectedTexture) return null
    return textures.find(tex => tex.name === selectedTexture) || null
  }, [textures, selectedTexture])

  const getTexturesByType = useCallback(() => {
    const texturesByType: { [key: string]: TextureInfo[] } = {}
    
    textures.forEach(texture => {
      if (!texturesByType[texture.mapType]) {
        texturesByType[texture.mapType] = []
      }
      texturesByType[texture.mapType].push(texture)
    })

    return texturesByType
  }, [textures])

  return {
    textures,
    selectedTexture,
    selectedTextureInfo: getSelectedTextureInfo(),
    texturesByType: getTexturesByType(),
    extractTextures,
    selectTexture
  }
}

// %%%%%LAST%%%%%