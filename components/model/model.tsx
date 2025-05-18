import { useEffect, useRef, useMemo } from "react"
import { useGLTF } from "@react-three/drei"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"
import { ModelAligner } from "../rendering/model-aligner"

interface ModelProps {
  url: string
  onLoad: () => void
  wireframe?: boolean
  onAnimationInit?: (gltf: any, mixer: THREE.AnimationMixer) => void
  onAnimationUpdate?: () => void
  onSceneReady?: (scene: any, gltf: any) => void
  isAnimationPlaying?: boolean
  autoAlign?: boolean
  externalMixer?: THREE.AnimationMixer | null // Add external mixer prop
}

export function Model({ url, onLoad, wireframe = false, onAnimationInit, onAnimationUpdate, onSceneReady, isAnimationPlaying = false, autoAlign = true, externalMixer }: ModelProps) {
  const gltf = useGLTF(url)
  const { scene, animations } = gltf
  const mixerRef = useRef<THREE.AnimationMixer>()
  
  // Check if this model has animations
  const hasAnimations = animations && animations.length > 0
  
  const optimizedScene = useMemo(() => {
    if (!scene) return null
    
    // If model has animations, use original scene to preserve animation bindings
    if (hasAnimations) {
      // Apply optimizations directly to the original scene
      scene.traverse((child: any) => {
        if (child.isMesh) {
          // Enable frustum culling
          child.frustumCulled = true
          
          // Optimize geometry
          if (child.geometry) {
            child.geometry.computeBoundingBox()
            child.geometry.computeBoundingSphere()
          }
          
          // Optimize materials
          if (child.material) {
            const materials = Array.isArray(child.material) ? child.material : [child.material]
            materials.forEach((material: any) => {
              // Enable material caching
              material.needsUpdate = false
              
              // Optimize shadow settings  
              material.shadowSide = THREE.FrontSide
              
              // Safely optimize textures
              const optimizeTexture = (texture: any) => {
                if (!texture) return
                
                try {
                  // For sRGB textures, ensure proper format
                  if (texture.encoding === THREE.sRGBEncoding) {
                    texture.format = THREE.RGBAFormat
                    texture.type = THREE.UnsignedByteType
                    // Disable mipmaps for sRGB textures to prevent GL errors
                    texture.generateMipmaps = false
                    texture.minFilter = THREE.LinearFilter
                    texture.magFilter = THREE.LinearFilter
                  } else {
                    // For non-sRGB textures, check format compatibility
                    if (texture.format === THREE.RGBFormat) {
                      // RGB format often causes issues with mipmaps
                      texture.generateMipmaps = false
                      texture.minFilter = THREE.LinearFilter
                    } else {
                      // Safe to use mipmaps for RGBA format
                      texture.generateMipmaps = true
                      texture.minFilter = THREE.LinearMipmapLinearFilter
                    }
                    texture.magFilter = THREE.LinearFilter
                  }
                  
                  // Set wrapping
                  texture.wrapS = THREE.ClampToEdgeWrapping
                  texture.wrapT = THREE.ClampToEdgeWrapping
                } catch (error) {
                  // Silently handle texture optimization errors
                  console.warn('Texture optimization failed:', error)
                }
              }
              
              // Apply to all texture types
              ['map', 'normalMap', 'roughnessMap', 'metalnessMap', 'aoMap', 'emissiveMap'].forEach(key => {
                optimizeTexture(material[key])
              })
            })
          }
        }
      })
      
      return scene
    } else {
      // For non-animated models, use cloned scene for safety
      const clonedScene = scene.clone()
      
      // Apply performance optimizations to cloned scene
      clonedScene.traverse((child: any) => {
        if (child.isMesh) {
          // Enable frustum culling
          child.frustumCulled = true
          
          // Optimize geometry
          if (child.geometry) {
            child.geometry.computeBoundingBox()
            child.geometry.computeBoundingSphere()
          }
          
          // Optimize materials
          if (child.material) {
            const materials = Array.isArray(child.material) ? child.material : [child.material]
            materials.forEach((material: any) => {
              // Enable material caching
              material.needsUpdate = false
              
              // Optimize shadow settings
              material.shadowSide = THREE.FrontSide
              
              // Safely optimize textures
              const optimizeTexture = (texture: any) => {
                if (!texture) return
                
                try {
                  // For sRGB textures, ensure proper format
                  if (texture.encoding === THREE.sRGBEncoding) {
                    texture.format = THREE.RGBAFormat
                    texture.type = THREE.UnsignedByteType
                    // Disable mipmaps for sRGB textures to prevent GL errors
                    texture.generateMipmaps = false
                    texture.minFilter = THREE.LinearFilter
                    texture.magFilter = THREE.LinearFilter
                  } else {
                    // For non-sRGB textures, check format compatibility
                    if (texture.format === THREE.RGBFormat) {
                      // RGB format often causes issues with mipmaps
                      texture.generateMipmaps = false
                      texture.minFilter = THREE.LinearFilter
                    } else {
                      // Safe to use mipmaps for RGBA format
                      texture.generateMipmaps = true
                      texture.minFilter = THREE.LinearMipmapLinearFilter
                    }
                    texture.magFilter = THREE.LinearFilter
                  }
                  
                  // Set wrapping
                  texture.wrapS = THREE.ClampToEdgeWrapping
                  texture.wrapT = THREE.ClampToEdgeWrapping
                } catch (error) {
                  // Silently handle texture optimization errors
                  console.warn('Texture optimization failed:', error)
                }
              }
              
              // Apply to all texture types
              ['map', 'normalMap', 'roughnessMap', 'metalnessMap', 'aoMap', 'emissiveMap'].forEach(key => {
                optimizeTexture(material[key])
              })
            })
          }
        }
      })
      
      return clonedScene
    }
  }, [scene, hasAnimations])

  // Store gltf and callbacks references to prevent reinitialization
  const gltfRef = useRef(gltf)
  gltfRef.current = gltf
  
  const callbacksRef = useRef({ onLoad, onAnimationInit, onSceneReady })
  callbacksRef.current = { onLoad, onAnimationInit, onSceneReady }

  useEffect(() => {
    console.log('🔄 Model useEffect triggered - optimizedScene:', !!optimizedScene, 'scene:', !!scene, 'animations:', animations?.length)
    
    if (optimizedScene && scene) {
      callbacksRef.current.onLoad()
      
      // Initialize animation mixer only ONCE when animations exist
      if (animations && animations.length > 0 && !mixerRef.current) {
        console.log('🎭 Setting up animations for the FIRST time')
        
        // Use the scene that will be rendered (original for animations, cloned for static models)
        const mixer = new THREE.AnimationMixer(optimizedScene)
        mixerRef.current = mixer
        
        if (callbacksRef.current.onAnimationInit) {
          console.log('📞 Calling onAnimationInit')
          callbacksRef.current.onAnimationInit(gltfRef.current, mixer)
        }
      } else if (animations && animations.length > 0) {
        console.log('🔄 Animations already initialized, skipping...')
      } else {
        console.log('❌ No animations found in this model')
      }

      // Pass scene data for scene graph (only once)
      if (callbacksRef.current.onSceneReady) {
        callbacksRef.current.onSceneReady(optimizedScene, { animations, scene: optimizedScene })
      }
    }
  }, [optimizedScene, scene, animations])

  useEffect(() => {
    if (!optimizedScene) return
    optimizedScene.traverse((child: any) => {
      if (child.isMesh && child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach((material: any) => {
            if (material.wireframe !== wireframe) {
              material.wireframe = wireframe
              material.needsUpdate = true
            }
          })
        } else {
          if (child.material.wireframe !== wireframe) {
            child.material.wireframe = wireframe
            child.material.needsUpdate = true
          }
        }
      }
    })
  }, [optimizedScene, wireframe])

  // Update animation mixer - always update when mixer exists
  useFrame((state, delta) => {
    // Use external mixer if available, otherwise use internal mixer
    const activeMixer = externalMixer || mixerRef.current
    
    if (activeMixer) {
      // Log occasionally to check if mixer is updating
      if (Math.floor(state.clock.elapsedTime * 10) % 100 === 0) {
        console.log('🔄 Model useFrame: activeMixer updating', {
          isExternal: !!externalMixer,
          mixerTime: activeMixer.time?.toFixed(3),
          delta: delta.toFixed(3)
        })
      }
      
      // Always update the mixer to keep animations running
      activeMixer.update(delta)
      
      // Call the update callback if provided
      if (onAnimationUpdate) {
        onAnimationUpdate()
      }
    }
  })

  // Cleanup on URL change (new model loaded)
  useEffect(() => {
    return () => {
      console.log('🧹 Model cleanup triggered - clearing animation mixer')
      if (mixerRef.current) {
        mixerRef.current.stopAllAction()
        mixerRef.current = undefined
      }
    }
  }, [url]) // Trigger cleanup when URL changes

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log('🧹 Model unmount cleanup')
      if (mixerRef.current) {
        mixerRef.current.stopAllAction()
        mixerRef.current = undefined
      }
    }
  }, [])

  if (!optimizedScene) return null
  
  return (
    <>
      <primitive object={optimizedScene} />
      {autoAlign && <ModelAligner scene={optimizedScene} />}
    </>
  )
}

// %%%%%LAST%%%%%