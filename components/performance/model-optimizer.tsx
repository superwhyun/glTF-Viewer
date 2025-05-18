"use client"

import { useEffect, useRef } from "react"
import { useThree } from "@react-three/fiber"
import * as THREE from "three"

export function ModelOptimizer() {
  const { scene, gl, camera } = useThree()
  const optimizationApplied = useRef(false)

  useEffect(() => {
    if (optimizationApplied.current) return
    
    // Enable various optimizations
    gl.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    
    // Optimize shadows
    gl.shadowMap.enabled = true
    gl.shadowMap.type = THREE.PCFSoftShadowMap
    gl.shadowMap.autoUpdate = false
    
    // Set up LOD (Level of Detail) system
    scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        // Enable frustum culling
        object.frustumCulled = true
        
        // Optimize geometry
        if (object.geometry) {
          object.geometry.computeBoundingBox()
          object.geometry.computeBoundingSphere()
        }
        
        // Optimize materials - safer approach
        if (object.material) {
          const materials = Array.isArray(object.material) ? object.material : [object.material]
          
          materials.forEach((material: any) => {
            // Enable material optimization
            material.needsUpdate = false
            
            // Optimize textures safely
            const optimizeTexture = (texture: any) => {
              if (!texture) return
              
              try {
                // Disable mipmaps for potentially problematic textures
                if (texture.format === THREE.RGBFormat) {
                  texture.generateMipmaps = false
                  texture.minFilter = THREE.LinearFilter
                } else {
                  texture.generateMipmaps = false  // Disable all mipmaps to prevent errors
                  texture.minFilter = THREE.LinearFilter
                }
                texture.magFilter = THREE.LinearFilter
                
                // Safe wrapping
                texture.wrapS = THREE.ClampToEdgeWrapping
                texture.wrapT = THREE.ClampToEdgeWrapping
              } catch (error) {
                // Silently handle errors
              }
            }
            
            // Apply to all texture maps
            optimizeTexture(material.map)
            optimizeTexture(material.normalMap)
            optimizeTexture(material.roughnessMap)
            optimizeTexture(material.metalnessMap)
            optimizeTexture(material.aoMap)
            optimizeTexture(material.emissiveMap)
            
            // Enable material side optimization
            material.side = THREE.FrontSide
          })
        }
      }
    })
    
    // Camera optimization
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.near = 0.1
      camera.far = 1000
      camera.updateProjectionMatrix()
    }
    
    optimizationApplied.current = true
  }, [scene, gl, camera])

  return null
}

// %%%%%LAST%%%%%