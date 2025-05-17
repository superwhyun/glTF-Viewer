import { useState } from "react"
import { ChevronRight, ChevronDown, Eye, EyeOff, Folder, FolderOpen, Box, Zap, Camera } from "lucide-react"

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

interface SceneTreeViewProps {
  sceneGraph: SceneNode[]
  selectedNode: string | null
  expandedNodes: Set<string>
  onNodeSelect: (nodeId: string) => void
  onNodeToggle: (nodeId: string) => void
  onVisibilityToggle: (nodeId: string) => void
}

export function SceneTreeView({
  sceneGraph,
  selectedNode,
  expandedNodes,
  onNodeSelect,
  onNodeToggle,
  onVisibilityToggle
}: SceneTreeViewProps) {
  const getNodeIcon = (type: string, expanded?: boolean) => {
    switch (type) {
      case "Scene":
        return <Folder className="w-4 h-4 text-blue-500" />
      case "Group":
        return expanded ? <FolderOpen className="w-4 h-4 text-orange-500" /> : <Folder className="w-4 h-4 text-orange-500" />
      case "Mesh":
      case "SkinnedMesh":
        return <Box className="w-4 h-4 text-green-500" />
      case "Light":
        return <Zap className="w-4 h-4 text-yellow-500" />
      case "Camera":
        return <Camera className="w-4 h-4 text-purple-500" />
      case "Material":
        return <div className="w-4 h-4 rounded-full bg-red-400" />
      case "Geometry":
        return <div className="w-4 h-4 rounded bg-gray-400" />
      default:
        return <Box className="w-4 h-4 text-gray-400" />
    }
  }

  const renderNode = (node: SceneNode, depth: number = 0) => {
    const isExpanded = expandedNodes.has(node.id)
    const isSelected = selectedNode === node.id
    const hasChildren = node.children.length > 0

    return (
      <div key={node.id}>
        {/* Node row */}
        <div
          className={`flex items-center py-1 px-2 hover:bg-accent rounded cursor-pointer ${
            isSelected ? "bg-accent" : ""
          }`}
          style={{ paddingLeft: `${depth * 20 + 8}px` }}
          onClick={() => onNodeSelect(node.id)}
        >
          {/* Expand/collapse button */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              if (hasChildren) {
                onNodeToggle(node.id)
              }
            }}
            className="mr-1 p-0.5 rounded hover:bg-muted"
            disabled={!hasChildren}
          >
            {hasChildren ? (
              isExpanded ? (
                <ChevronDown className="w-3 h-3" />
              ) : (
                <ChevronRight className="w-3 h-3" />
              )
            ) : (
              <div className="w-3 h-3" />
            )}
          </button>

          {/* Visibility toggle */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              onVisibilityToggle(node.id)
            }}
            className="mr-2 p-0.5 rounded hover:bg-muted"
            title={node.visible ? "Hide" : "Show"}
          >
            {node.visible ? (
              <Eye className="w-3 h-3" />
            ) : (
              <EyeOff className="w-3 h-3 text-gray-400" />
            )}
          </button>

          {/* Node icon */}
          <span className="mr-2">{getNodeIcon(node.type, isExpanded)}</span>

          {/* Node name */}
          <span className={`text-sm truncate ${!node.visible ? "text-gray-400" : ""}`}>
            {node.name}
          </span>

          {/* Node type badge */}
          <span className="ml-auto text-xs text-muted-foreground">
            {node.type}
          </span>
        </div>

        {/* Children */}
        {hasChildren && isExpanded && (
          <div>
            {node.children.map(child => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    )
  }

  if (sceneGraph.length === 0) {
    return (
      <div className="p-4 border rounded-lg bg-card">
        <h3 className="text-lg font-semibold mb-3">Scene Graph</h3>
        <p className="text-muted-foreground text-sm">No scene data available</p>
      </div>
    )
  }

  return (
    <div className="p-4 border rounded-lg bg-card">
      <h3 className="text-lg font-semibold mb-3">Scene Graph</h3>
      <div className="max-h-80 overflow-y-auto">
        {sceneGraph.map(node => renderNode(node))}
      </div>
    </div>
  )
}

// %%%%%LAST%%%%%