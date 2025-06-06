import { useState, useMemo, useCallback } from "react"
import { Play, Pause, Square, SkipBack, SkipForward, ChevronDown, Upload } from "lucide-react"

interface AnimationPlayerProps {
  animations: Array<{ name: string; duration: number }>
  currentAnimation: string | null
  isPlaying: boolean
  currentTime: number
  playbackSpeed: number
  onPlay: () => void
  onPause: () => void
  onStop: () => void
  onAnimationChange: (name: string) => void
  onTimeChange: (time: number) => void
  onSpeedChange: (speed: number) => void
  onAnimationFileDrop?: (file: File) => void
}

export function AnimationPlayer({
  animations,
  currentAnimation,
  isPlaying,
  currentTime,
  playbackSpeed,
  onPlay,
  onPause,
  onStop,
  onAnimationChange,
  onTimeChange,
  onSpeedChange,
  onAnimationFileDrop
}: AnimationPlayerProps) {
  const [showSpeedMenu, setShowSpeedMenu] = useState(false)
  const [showAnimationMenu, setShowAnimationMenu] = useState(false)
  const [isDraggingAnimation, setIsDraggingAnimation] = useState(false)

  const currentAnimationData = useMemo(() => 
    animations.find(anim => anim.name === currentAnimation),
    [animations, currentAnimation]
  )
  
  const isStaticPose = currentAnimation?.includes('Static Pose')
  const duration = currentAnimationData?.duration || 0
  const progress = useMemo(() => 
    duration > 0 ? (currentTime / duration) * 100 : 0,
    [currentTime, duration]
  )

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const speedOptions = [0.25, 0.5, 1, 1.5, 2]

  // Animation file drop handlers
  const handleAnimationDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDraggingAnimation(true)
  }, [])

  const handleAnimationDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDraggingAnimation(false)
  }, [])

  const handleAnimationDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDraggingAnimation(false)

    if (!onAnimationFileDrop) return

    const files = Array.from(e.dataTransfer.files)
    const animationFile = files.find(file => 
      file.name.endsWith('.glb') || 
      file.name.endsWith('.gltf') || 
      file.name.endsWith('.vrm') ||
      file.name.endsWith('.vrma')
    )

    if (animationFile) {
      onAnimationFileDrop(animationFile)
    }
  }, [onAnimationFileDrop])

  const handleAnimationFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && onAnimationFileDrop) {
      onAnimationFileDrop(file)
    }
    // Reset input value to allow same file to be selected again
    e.target.value = ''
  }, [onAnimationFileDrop])

  if (animations.length === 0) {
    return (
      <div className="p-4 border rounded-lg bg-card">
        <h3 className="text-lg font-semibold mb-3">Animation Player</h3>
        <p className="text-muted-foreground text-sm">No animations found in this model</p>
      </div>
    )
  }

  return (
    <div className="p-4 border rounded-lg bg-card">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold">Animation Player</h3>
        
        {/* Animation Drop Zone */}
        {onAnimationFileDrop && (
          <div className="relative">
            <div
              className={`w-8 h-8 border-2 border-dashed rounded flex items-center justify-center cursor-pointer transition-colors ${
                isDraggingAnimation
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
              }`}
              onDragOver={handleAnimationDragOver}
              onDragLeave={handleAnimationDragLeave}
              onDrop={handleAnimationDrop}
              title="Drop animation file here or click to select"
            >
              <Upload className="w-4 h-4 text-gray-400" />
              <input
                type="file"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                accept=".glb,.gltf,.vrm,.vrma"
                onChange={handleAnimationFileInput}
                title="Select animation file"
              />
            </div>
          </div>
        )}
      </div>
      
      {/* Animation Selector */}
      <div className="mb-4">
        <div className="relative">
          <button
            onClick={() => setShowAnimationMenu(!showAnimationMenu)}
            className="w-full flex items-center justify-between p-2 border rounded bg-background hover:bg-accent"
          >
            <span className="text-sm truncate">
              {currentAnimation || "Select Animation"}
            </span>
            <ChevronDown className={`w-4 h-4 transition-transform ${showAnimationMenu ? "rotate-180" : ""}`} />
          </button>
          
          {showAnimationMenu && (
            <div className="absolute top-full left-0 right-0 mt-1 border rounded bg-background shadow-lg z-10">
              {animations.map((anim) => (
                <button
                  key={anim.name}
                  onClick={() => {
                    onAnimationChange(anim.name)
                    setShowAnimationMenu(false)
                  }}
                  className={`w-full text-left p-2 text-sm hover:bg-accent ${
                    currentAnimation === anim.name ? "bg-accent" : ""
                  }`}
                >
                  <div className="truncate">{anim.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {formatTime(anim.duration)}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
        <div className="relative">
          <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded">
            <div
              className="h-full bg-blue-500 rounded transition-all duration-100"
              style={{ width: `${progress}%` }}
            />
          </div>
          <input
            type="range"
            min={0}
            max={duration}
            step={0.01}
            value={currentTime}
            onChange={(e) => {
              const newTime = parseFloat(e.target.value)
              onTimeChange(newTime)
            }}
            onMouseDown={() => {
              // Temporarily pause animation while dragging
              if (isPlaying) {
                onPause()
              }
            }}
            onMouseUp={() => {
              // Resume if was playing before dragging
              if (!isPlaying && currentTime < duration) {
                onPlay()
              }
            }}
            className="absolute top-0 w-full h-2 bg-transparent appearance-none cursor-pointer opacity-0"
          />
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onTimeChange(0)}
            className="p-2 rounded hover:bg-accent transition-colors"
            title="Go to start"
          >
            <SkipBack className="w-4 h-4" />
          </button>
          
          <button
            onClick={isPlaying ? onPause : onPlay}
            className="p-2 rounded hover:bg-accent transition-colors"
            title={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          
          <button
            onClick={onStop}
            className="p-2 rounded hover:bg-accent transition-colors"
            title="Stop"
          >
            <Square className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => onTimeChange(duration)}
            className="p-2 rounded hover:bg-accent transition-colors"
            title="Go to end"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>

        {/* Speed Control */}
        <div className="relative">
          <button
            onClick={() => setShowSpeedMenu(!showSpeedMenu)}
            className="px-3 py-1 text-sm border rounded hover:bg-accent"
          >
            {playbackSpeed}x
          </button>
          
          {showSpeedMenu && (
            <div className="absolute bottom-full right-0 mb-1 border rounded bg-background shadow-lg">
              {speedOptions.map((speed) => (
                <button
                  key={speed}
                  onClick={() => {
                    onSpeedChange(speed)
                    setShowSpeedMenu(false)
                  }}
                  className={`block w-full text-left px-3 py-1 text-sm hover:bg-accent ${
                    playbackSpeed === speed ? "bg-accent" : ""
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// %%%%%LAST%%%%%