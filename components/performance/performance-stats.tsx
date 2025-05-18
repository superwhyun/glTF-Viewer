"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface PerformanceStatsProps {
  modelInfo?: {
    vertices?: number
    triangles?: number
    textures?: number
    materials?: number
  }
}

export function PerformanceStats({ modelInfo }: PerformanceStatsProps) {
  const [renderInfo, setRenderInfo] = useState<any>(null)
  const [memoryInfo, setMemoryInfo] = useState<any>(null)

  useEffect(() => {
    const updateStats = () => {
      // WebGL Render Info (if available)
      const canvas = document.querySelector('canvas')
      if (canvas) {
        const gl = canvas.getContext('webgl2') || canvas.getContext('webgl')
        if (gl) {
          const debugInfo = gl.getExtension('WEBGL_debug_renderer_info')
          if (debugInfo) {
            setRenderInfo({
              vendor: gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL),
              renderer: gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL),
              maxTextures: gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS),
              maxVertexAttribs: gl.getParameter(gl.MAX_VERTEX_ATTRIBS)
            })
          }
        }
      }

      // Memory Info (Chrome only)
      if ((performance as any).memory) {
        const memory = (performance as any).memory
        setMemoryInfo({
          used: (memory.usedJSHeapSize / 1024 / 1024).toFixed(1),
          total: (memory.totalJSHeapSize / 1024 / 1024).toFixed(1),
          limit: (memory.jsHeapSizeLimit / 1024 / 1024).toFixed(1)
        })
      }
    }

    updateStats()
    const interval = setInterval(updateStats, 2000)
    return () => clearInterval(interval)
  }, [])

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-sm">Performance Statistics</CardTitle>
      </CardHeader>
      <CardContent className="text-xs space-y-3">
        {/* Model Statistics */}
        {modelInfo && (
          <div>
            <h4 className="font-semibold mb-1">Model Info:</h4>
            <div className="grid grid-cols-2 gap-1">
              {modelInfo.vertices && <div>Vertices: {modelInfo.vertices.toLocaleString()}</div>}
              {modelInfo.triangles && <div>Triangles: {modelInfo.triangles.toLocaleString()}</div>}
              {modelInfo.textures && <div>Textures: {modelInfo.textures}</div>}
              {modelInfo.materials && <div>Materials: {modelInfo.materials}</div>}
            </div>
          </div>
        )}

        {/* Memory Usage */}
        {memoryInfo && (
          <div>
            <h4 className="font-semibold mb-1">Memory Usage:</h4>
            <div>Used: {memoryInfo.used} MB</div>
            <div>Total: {memoryInfo.total} MB</div>
            <div>Limit: {memoryInfo.limit} MB</div>
            <div className="mt-1">
              <div className="w-full bg-gray-200 rounded h-2">
                <div 
                  className="bg-blue-500 h-2 rounded" 
                  style={{ width: `${(parseFloat(memoryInfo.used) / parseFloat(memoryInfo.limit) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* WebGL Info */}
        {renderInfo && (
          <div>
            <h4 className="font-semibold mb-1">WebGL Info:</h4>
            <div className="break-all">
              <div>GPU: {renderInfo.renderer}</div>
              <div>Vendor: {renderInfo.vendor}</div>
              <div>Max Textures: {renderInfo.maxTextures}</div>
              <div>Max Vertex Attribs: {renderInfo.maxVertexAttribs}</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// %%%%%LAST%%%%%