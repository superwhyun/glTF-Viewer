import { useState, useCallback } from "react"

interface SceneNode {
  id: string
  name: string
  type: string
  children: SceneNode[]
  meshId?: number
  materialId?: number
  visible: boolean
  position?: [number, number, number]
  rotation?: [number, number, number]
  scale?: [number, number, number]
  object?: any
}

export function useSceneGraph() {
  const [sceneGraph, setSceneGraph] = useState<SceneNode[]>([])
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set())

  const parseSceneGraph = useCallback((scene: any, gltf?: any) => {
    const nodes: SceneNode[] = []
    let nodeIndex = 0

    const processNode = (object: any, parentId: string = ""): SceneNode => {
      const nodeId = `${parentId}node-${nodeIndex++}`
      
      const node: SceneNode = {
        id: nodeId,
        name: object.name || getObjectTypeName(object),
        type: getObjectType(object),
        children: [],
        visible: object.visible,
        position: object.position ? [object.position.x, object.position.y, object.position.z] : undefined,
        rotation: object.rotation ? [object.rotation.x, object.rotation.y, object.rotation.z] : undefined,
        scale: object.scale ? [object.scale.x, object.scale.y, object.scale.z] : undefined,
        object
      }

      // Add mesh and material info if available
      if (object.isMesh) {
        if (object.geometry) {
          const geometryNode: SceneNode = {
            id: `${nodeId}-geometry`,
            name: object.geometry.name || `Geometry (${getGeometryInfo(object.geometry)})`,
            type: "Geometry",
            children: [],
            visible: true,
            object: object.geometry
          }
          node.children.push(geometryNode)
        }

        if (object.material) {
          const materials = Array.isArray(object.material) ? object.material : [object.material]
          materials.forEach((material, index) => {
            const materialNode: SceneNode = {
              id: `${nodeId}-material-${index}`,
              name: material.name || `Material ${index + 1}`,
              type: "Material",
              children: [],
              visible: true,
              object: material
            }
            node.children.push(materialNode)
          })
        }
      }

      // Process children recursively
      object.children?.forEach((child: any) => {
        node.children.push(processNode(child, nodeId + "-"))
      })

      return node
    }

    const getObjectType = (object: any): string => {
      if (object.isScene) return "Scene"
      if (object.isGroup) return "Group"
      if (object.isMesh) return "Mesh"
      if (object.isLight) return "Light"
      if (object.isCamera) return "Camera"
      if (object.isBone) return "Bone"
      if (object.isSkinnedMesh) return "SkinnedMesh"
      return "Object3D"
    }

    const getObjectTypeName = (object: any): string => {
      const type = getObjectType(object)
      if (type === "Scene") return "Scene"
      if (type === "Group") return "Group"
      if (type === "Mesh") return "Mesh"
      return `${type} Object`
    }

    const getGeometryInfo = (geometry: any): string => {
      if (geometry.isBufferGeometry) {
        const positions = geometry.attributes.position?.count || 0
        const indices = geometry.index?.count || 0
        return `${positions} vertices, ${indices ? Math.floor(indices / 3) : Math.floor(positions / 3)} triangles`
      }
      return "Unknown"
    }

    if (scene) {
      nodes.push(processNode(scene))
      setSceneGraph(nodes)
    }
  }, [])

  const toggleNodeExpanded = useCallback((nodeId: string) => {
    setExpandedNodes(prev => {
      const newExpanded = new Set(prev)
      if (newExpanded.has(nodeId)) {
        newExpanded.delete(nodeId)
      } else {
        newExpanded.add(nodeId)
      }
      return newExpanded
    })
  }, [])

  const toggleNodeVisibility = useCallback((nodeId: string, sceneNodes: SceneNode[]) => {
    const toggleVisibility = (nodes: SceneNode[]): SceneNode[] => {
      return nodes.map(node => {
        if (node.id === nodeId) {
          const newVisible = !node.visible
          // Toggle visibility on the actual Three.js object
          if (node.object && 'visible' in node.object) {
            node.object.visible = newVisible
          }
          return { ...node, visible: newVisible }
        }
        return {
          ...node,
          children: toggleVisibility(node.children)
        }
      })
    }

    setSceneGraph(toggleVisibility(sceneNodes))
  }, [])

  const selectNode = useCallback((nodeId: string | null) => {
    setSelectedNode(nodeId)
  }, [])

  return {
    sceneGraph,
    selectedNode,
    expandedNodes,
    parseSceneGraph,
    toggleNodeExpanded,
    toggleNodeVisibility,
    selectNode
  }
}

// %%%%%LAST%%%%%