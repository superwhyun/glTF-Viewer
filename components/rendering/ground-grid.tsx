"use client"

import { useRef } from "react"
import * as THREE from "three"
import { useTheme } from "next-themes"

interface GroundGridProps {
  size?: number
  divisions?: number
  visible?: boolean
}

export function GroundGrid({ size = 10, divisions = 10, visible = true }: GroundGridProps) {
  const gridRef = useRef<THREE.GridHelper>(null)
  const { theme } = useTheme()

  if (!visible) return null

  // Set colors - black grid lines for visibility on light background
  const centerColor = 0x000000  // Black center line
  const gridColor = 0x666666    // Dark gray grid lines

  return (
    <gridHelper
      ref={gridRef}
      args={[size, divisions, centerColor, gridColor]}
      position={[0, 0, 0]}
    />
  )
}

// %%%%%LAST%%%%%