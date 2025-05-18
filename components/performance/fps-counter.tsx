"use client"

import { useState, useEffect, useRef } from "react"
import { useFrame, useThree } from "@react-three/fiber"

interface FPSCounterProps {
  onFPSUpdate?: (fps: number) => void
}

export function FPSCounter({ onFPSUpdate }: FPSCounterProps) {
  const frameCount = useRef(0)
  const lastTime = useRef(performance.now())
  const { invalidate } = useThree()

  useFrame((state, delta) => {
    frameCount.current++
    const currentTime = performance.now()
    
    // Force continuous rendering for accurate FPS measurement
    invalidate()
    
    // Update FPS every 1000ms for more accurate measurement
    const deltaTime = currentTime - lastTime.current
    if (deltaTime >= 1000) {
      const calculatedFPS = Math.round((frameCount.current * 1000) / deltaTime)
      
      if (onFPSUpdate) {
        onFPSUpdate(calculatedFPS)
      }
      
      frameCount.current = 0
      lastTime.current = currentTime
    }
  })

  return null
}

export function FPSDisplay({ fps: propsFPS }: { fps?: number }) {
  const [memoryInfo, setMemoryInfo] = useState<any>(null)
  const [isVisible, setIsVisible] = useState(true)
  const fps = propsFPS || 0

  useEffect(() => {
    // Get memory info if available (Chrome only)
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

  // Toggle visibility with keyboard shortcut
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'F' && e.shiftKey) {
        setIsVisible(prev => !prev)
      }
    }
    
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [])

  if (!isVisible) return null

  const fpsColor = fps >= 50 ? "text-green-500" : fps >= 30 ? "text-yellow-500" : "text-red-500"

  return (
    <div className="fixed top-4 right-4 z-50 bg-black/80 text-white p-3 rounded-lg text-sm font-mono backdrop-blur-sm">
      <div className="flex items-center gap-2">
        <div className={`${fpsColor} font-bold`}>
          FPS: {fps}
        </div>
        <div className="text-gray-400 text-xs">
          (Shift+F to toggle)
        </div>
      </div>
      {memoryInfo && (
        <>
          <div className="text-gray-300 text-xs mt-1">
            Memory: {memoryInfo.used}MB / {memoryInfo.total}MB
          </div>
          <div className="w-32 bg-gray-600 rounded-full h-1.5 mt-1">
            <div 
              className="bg-blue-500 h-1.5 rounded-full transition-all" 
              style={{ width: `${(memoryInfo.used / memoryInfo.limit) * 100}%` }}
            />
          </div>
        </>
      )}
    </div>
  )
}

// %%%%%LAST%%%%%