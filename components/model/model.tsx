import { useEffect, useRef } from "react"
import { useGLTF } from "@react-three/drei"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

interface ModelProps {
  url: string
  onLoad: () => void
  wireframe?: boolean
  onAnimationInit?: (gltf: any, mixer: THREE.AnimationMixer) => void
  onAnimationUpdate?: () => void
  onSceneReady?: (scene: any, gltf: any) => void
}

export function Model({ url, onLoad, wireframe = false, onAnimationInit, onAnimationUpdate, onSceneReady }: ModelProps) {
  const { scene, animations } = useGLTF(url)
  const mixerRef = useRef<THREE.AnimationMixer>()
  const lastUpdateRef = useRef<number>(0)
  const UPDATE_INTERVAL = 1000 / 30 // 30fps for UI updates

  useEffect(() => {
    if (scene) {
      onLoad()
      
      // Initialize animation mixer if animations exist
      if (animations && animations.length > 0) {
        const mixer = new THREE.AnimationMixer(scene)
        mixerRef.current = mixer
        
        if (onAnimationInit) {
          onAnimationInit({ animations, scene }, mixer)
        }
      }

      // Pass scene data for scene graph
      if (onSceneReady) {
        onSceneReady(scene, { animations, scene })
      }
    }
  }, [scene, animations, onLoad, onAnimationInit, onSceneReady])

  useEffect(() => {
    if (scene) {
      scene.traverse((child: any) => {
        if (child.isMesh && child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach((material: any) => {
              material.wireframe = wireframe
            })
          } else {
            child.material.wireframe = wireframe
          }
        }
      })
    }
  }, [scene, wireframe])

  // Update animation mixer on each frame with throttling
  useFrame((state, delta) => {
    if (mixerRef.current) {
      // Always update mixer for smooth animation
      mixerRef.current.update(delta)
      
      // Throttle UI updates to improve performance
      const now = state.clock.getElapsedTime() * 1000
      if (now - lastUpdateRef.current >= UPDATE_INTERVAL) {
        if (onAnimationUpdate) {
          onAnimationUpdate()
        }
        lastUpdateRef.current = now
      }
    }
  })

  return <primitive object={scene} />
}

// %%%%%LAST%%%%%