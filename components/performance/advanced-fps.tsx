"use client"

import { useState, useEffect, useRef, useCallback } from "react"

interface RealTimeFPSProps {
  onFPSUpdate?: (fps: number, renderTime: number) => void
}

export function RealTimeFPS({ onFPSUpdate }: RealTimeFPSProps) {
  const [fps, setFPS] = useState(0)
  const [renderTime, setRenderTime] = useState(0)
  const frameCount = useRef(0)
  const lastTime = useRef(performance.now())
  const totalRenderTime = useRef(0)
  
  const measureFrame = useCallback(() => {
    const startTime = performance.now()
    
    // Use setTimeout instead of requestAnimationFrame for less frequent updates
    setTimeout(() => {
      const endTime = performance.now()
      const frameRenderTime = endTime - startTime
      
      frameCount.current++
      totalRenderTime.current += frameRenderTime
      
      const currentTime = performance.now()
      const deltaTime = currentTime - lastTime.current
      
      // Update less frequently (every 1.5 seconds)
      if (deltaTime >= 1500) {
        const calculatedFPS = Math.round((frameCount.current * 1000) / deltaTime)
        const avgRenderTime = totalRenderTime.current / frameCount.current
        
        setFPS(calculatedFPS)
        setRenderTime(Math.round(avgRenderTime * 100) / 100)
        
        if (onFPSUpdate) {
          onFPSUpdate(calculatedFPS, avgRenderTime)
        }
        
        frameCount.current = 0
        totalRenderTime.current = 0
        lastTime.current = currentTime
      }
      
      // Continue measuring with longer intervals
      measureFrame()
    }, 100) // Measure every 100ms instead of every frame
  }, [onFPSUpdate])

  useEffect(() => {
    measureFrame()
  }, [measureFrame])

  return null
}

export function AdvancedFPSDisplay() {
  const [fps, setFPS] = useState(0)
  const [renderTime, setRenderTime] = useState(0)
  const [memoryInfo, setMemoryInfo] = useState<any>(null)
  const [webglInfo, setWebGLInfo] = useState<any>(null)
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    // Get WebGL info
    const canvas = document.querySelector('canvas')
    if (canvas) {
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl')
      if (gl) {
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info')
        if (debugInfo) {
          setWebGLInfo({
            vendor: gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL),
            renderer: gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL),
            version: gl.getParameter(gl.VERSION),
            maxTextures: gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS)
          })
        }
      }
    }

    // Memory monitoring
    if ((performance as any).memory) {
      const updateMemory = () => {
        const memory = (performance as any).memory
        setMemoryInfo({
          used: Math.round(memory.usedJSHeapSize / 1024 / 1024),
          total: Math.round(memory.totalJSHeapSize / 1024 / 1024),
          limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024)
        })
      }
      
      updateMemory()
      const interval = setInterval(updateMemory, 1000)
      return () => clearInterval(interval)
    }
  }, [])

  // Toggle with keyboard
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'F' && e.shiftKey) {
        setIsVisible(prev => !prev)
      }
    }
    
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [])

  const handleFPSUpdate = (newFPS: number, newRenderTime: number) => {
    setFPS(newFPS)
    setRenderTime(newRenderTime)
  }

  if (!isVisible) return null

  const fpsColor = fps >= 50 ? "text-green-400" : fps >= 30 ? "text-yellow-400" : "text-red-400"

  return (
    <>
      <RealTimeFPS onFPSUpdate={handleFPSUpdate} />
      <div className="fixed top-4 right-4 z-50 bg-gray-900/95 text-white p-4 rounded-lg text-sm font-mono backdrop-blur border border-gray-700 max-w-xs">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs text-gray-400 uppercase tracking-wide">Performance</h3>
          <span className="text-xs text-gray-500">Shift+F</span>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-300">FPS:</span>
            <span className={`font-bold ${fpsColor}`}>{fps}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-300">Frame Time:</span>
            <span className="text-blue-400">{renderTime}ms</span>
          </div>
          
          {memoryInfo && (
            <>
              <div className="flex justify-between">
                <span className="text-gray-300">Memory:</span>
                <span className="text-purple-400">{memoryInfo.used}MB</span>
              </div>
              
              <div className="w-full bg-gray-700 rounded-full h-1.5">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-1.5 rounded-full transition-all duration-300" 
                  style={{ width: `${Math.min(100, (memoryInfo.used / memoryInfo.limit) * 100)}%` }}
                />
              </div>
            </>
          )}
          
          {webglInfo && (
            <div className="text-xs text-gray-500 border-t border-gray-700 pt-2 mt-2">
              <div className="truncate">GPU: {webglInfo.renderer}</div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

// %%%%%LAST%%%%%