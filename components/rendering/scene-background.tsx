"use client"

import { useEffect } from "react"
import { useThree } from "@react-three/fiber"
import * as THREE from "three"
import { useTheme } from "next-themes"

export function SceneBackground() {
  const { scene } = useThree()
  const { theme } = useTheme()

  useEffect(() => {
    // Set background color - light gray for better model visibility
    const backgroundColor = 0xf5f5f5  // Light gray for all themes
    scene.background = new THREE.Color(backgroundColor)
    
    return () => {
      // Cleanup
      scene.background = null
    }
  }, [scene, theme])

  return null
}

// %%%%%LAST%%%%%