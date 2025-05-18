"use client"

import { Suspense, useEffect, useState, useRef } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
// PassiveOrbitControls: wheel 이벤트를 passive: true로 등록
import React from "react"

function PassiveOrbitControls(props: any) {
  const controlsRef = useRef<any>(null)
  useEffect(() => {
    const controls = controlsRef.current
    // three.js/drei의 OrbitControls는 react-three/fiber의 forwardRef로 ref.current가 controls 인스턴스임
    if (controls && controls.domElement && controls._onWheel) {
      // 기존 wheel 핸들러 제거
      controls.domElement.removeEventListener("wheel", controls._onWheel)
      // passive: true로 재등록
      controls.domElement.addEventListener("wheel", controls._onWheel, { passive: true })
    }
    // cleanup: 핸들러 제거
    return () => {
      if (controls && controls.domElement && controls._onWheel) {
        controls.domElement.removeEventListener("wheel", controls._onWheel)
      }
    }
  }, [])
  return <OrbitControls ref={controlsRef} {...props} />
}
import * as THREE from "three"
import { useModelViewerDrag } from "@/hooks/use-model-viewer-drag"
import { Model } from "./model/model"
import { DragOverlay } from "./model/drag-overlay"
import { LoadingOverlay } from "./model/loading-overlay"
import { SceneLighting } from "./rendering/scene-lighting"
import { GroundGrid } from "./rendering/ground-grid"
import { ModelOptimizer } from "./performance/model-optimizer"

interface ModelViewerProps {
  modelUrl: string
  onFileDrop: (file: File) => void
  wireframe?: boolean
  onAnimationInit?: (gltf: any, mixer: any) => void
  onAnimationUpdate?: () => void
  onSceneReady?: (scene: any, gltf: any) => void
  isAnimationPlaying?: boolean
  showPerformanceMonitor?: boolean
  autoAlign?: boolean
  showGrid?: boolean
  lightingConfig?: {
    intensity: number
    environmentEnabled: boolean
    ambientLightEnabled: boolean
    directionalLightEnabled: boolean
    colorTemperature: number
  }
  externalMixer?: THREE.AnimationMixer | null
}

export default function ModelViewer({ 
  modelUrl, 
  onFileDrop, 
  wireframe = false, 
  onAnimationInit,
  onAnimationUpdate,
  onSceneReady,
  isAnimationPlaying = false,
  showPerformanceMonitor = false,
  autoAlign = true,
  showGrid = true,
  lightingConfig = {
    intensity: 0.5,
    environmentEnabled: true,
    ambientLightEnabled: true,
    directionalLightEnabled: true,
    colorTemperature: 6500
  },
  externalMixer = null
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
      
      <Canvas 
        shadows 
        dpr={[1, Math.min(window.devicePixelRatio, 2)]} 
        camera={{ fov: 45, near: 0.1, far: 1000 }} 
        className="w-full h-full"
        gl={{ 
          powerPreference: "high-performance",
          antialias: false,
          alpha: false,
          stencil: false,
          depth: true
        }}
        frameloop="always"
        onCreated={({ scene, gl, clock }) => {
          // Set light gray background directly
          scene.background = new THREE.Color(0xf5f5f5)
          gl.setClearColor(0xf5f5f5, 1)
          console.log('🎨 Canvas created with frameloop: always')
          console.log('🕐 Clock created:', clock)
          console.log('🔍 GL context info:', {
            powerPreference: gl.getContextAttributes()?.powerPreference,
            antialias: gl.getContextAttributes()?.antialias
          })
        }}
      >
        <Suspense fallback={null}>
          {/* Performance Optimization */}
          <ModelOptimizer />
          
          {/* Direct lighting and model without Stage component */}
          
          {/* Custom Lighting System */}
          <SceneLighting
            intensity={lightingConfig.intensity}
            environmentEnabled={lightingConfig.environmentEnabled}
            ambientLightEnabled={lightingConfig.ambientLightEnabled}
            directionalLightEnabled={lightingConfig.directionalLightEnabled}
            colorTemperature={lightingConfig.colorTemperature}
          />
          
          {/* Ground Grid (optional) */}
          <GroundGrid visible={showGrid} />
          
          {/* Model */}
          <Model 
            url={modelUrl} 
            onLoad={handleModelLoad} 
            wireframe={wireframe}
            onAnimationInit={onAnimationInit}
            onAnimationUpdate={onAnimationUpdate}
            onSceneReady={handleSceneReady}
            isAnimationPlaying={isAnimationPlaying}
            autoAlign={autoAlign}
            externalMixer={externalMixer}
          />
          
          <PassiveOrbitControls
            makeDefault
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            enableDamping={false}
            maxDistance={1000}
            minDistance={0.01}
            zoomSpeed={1.2}
            panSpeed={1}
            rotateSpeed={1}
          />
        </Suspense>
      </Canvas>
    </div>
  )
}

// %%%%%LAST%%%%%