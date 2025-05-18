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

    console.log('🔧 ModelAligner: Processing scene:', scene)

    // Force matrix updates before calculation
    scene.updateMatrixWorld(true)

    // Reset any existing transformations to get original dimensions
    scene.position.set(0, 0, 0)
    scene.scale.set(1, 1, 1)
    scene.rotation.set(0, 0, 0)

    // Force another matrix update after reset
    scene.updateMatrixWorld(true)

    // Calculate bounding box for the entire scene - more thorough approach
    const box = new THREE.Box3()
    
    // Traverse all children to ensure we get everything
    scene.traverse((child) => {
      if (child.isMesh && child.geometry) {
        // Get geometry bounding box
        if (!child.geometry.boundingBox) {
          child.geometry.computeBoundingBox()
        }
        
        if (child.geometry.boundingBox) {
          // Apply world matrix to get world coordinates
          child.updateMatrixWorld(true)
          const childBox = child.geometry.boundingBox.clone()
          childBox.applyMatrix4(child.matrixWorld)
          box.union(childBox)
        }
      }
    })

    console.log('📦 Calculated bounding box:', {
      min: { x: box.min.x.toFixed(3), y: box.min.y.toFixed(3), z: box.min.z.toFixed(3) },
      max: { x: box.max.x.toFixed(3), y: box.max.y.toFixed(3), z: box.max.z.toFixed(3) },
      isEmpty: box.isEmpty()
    })
    
    // Check if bounding box is valid
    if (box.isEmpty()) {
      console.warn('⚠️ Model has empty bounding box, using fallback alignment')
      // Fallback: just center the model at origin
      scene.position.set(0, 0, 0)
      
      // Set default camera position for fallback
      if (camera instanceof THREE.PerspectiveCamera) {
        camera.position.set(5, 5, 5)
        camera.lookAt(0, 0, 0)
        camera.updateProjectionMatrix()
      }
      
      adjustmentApplied.current = true
      return
    }
    
    const size = box.getSize(new THREE.Vector3())
    const center = box.getCenter(new THREE.Vector3())

    console.log('📏 Model analysis:', {
      size: { x: size.x.toFixed(3), y: size.y.toFixed(3), z: size.z.toFixed(3) },
      center: { x: center.x.toFixed(3), y: center.y.toFixed(3), z: center.z.toFixed(3) },
      min: { x: box.min.x.toFixed(3), y: box.min.y.toFixed(3), z: box.min.z.toFixed(3) },
      max: { x: box.max.x.toFixed(3), y: box.max.y.toFixed(3), z: box.max.z.toFixed(3) }
    })

    // Calculate transformations

    // 1. Center horizontally (X and Z axes)
    const offsetX = -center.x
    const offsetZ = -center.z

    // 2. CRITICAL: Align bottom of model to Y=0 (ground level)
    // This ensures the model sits on the ground, not floating
    const offsetY = -box.min.y

    console.log('🔄 Calculated offsets:', {
      x: offsetX.toFixed(3),
      y: offsetY.toFixed(3), 
      z: offsetZ.toFixed(3),
      explanation: {
        centerX: `Moving model ${offsetX.toFixed(3)} units in X to center`,
        groundY: `Moving model ${offsetY.toFixed(3)} units in Y to place bottom at ground`,
        centerZ: `Moving model ${offsetZ.toFixed(3)} units in Z to center`
      }
    })

    // Apply position adjustments
    scene.position.set(offsetX, offsetY, offsetZ)

    // 3. Auto-scale based on model size
    const maxDimension = Math.max(size.x, size.y, size.z)
    let autoScale = 1

    // Scaling logic for different model sizes
    if (maxDimension > 1000) {
      autoScale = 3 / maxDimension    // Massive models (>1km)
    } else if (maxDimension > 500) {
      autoScale = 5 / maxDimension    // Very large models (city blocks)
    } else if (maxDimension > 100) {
      autoScale = 8 / maxDimension    // Large models (buildings)
    } else if (maxDimension > 50) {
      autoScale = 10 / maxDimension   // Medium-large models (rooms)
    } else if (maxDimension > 20) {
      autoScale = 12 / maxDimension   // Medium models (furniture)
    } else if (maxDimension > 10) {
      autoScale = 15 / maxDimension   // Medium-small models
    } else if (maxDimension > 5) {
      autoScale = 1                   // Good size range (no scaling)
    } else if (maxDimension > 1) {
      autoScale = 3 / maxDimension    // Small models
    } else if (maxDimension > 0.1) {
      autoScale = 5 / maxDimension    // Very small models
    } else if (maxDimension > 0.01) {
      autoScale = 50 / maxDimension   // Tiny models
    } else if (maxDimension > 0.001) {
      autoScale = 500 / maxDimension  // Microscopic models
    } else {
      autoScale = 5000 / maxDimension // Ultra-microscopic models
    }

    // Safety clamps
    autoScale = Math.max(0.0001, Math.min(10000, autoScale))

    console.log('📐 Scaling calculation:', {
      maxDimension: maxDimension.toFixed(6),
      autoScale: autoScale.toFixed(6),
      resultingSize: (maxDimension * autoScale).toFixed(3)
    })

    // Apply scaling
    scene.scale.setScalar(autoScale)

    // Force matrix update after all transformations
    scene.updateMatrixWorld(true)

    // Recalculate final bounding box for camera positioning
    const finalBox = new THREE.Box3().setFromObject(scene)
    const finalSize = finalBox.getSize(new THREE.Vector3())
    const finalCenter = finalBox.getCenter(new THREE.Vector3())

    console.log('📦 Final state after alignment:', {
      center: { x: finalCenter.x.toFixed(3), y: finalCenter.y.toFixed(3), z: finalCenter.z.toFixed(3) },
      size: { x: finalSize.x.toFixed(3), y: finalSize.y.toFixed(3), z: finalSize.z.toFixed(3) },
      position: { x: scene.position.x.toFixed(3), y: scene.position.y.toFixed(3), z: scene.position.z.toFixed(3) },
      scale: scene.scale.x.toFixed(3)
    })

    // Camera positioning
    if (camera instanceof THREE.PerspectiveCamera) {
      const maxSize = Math.max(finalSize.x, finalSize.y, finalSize.z)
      
      // Calculate ideal camera distance based on field of view
      const fov = camera.fov * Math.PI / 180 // Convert to radians
      const distance = maxSize / (2 * Math.tan(fov / 2)) * 1.8 // Add some margin
      
      // Position camera at a pleasant angle
      const cameraHeight = Math.max(finalSize.y * 0.8, distance * 0.6)
      const cameraDistance = Math.max(distance, maxSize * 1.2)
      
      // Standard 3/4 view position
      camera.position.set(
        cameraDistance * 0.8,   // X: slightly to the right
        cameraHeight,           // Y: elevated view
        cameraDistance * 0.8    // Z: towards camera
      )
      
      // Look at the center of the final model
      camera.lookAt(finalCenter)
      camera.updateProjectionMatrix()
      
      console.log('📷 Camera setup:', {
        position: { 
          x: camera.position.x.toFixed(3), 
          y: camera.position.y.toFixed(3), 
          z: camera.position.z.toFixed(3) 
        },
        lookAt: { 
          x: finalCenter.x.toFixed(3), 
          y: finalCenter.y.toFixed(3), 
          z: finalCenter.z.toFixed(3) 
        },
        distance: cameraDistance.toFixed(3),
        fov: camera.fov
      })
    }

    // Notify parent component
    if (onAdjustmentComplete) {
      onAdjustmentComplete({
        position: scene.position.clone(),
        scale: autoScale,
        boundingBox: finalBox
      })
    }

    adjustmentApplied.current = true
    console.log('✅ Model alignment completed successfully')
  }, [scene, camera, onAdjustmentComplete])

  // Reset flag when scene changes
  useEffect(() => {
    adjustmentApplied.current = false
  }, [scene])

  return null
}

// %%%%%LAST%%%%%