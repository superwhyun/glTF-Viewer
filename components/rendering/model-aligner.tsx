"use client"

import { useEffect, useRef } from "react"
import { useThree } from "@react-three/fiber"
import * as THREE from "three"

interface ModelAlignerProps {
  scene?: THREE.Object3D
  onAdjustmentComplete?: (adjustment: { 
    position: THREE.Vector3
    scale: number
    boundingBox: THREE.Box3
  }) => void
}

export function ModelAligner({ scene, onAdjustmentComplete }: ModelAlignerProps) {
  const { camera } = useThree()
  const adjustmentApplied = useRef(false)

  useEffect(() => {
    if (!scene || adjustmentApplied.current) return

    // Calculate bounding box for the entire scene
    const box = new THREE.Box3().setFromObject(scene)
    
    // Check if bounding box is valid
    if (box.isEmpty()) {
      console.warn('Model has empty bounding box, skipping alignment')
      return
    }
    
    const size = box.getSize(new THREE.Vector3())
    const center = box.getCenter(new THREE.Vector3())

    // Align model to ground (move to Y=0 at bottom)
    const groundOffset = -box.min.y
    scene.position.y = groundOffset

    // Center model horizontally
    scene.position.x = -center.x
    scene.position.z = -center.z

    // Auto-scale based on model size with improved logic
    const maxDimension = Math.max(size.x, size.y, size.z)
    let autoScale = 1
    
    console.log('Model dimensions:', { size, maxDimension, center })

    // More aggressive scaling for very large models
    if (maxDimension > 100) {
      // Very large models (like architectural models)
      autoScale = 5 / maxDimension
    } else if (maxDimension > 20) {
      // Large models
      autoScale = 8 / maxDimension
    } else if (maxDimension > 10) {
      // Medium-large models  
      autoScale = 10 / maxDimension
    } else if (maxDimension < 0.01) {
      // Very tiny models
      autoScale = 100 / maxDimension
    } else if (maxDimension < 0.1) {
      // Small models
      autoScale = 5 / maxDimension
    } else if (maxDimension < 1) {
      // Medium-small models
      autoScale = 3 / maxDimension
    }
    // Models between 1-10 units keep their original scale

    console.log('Applying scale:', autoScale)
    scene.scale.setScalar(autoScale)

    // Recalculate box after transformations
    const adjustedBox = new THREE.Box3().setFromObject(scene)
    const adjustedSize = adjustedBox.getSize(new THREE.Vector3())
    const adjustedCenter = adjustedBox.getCenter(new THREE.Vector3())

    // Adjust camera to fit the model with improved positioning
    const maxSize = Math.max(adjustedSize.x, adjustedSize.y, adjustedSize.z)
    const distance = maxSize * 2.2  // Slightly closer view

    if (camera instanceof THREE.PerspectiveCamera) {
      // Set camera position for optimal viewing
      const cameraHeight = Math.max(adjustedSize.y * 0.5, distance * 0.6)
      camera.position.set(
        distance * 0.8,     // X: slightly to the side
        cameraHeight,       // Y: at a good height
        distance * 0.8      // Z: at an angle
      )
      camera.lookAt(adjustedCenter)
      camera.updateProjectionMatrix()
      
      console.log('Camera positioned at:', camera.position, 'looking at:', adjustedCenter)
    }

    // Notify parent component
    if (onAdjustmentComplete) {
      onAdjustmentComplete({
        position: scene.position.clone(),
        scale: autoScale,
        boundingBox: adjustedBox
      })
    }

    adjustmentApplied.current = true
  }, [scene, camera, onAdjustmentComplete])

  // Reset flag when scene changes
  useEffect(() => {
    adjustmentApplied.current = false
  }, [scene])

  return null
}

// %%%%%LAST%%%%%