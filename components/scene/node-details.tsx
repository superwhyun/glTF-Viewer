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

interface NodeDetailsProps {
  selectedNode: SceneNode | null
}

export function NodeDetails({ selectedNode }: NodeDetailsProps) {
  if (!selectedNode) {
    return (
      <div className="p-4 border rounded-lg bg-card">
        <h3 className="text-lg font-semibold mb-3">Node Details</h3>
        <p className="text-muted-foreground text-sm">Select a node to view details</p>
      </div>
    )
  }

  const formatVector = (vector?: [number, number, number]): string => {
    if (!vector) return "N/A"
    return `(${vector[0].toFixed(3)}, ${vector[1].toFixed(3)}, ${vector[2].toFixed(3)})`
  }

  const getObjectDetails = () => {
    const obj = selectedNode.object
    if (!obj) return null

    const details: { [key: string]: any } = {}

    // Common properties
    details["Visible"] = selectedNode.visible ? "Yes" : "No"
    details["Type"] = selectedNode.type

    // Transform properties
    if (selectedNode.position) {
      details["Position"] = formatVector(selectedNode.position)
    }
    if (selectedNode.rotation) {
      details["Rotation"] = formatVector(selectedNode.rotation)
    }
    if (selectedNode.scale) {
      details["Scale"] = formatVector(selectedNode.scale)
    }

    // Type-specific properties
    if (obj.isMesh) {
      if (obj.geometry) {
        const geo = obj.geometry
        if (geo.attributes.position) {
          details["Vertices"] = geo.attributes.position.count
        }
        if (geo.index) {
          details["Triangles"] = Math.floor(geo.index.count / 3)
        }
      }
      if (obj.material) {
        if (Array.isArray(obj.material)) {
          details["Materials"] = obj.material.length
        } else {
          details["Material"] = obj.material.name || obj.material.type
        }
      }
    }

    if (obj.isLight) {
      details["Light Type"] = obj.type
      details["Intensity"] = obj.intensity
      if (obj.color) {
        details["Color"] = `#${obj.color.getHexString()}`
      }
    }

    if (obj.isCamera) {
      details["Camera Type"] = obj.type
      if (obj.fov !== undefined) {
        details["FOV"] = `${obj.fov}°`
      }
      if (obj.near !== undefined) {
        details["Near"] = obj.near
      }
      if (obj.far !== undefined) {
        details["Far"] = obj.far
      }
    }

    if (obj.isMaterial) {
      details["Material Type"] = obj.type
      if (obj.color) {
        details["Color"] = `#${obj.color.getHexString()}`
      }
      if (obj.metalness !== undefined) {
        details["Metalness"] = obj.metalness
      }
      if (obj.roughness !== undefined) {
        details["Roughness"] = obj.roughness
      }
      if (obj.transparent !== undefined) {
        details["Transparent"] = obj.transparent ? "Yes" : "No"
      }
      if (obj.opacity !== undefined) {
        details["Opacity"] = obj.opacity
      }
    }

    if (obj.isBufferGeometry) {
      const attributes = Object.keys(obj.attributes)
      details["Attributes"] = attributes.join(", ")
      if (obj.index) {
        details["Indexed"] = "Yes"
        details["Indices"] = obj.index.count
      } else {
        details["Indexed"] = "No"
      }
    }

    return details
  }

  const objectDetails = getObjectDetails()

  return (
    <div className="p-4 border rounded-lg bg-card">
      <h3 className="text-lg font-semibold mb-3">Node Details</h3>
      
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Name:</span>
          <span className="font-medium">{selectedNode.name}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-muted-foreground">ID:</span>
          <span className="font-medium text-xs">{selectedNode.id}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-muted-foreground">Children:</span>
          <span className="font-medium">{selectedNode.children.length}</span>
        </div>
      </div>

      {objectDetails && (
        <>
          <hr className="my-3" />
          <div className="space-y-2 text-sm">
            {Object.entries(objectDetails).map(([key, value]) => (
              <div key={key} className="flex justify-between">
                <span className="text-muted-foreground">{key}:</span>
                <span className="font-medium text-right max-w-32 truncate" title={String(value)}>
                  {String(value)}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// %%%%%LAST%%%%%