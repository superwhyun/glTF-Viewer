"use client"

import { useState, useCallback } from "react"
import ModelViewer from "@/components/model-viewer"
import FileDropZone from "@/components/file-drop-zone"
import { InfoSidebar } from "@/components/layout/info-sidebar"
import { WireframeToggle } from "@/components/rendering/wireframe-toggle"
import { LightingControls } from "@/components/rendering/lighting-controls"
import { useAnimation } from "@/hooks/use-animation"
import { useSceneGraph } from "@/hooks/use-scene-graph"
import { useMaterial } from "@/hooks/use-material"
import { useTexture } from "@/hooks/use-texture"

export default function Home() {
  const [modelUrl, setModelUrl] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string>("")
  const [fileSize, setFileSize] = useState<number>(0)
  const [modelData, setModelData] = useState<any>(null)
  const [wireframe, setWireframe] = useState<boolean>(false)
  const [lightingConfig, setLightingConfig] = useState({
    intensity: 0.5,
    environmentEnabled: true,
    ambientLightEnabled: true,
    directionalLightEnabled: true,
    colorTemperature: 6500
  })
  
  // Use animation hook at the top level
  const {
    animations,
    currentAnimation,
    isPlaying,
    currentTime,
    playbackSpeed,
    initializeAnimations,
    playAnimation,
    pauseAnimation,
    resumeAnimation,
    stopAnimation,
    setAnimationTime,
    changePlaybackSpeed,
    setCurrentAnimation,
    updateTime,
    resetAnimationState,
    loadAnimationFile,
    currentMixer
  } = useAnimation()

  // Use scene graph hook
  const {
    sceneGraph,
    selectedNode,
    expandedNodes,
    parseSceneGraph,
    toggleNodeExpanded,
    toggleNodeVisibility,
    selectNode
  } = useSceneGraph()

  // Use material hook
  const {
    materials,
    selectedMaterial,
    extractMaterials,
    selectMaterial,
    toggleMaterialVisibility
  } = useMaterial()

  // Use texture hook
  const {
    textures,
    selectedTexture,
    selectedTextureInfo,
    texturesByType,
    extractTextures,
    selectTexture
  } = useTexture()

  const handleFileDrop = async (file: File) => {
    // Reset animation state before loading new model
    console.log('🔄 New model being loaded, resetting animation state...')
    resetAnimationState()
    
    // Revoke the old URL if it exists to prevent memory leaks
    if (modelUrl) {
      URL.revokeObjectURL(modelUrl)
    }

    // Create a URL for the dropped file
    const url = URL.createObjectURL(file)
    setModelUrl(url)
    setFileName(file.name)
    setFileSize(file.size)

    // Parse model data for GLB files
    if (file.name.endsWith('.glb') || file.name.endsWith('.vrm')) {
      try {
        const arrayBuffer = await file.arrayBuffer()
        
        if (file.name.endsWith('.vrm')) {
          // Handle VRM files (which are GLB files with VRM extensions)
          const dataView = new DataView(arrayBuffer)
          const magic = dataView.getUint32(0, true)
          
          if (magic === 0x46546C67) { // "glTF" magic number
            // Extract JSON chunk from GLB
            const jsonChunkLength = dataView.getUint32(12, true)
            const jsonChunkType = dataView.getUint32(16, true)
            
            if (jsonChunkType === 0x4E4F534A) { // "JSON" chunk
              const jsonData = new TextDecoder().decode(
                arrayBuffer.slice(20, 20 + jsonChunkLength)
              )
              const gltfData = JSON.parse(jsonData)
              console.log('Parsed VRM/GLB JSON data:', gltfData)
              setModelData(gltfData)
            }
          }
        } else {
          // Handle regular GLB files
          const dataView = new DataView(arrayBuffer)
          const magic = dataView.getUint32(0, true)
          const version = dataView.getUint32(4, true)
          const length = dataView.getUint32(8, true)
          
          if (magic === 0x46546C67) { // "glTF" magic number
            // Try to extract JSON chunk for more detailed info
            try {
              const jsonChunkLength = dataView.getUint32(12, true)
              const jsonChunkType = dataView.getUint32(16, true)
              
              if (jsonChunkType === 0x4E4F534A) { // "JSON" chunk
                const jsonData = new TextDecoder().decode(
                  arrayBuffer.slice(20, 20 + jsonChunkLength)
                )
                const gltfData = JSON.parse(jsonData)
                console.log('Parsed GLB JSON data:', gltfData)
                setModelData(gltfData)
              } else {
                // Fallback to basic info
                setModelData({
                  asset: {
                    version: `${version}`
                  }
                })
              }
            } catch (parseError) {
              console.warn('Could not parse GLB JSON chunk:', parseError)
              setModelData({
                asset: {
                  version: `${version}`
                }
              })
            }
          }
        }
      } catch (error) {
        console.error('Error parsing GLB/VRM file:', error)
      }
    } else if (file.name.endsWith('.gltf')) {
      try {
        const text = await file.text()
        const gltfData = JSON.parse(text)
        setModelData(gltfData)
      } catch (error) {
        console.error('Error parsing GLTF file:', error)
      }
    }
  }

  const handleCloseModel = () => {
    // Reset animation state when closing model
    console.log('🔄 Model being closed, resetting animation state...')
    resetAnimationState()
    
    if (modelUrl) {
      URL.revokeObjectURL(modelUrl)
    }
    setModelUrl(null)
    setFileName("")
    setFileSize(0)
    setModelData(null)
    setWireframe(false)
    setLightingConfig({
      intensity: 0.5,
      environmentEnabled: true,
      ambientLightEnabled: true,
      directionalLightEnabled: true,
      colorTemperature: 6500
    })
  }

  const handleAnimationInit = useCallback((gltf: any, mixer: any) => {
    initializeAnimations(gltf, mixer)
  }, [initializeAnimations])

  const handleAnimationUpdate = useCallback(() => {
    updateTime()
  }, [updateTime])

  const handleSceneReady = useCallback(async (scene: any, gltf: any) => {
    parseSceneGraph(scene, gltf)
    extractMaterials(scene)
    await extractTextures(scene)
  }, [parseSceneGraph, extractMaterials, extractTextures])

  // Lighting control handlers
  const handleLightingChange = (updates: Partial<typeof lightingConfig>) => {
    setLightingConfig(prev => ({ ...prev, ...updates }))
  }
  // Animation controls with external animation loading
  const animationControls = {
    onPlay: () => {
      if (isPlaying) {
        pauseAnimation()
      } else {
        // Check if we should resume or start fresh
        if (currentAnimation && currentTime > 0) {
          resumeAnimation()
        } else {
          playAnimation()
        }
      }
    },
    onPause: pauseAnimation,
    onStop: stopAnimation,
    onAnimationChange: (name: string) => {
      setCurrentAnimation(name)
      playAnimation(name)
    },
    onTimeChange: setAnimationTime,
    onSpeedChange: changePlaybackSpeed,
    onAnimationFileDrop: async (file: File) => {
      try {
        await loadAnimationFile(file)
      } catch (error) {
        console.error('Failed to load animation file:', error)
        // Could add a toast notification here
      }
    }
  }

  // Animation data for the sidebar
  const animationData = {
    animations,
    currentAnimation,
    isPlaying,
    currentTime,
    playbackSpeed
  }

  // Scene graph data for the sidebar
  const sceneGraphData = {
    sceneGraph,
    selectedNode,
    expandedNodes,
    onNodeSelect: selectNode,
    onNodeToggle: toggleNodeExpanded,
    onVisibilityToggle: (nodeId: string) => toggleNodeVisibility(nodeId, sceneGraph)
  }

  // Material data for the sidebar
  const materialData = {
    materials,
    selectedMaterial,
    onMaterialSelect: selectMaterial,
    onMaterialVisibilityToggle: toggleMaterialVisibility
  }

  // Texture data for the sidebar
  const textureData = {
    textures,
    texturesByType,
    selectedTexture,
    selectedTextureInfo,
    onTextureSelect: selectTexture
  }

  // Lighting data for the sidebar
  const lightingData = {
    ...lightingConfig,
    onIntensityChange: (intensity: number) => handleLightingChange({ intensity }),
    onEnvironmentToggle: (environmentEnabled: boolean) => handleLightingChange({ environmentEnabled }),
    onAmbientLightToggle: (ambientLightEnabled: boolean) => handleLightingChange({ ambientLightEnabled }),
    onDirectionalLightToggle: (directionalLightEnabled: boolean) => handleLightingChange({ directionalLightEnabled }),
    onColorTemperatureChange: (colorTemperature: number) => handleLightingChange({ colorTemperature })
  }

  return (
    <main className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
      {!modelUrl ? (
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <h1 className="text-3xl font-bold mb-6 text-center">
            3D Model Viewer (GLTF/GLB/VRM/VRMA)
          </h1>
          <FileDropZone onFileDrop={handleFileDrop} />
          <footer className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
            <p>Drag and drop a GLTF, GLB, VRM, or VRMA file to view it in 3D</p>
            <p className="mt-1">Use mouse to rotate, scroll to zoom, and right-click to pan</p>
          </footer>
        </div>
      ) : (
        <div className="responsive-container flex min-w-0 overflow-hidden">
          {/* Main Viewer Area */}
          <div className="viewer-container responsive-container">
            {/* Header with controls */}
            <div className="bg-white dark:bg-gray-800 p-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center flex-shrink-0">
              <div className="flex items-center gap-4 min-w-0">
                <h2 className="text-lg font-medium truncate max-w-md">{fileName}</h2>
                <WireframeToggle onToggle={setWireframe} />
                {/* Lighting Controls will be in sidebar */}
              </div>
              <button
                onClick={handleCloseModel}
                className="px-3 py-1 bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-800 rounded-md text-sm transition-colors flex-shrink-0"
              >
                Close Model
              </button>
            </div>

            {/* 3D Viewer */}
            <div className="flex-1 bg-gray-100 dark:bg-gray-800 overflow-hidden min-h-0">
              <ModelViewer 
                modelUrl={modelUrl} 
                onFileDrop={handleFileDrop}
                wireframe={wireframe}
                onAnimationInit={handleAnimationInit}
                onAnimationUpdate={handleAnimationUpdate}
                onSceneReady={handleSceneReady}
                lightingConfig={lightingConfig}
                isAnimationPlaying={isPlaying}
                showPerformanceMonitor={false}
                externalMixer={currentMixer}
              />
            </div>
          </div>

          {/* Info Sidebar */}
          <div className="sidebar-container">
            <InfoSidebar 
              fileName={fileName}
              fileSize={fileSize}
              modelData={modelData}
              animationData={animationData}
              onAnimationControl={animationControls}
              sceneGraphData={sceneGraphData}
              materialData={materialData}
              textureData={textureData}
              lightingData={lightingData}
              isOpen={true}
            />
          </div>
        </div>
      )}
    </main>
  )
}

// %%%%%LAST%%%%%