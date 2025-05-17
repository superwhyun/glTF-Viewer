import { useState, useCallback, useRef } from "react"

interface Animation {
  name: string
  duration: number
  action?: any
}

export function useAnimation() {
  const [animations, setAnimations] = useState<Animation[]>([])
  const [currentAnimation, setCurrentAnimation] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const mixerRef = useRef<any>(null)
  const actionsRef = useRef<{ [key: string]: any }>({})

  const initializeAnimations = useCallback((gltf: any, mixer: any) => {
    if (!gltf.animations || gltf.animations.length === 0) {
      setAnimations([])
      return
    }

    mixerRef.current = mixer
    const animationList: Animation[] = []
    
    gltf.animations.forEach((clip: any, index: number) => {
      const action = mixer.clipAction(clip)
      const name = clip.name || `Animation ${index + 1}`
      
      actionsRef.current[name] = action
      animationList.push({
        name,
        duration: clip.duration,
        action
      })
    })

    setAnimations(animationList)
    if (animationList.length > 0) {
      setCurrentAnimation(animationList[0].name)
    }
  }, [])

  const playAnimation = useCallback((animationName?: string) => {
    const targetAnimation = animationName || currentAnimation
    if (!targetAnimation || !actionsRef.current[targetAnimation]) return

    // Stop all other animations
    Object.values(actionsRef.current).forEach((action: any) => {
      action.stop()
    })

    // Play the selected animation
    const action = actionsRef.current[targetAnimation]
    action.reset()
    action.setEffectiveTimeScale(playbackSpeed)
    action.play()
    
    setIsPlaying(true)
    setCurrentAnimation(targetAnimation)
  }, [currentAnimation, playbackSpeed])

  const pauseAnimation = useCallback(() => {
    if (currentAnimation && actionsRef.current[currentAnimation]) {
      actionsRef.current[currentAnimation].paused = true
      setIsPlaying(false)
    }
  }, [currentAnimation])

  const resumeAnimation = useCallback(() => {
    if (currentAnimation && actionsRef.current[currentAnimation]) {
      actionsRef.current[currentAnimation].paused = false
      setIsPlaying(true)
    }
  }, [currentAnimation])

  const stopAnimation = useCallback(() => {
    if (currentAnimation && actionsRef.current[currentAnimation]) {
      actionsRef.current[currentAnimation].stop()
      setIsPlaying(false)
      setCurrentTime(0)
    }
  }, [currentAnimation])

  const setAnimationTime = useCallback((time: number) => {
    if (currentAnimation && actionsRef.current[currentAnimation]) {
      const action = actionsRef.current[currentAnimation]
      action.time = time
      setCurrentTime(time)
    }
  }, [currentAnimation])

  const changePlaybackSpeed = useCallback((speed: number) => {
    setPlaybackSpeed(speed)
    if (currentAnimation && actionsRef.current[currentAnimation]) {
      actionsRef.current[currentAnimation].setEffectiveTimeScale(speed)
    }
  }, [currentAnimation])

  const updateTime = useCallback(() => {
    if (currentAnimation && actionsRef.current[currentAnimation] && isPlaying) {
      const action = actionsRef.current[currentAnimation]
      setCurrentTime(action.time)
    }
  }, [currentAnimation, isPlaying])

  return {
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
    updateTime,
    setCurrentAnimation
  }
}

// %%%%%LAST%%%%%