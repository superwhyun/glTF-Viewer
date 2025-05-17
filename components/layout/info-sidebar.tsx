import { useState } from "react"
import { ChevronRight, Info } from "lucide-react"
import { ModelMetadata } from "../info/model-metadata"
import { StructureInfo } from "../info/structure-info"
import { AnimationPlayer } from "../animation/animation-player"
import { SceneTreeView } from "../scene/scene-tree-view"
import { NodeDetails } from "../scene/node-details"
import { MaterialPanel } from "../materials/material-panel"
import { TextureGallery } from "../materials/texture-gallery"
import { TextureDetails } from "../materials/texture-details"
import { LightingControls } from "../rendering/lighting-controls"
import { ExtensionList } from "../info/extension-list"
import { MaterialInfo, TextureInfo } from "@/lib/material-utils"

interface SceneNode {
  id: string
  name: string
  type: string
  children: SceneNode[]
  visible: boolean
  position?: [number, number, number]
  rotation?: [number, number, number]
  scale?: [number, number, number]
  object?: any
}

interface InfoSidebarProps {
  fileName?: string
  fileSize?: number
  modelData?: any
  animationData?: any
  onAnimationControl?: any
  sceneGraphData?: {
    sceneGraph: SceneNode[]
    selectedNode: string | null
    expandedNodes: Set<string>
    onNodeSelect: (nodeId: string) => void
    onNodeToggle: (nodeId: string) => void
    onVisibilityToggle: (nodeId: string) => void
  }
  materialData?: {
    materials: MaterialInfo[]
    selectedMaterial: string | null
    onMaterialSelect: (materialName: string) => void
  }
  textureData?: {
    textures: TextureInfo[]
    texturesByType: { [key: string]: TextureInfo[] }
    selectedTexture: string | null
    selectedTextureInfo: TextureInfo | null
    onTextureSelect: (textureName: string) => void
  }
  lightingData?: {
    intensity: number
    environmentEnabled: boolean
    ambientLightEnabled: boolean
    directionalLightEnabled: boolean
    colorTemperature: number
    onIntensityChange: (intensity: number) => void
    onEnvironmentToggle: (enabled: boolean) => void
    onAmbientLightToggle: (enabled: boolean) => void
    onDirectionalLightToggle: (enabled: boolean) => void
    onColorTemperatureChange: (temperature: number) => void
  }
  isOpen?: boolean
}

export function InfoSidebar({ 
  fileName = "", 
  fileSize = 0, 
  modelData, 
  animationData,
  onAnimationControl,
  sceneGraphData,
  materialData,
  textureData,
  lightingData,
  isOpen = true 
}: InfoSidebarProps) {
  const [collapsed, setCollapsed] = useState(!isOpen)

  // Find selected node object
  const findSelectedNode = (nodes: SceneNode[], targetId: string): SceneNode | null => {
    for (const node of nodes) {
      if (node.id === targetId) return node
      const found = findSelectedNode(node.children, targetId)
      if (found) return found
    }
    return null
  }

  const selectedNodeObject = sceneGraphData?.selectedNode 
    ? findSelectedNode(sceneGraphData.sceneGraph, sceneGraphData.selectedNode)
    : null

  return (
    <div
      className={`h-full bg-background border-l transition-all duration-300 sidebar-container ${
        collapsed ? "w-12" : "w-80"
      }`}
      onWheel={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Toggle Button */}
      <div className="p-3 border-b flex-shrink-0">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-center w-full h-8 rounded hover:bg-accent transition-colors"
        >
          {collapsed ? (
            <Info className="w-5 h-5" />
          ) : (
            <div className="flex items-center justify-between w-full min-w-0">
              <span className="font-medium truncate">Model Information</span>
              <ChevronRight className={`w-4 h-4 transition-transform flex-shrink-0 ${collapsed ? "" : "rotate-180"}`} />
            </div>
          )}
        </button>
      </div>

      {/* Content */}
      {!collapsed && (
        <div className="p-4 space-y-4 overflow-y-auto h-[calc(100%-60px)] min-h-0">
          <ModelMetadata fileName={fileName} fileSize={fileSize} modelData={modelData} />
          <StructureInfo modelData={modelData} />
          
          {/* Extension List */}
          <ExtensionList modelData={modelData} />
          
          {/* Lighting Controls */}
          {lightingData && (
            <LightingControls
              onIntensityChange={lightingData.onIntensityChange}
              onEnvironmentToggle={lightingData.onEnvironmentToggle}
              onAmbientLightToggle={lightingData.onAmbientLightToggle}
              onDirectionalLightToggle={lightingData.onDirectionalLightToggle}
              onColorTemperatureChange={lightingData.onColorTemperatureChange}
              initialIntensity={lightingData.intensity}
              initialEnvironment={lightingData.environmentEnabled}
              initialAmbient={lightingData.ambientLightEnabled}
              initialDirectional={lightingData.directionalLightEnabled}
              initialColorTemperature={lightingData.colorTemperature}
            />
          )}
          
          {/* Material Panel */}
          {materialData && (
            <MaterialPanel
              materials={materialData.materials}
              selectedMaterial={materialData.selectedMaterial}
              onMaterialSelect={materialData.onMaterialSelect}
            />
          )}
          
          {/* Texture Gallery */}
          {textureData && (
            <TextureGallery
              textures={textureData.textures}
              texturesByType={textureData.texturesByType}
              selectedTexture={textureData.selectedTexture}
              onTextureSelect={textureData.onTextureSelect}
            />
          )}
          
          {/* Texture Details */}
          {textureData && (
            <TextureDetails texture={textureData.selectedTextureInfo} />
          )}
          
          {/* Scene Graph */}
          {sceneGraphData && (
            <SceneTreeView
              sceneGraph={sceneGraphData.sceneGraph}
              selectedNode={sceneGraphData.selectedNode}
              expandedNodes={sceneGraphData.expandedNodes}
              onNodeSelect={sceneGraphData.onNodeSelect}
              onNodeToggle={sceneGraphData.onNodeToggle}
              onVisibilityToggle={sceneGraphData.onVisibilityToggle}
            />
          )}
          
          {/* Node Details */}
          {sceneGraphData && (
            <NodeDetails selectedNode={selectedNodeObject} />
          )}
          
          {/* Animation Player */}
          {animationData && (
            <AnimationPlayer
              animations={animationData.animations || []}
              currentAnimation={animationData.currentAnimation}
              isPlaying={animationData.isPlaying || false}
              currentTime={animationData.currentTime || 0}
              playbackSpeed={animationData.playbackSpeed || 1}
              onPlay={onAnimationControl?.onPlay || (() => {})}
              onPause={onAnimationControl?.onPause || (() => {})}
              onStop={onAnimationControl?.onStop || (() => {})}
              onAnimationChange={onAnimationControl?.onAnimationChange || (() => {})}
              onTimeChange={onAnimationControl?.onTimeChange || (() => {})}
              onSpeedChange={onAnimationControl?.onSpeedChange || (() => {})}
            />
          )}
        </div>
      )}
    </div>
  )
}

// %%%%%LAST%%%%%