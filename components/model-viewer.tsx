"use client"

import { Suspense, useEffect, useState, useRef } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, Stage } from "@react-three/drei"
import * as THREE from "three"
import { useModelViewerDrag } from "@/hooks/use-model-viewer-drag"
import { Model } from "./model/model"
import { DragOverlay } from "./model/drag-overlay"
import { LoadingOverlay } from "./model/loading-overlay"
import { SceneLighting } from "./rendering/scene-lighting"

interface ModelViewerProps {
  modelUrl: string
  onFileDrop: (file: File) => void
  wireframe?: boolean
  onAnimationInit?: (gltf: any, mixer: any) => void
  onAnimationUpdate?: () => void
  onSceneReady?: (scene: any, gltf: any) => void
  lightingConfig?: {
    intensity: number
    environmentEnabled: boolean
    ambientLightEnabled: boolean
    directionalLightEnabled: boolean
    colorTemperature: number
  }
}

export default function ModelViewer({ 
  modelUrl, 
  onFileDrop, 
  wireframe = false, 
  onAnimationInit,
  onAnimationUpdate,
  onSceneReady,
  lightingConfig = {
    intensity: 0.5,
    environmentEnabled: true,
    ambientLightEnabled: true,
    directionalLightEnabled: true,
    colorTemperature: 6500
  }
}: ModelViewerProps) {
  const [isLoading, setIsLoading] = useState(true)
  const { isDragging, handleDragOver, handleDragLeave, handleDrop } = useModelViewerDrag(onFileDrop)
  const controlsRef = useRef<any>()
  const [modelLoaded, setModelLoaded] = useState(false)

  useEffect(() => {
    setIsLoading(true)
    setModelLoaded(false)
  }, [modelUrl])

  const handleModelLoad = () => {
    setTimeout(() => {
      setIsLoading(false)
      setModelLoaded(true)
    }, 100)
  }

  const handleSceneReady = (scene: any, gltf: any) => {
    if (onSceneReady) {
      onSceneReady(scene, gltf)
    }
  }

  return (
    <div
      className={`w-full h-full relative overflow-hidden ${isDragging ? "ring-2 ring-blue-500" : ""}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <DragOverlay isDragging={isDragging} />
      <LoadingOverlay isLoading={isLoading} />
      
      <Canvas shadows dpr={[1, 2]} camera={{ fov: 45 }} className="w-full h-full">
        <Suspense fallback={null}>
          <Stage 
            environment={lightingConfig.environmentEnabled ? "city" : null}
            intensity={lightingConfig.intensity} 
            adjustCamera={!modelLoaded}
          >
            <Model 
              url={modelUrl} 
              onLoad={handleModelLoad} 
              wireframe={wireframe}
              onAnimationInit={onAnimationInit}
              onAnimationUpdate={onAnimationUpdate}
              onSceneReady={handleSceneReady}
            />
          </Stage>
          
          {/* Custom Lighting System */}
          <SceneLighting
            intensity={lightingConfig.intensity}
            environmentEnabled={lightingConfig.environmentEnabled}
            ambientLightEnabled={lightingConfig.ambientLightEnabled}
            directionalLightEnabled={lightingConfig.directionalLightEnabled}
            colorTemperature={lightingConfig.colorTemperature}
          />
          
          <OrbitControls 
            ref={controlsRef}
            makeDefault 
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            dampingFactor={0.1}
            enableDamping={true}
          />
        </Suspense>
      </Canvas>
    </div>
  )
}

// %%%%%LAST%%%%%