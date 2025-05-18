import { useState, useCallback, useRef } from "react"
import * as THREE from "three"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"

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
  const lastUpdateTimeRef = useRef<number>(0)
  const currentModelRef = useRef<any>(null) // Store current model reference

  // Clear model reference on reset
  const resetAnimationState = useCallback(() => {
    console.log('🔄 Resetting animation state...')
    
    // Stop and clear all current actions
    if (mixerRef.current) {
      mixerRef.current.stopAllAction()
      mixerRef.current = null
    }
    
    // Clear all actions
    Object.values(actionsRef.current).forEach((action: any) => {
      if (action) {
        action.stop()
        action.enabled = false
      }
    })
    actionsRef.current = {}
    
    // Don't clear model reference - keep it for external animation loading
    // currentModelRef.current = null
    console.log('🔍 Keeping model reference for animation loading:', currentModelRef.current)
    
    // Reset all state
    setAnimations([])
    setCurrentAnimation(null)
    setIsPlaying(false)
    setCurrentTime(0)
    setPlaybackSpeed(1)
    lastUpdateTimeRef.current = 0
    
    console.log('✅ Animation state reset complete')
  }, [])

  const initializeAnimations = useCallback((gltf: any, mixer: any) => {
    console.log('=== Animation Initialization ===')
    console.log('🔍 GLTF object:', gltf)
    console.log('🔍 GLTF scene:', gltf.scene)
    console.log('🔍 GLTF scenes:', gltf.scenes)
    
    // Store model reference for later animation loading
    // Try different ways to get the scene reference
    const sceneRef = gltf.scene || (gltf.scenes && gltf.scenes[0]) || null
    currentModelRef.current = sceneRef
    
    console.log('🔍 Stored model reference:', currentModelRef.current)
    
    // First, completely reset previous state
    resetAnimationState()
    
    if (!gltf.animations || gltf.animations.length === 0) {
      console.log('❌ No animations found in model')
      return
    }

    mixerRef.current = mixer
    const animationList: Animation[] = []
    
    gltf.animations.forEach((clip: any, index: number) => {
      console.log(`Animation ${index}: ${clip.name}, Duration: ${clip.duration}s`)
      
      const action = mixer.clipAction(clip)
      const name = clip.name || `Animation ${index + 1}`
      
      // Set up action properly
      action.setLoop(THREE.LoopRepeat, Infinity)
      action.clampWhenFinished = false
      action.enabled = false
      action.reset()
      
      actionsRef.current[name] = action
      animationList.push({
        name,
        duration: clip.duration,
        action
      })
    })

    console.log(`✅ Initialized ${animationList.length} animations`)
    
    setAnimations(animationList)
    if (animationList.length > 0) {
      const firstAnimation = animationList[0].name
      setCurrentAnimation(firstAnimation)
      
      // Auto-play the first animation using a direct approach
      console.log('🎬 Auto-playing first animation:', firstAnimation)
      setTimeout(() => {
        // Call playAnimation directly here to avoid dependency issues
        if (!mixerRef.current) {
          console.error('❌ No mixer available for auto-play')
          return
        }
        
        const action = actionsRef.current[firstAnimation]
        if (!action) {
          console.error('❌ Animation not found for auto-play:', firstAnimation)
          return
        }

        // Configure and play the animation
        action.stop()
        action.reset()
        action.setLoop(THREE.LoopRepeat, Infinity)
        action.setEffectiveTimeScale(1)
        action.setEffectiveWeight(1.0)
        action.time = 0
        action.enabled = true
        action.paused = false
        mixerRef.current.setTime(0)
        action.play()
        
        // Update state
        setIsPlaying(true)
        setCurrentTime(0)
        
        console.log('✅ Auto-play started for:', firstAnimation)
      }, 100) // Small delay to ensure state is updated
    }
  }, [resetAnimationState]) // Remove playAnimation from dependencies

  const playAnimation = useCallback((animationName?: string) => {
    console.log('🎬 Play animation called:', animationName || currentAnimation)
    console.log('🔍 Current isPlaying state BEFORE:', isPlaying)
    
    if (!mixerRef.current) {
      console.error('❌ No mixer available')
      return
    }
    
    const targetAnimation = animationName || currentAnimation
    const action = actionsRef.current[targetAnimation]
    
    if (!action) {
      console.error('❌ Animation not found:', targetAnimation)
      console.error('Available animations:', Object.keys(actionsRef.current))
      return
    }

    console.log('🔍 Before action setup:', {
      isRunning: action.isRunning(),
      enabled: action.enabled,
      paused: action.paused,
      time: action.time,
      weight: action.getEffectiveWeight(),
      timeScale: action.getEffectiveTimeScale()
    })

    // Stop and disable all other animations
    Object.entries(actionsRef.current).forEach(([name, otherAction]: [string, any]) => {
      if (name !== targetAnimation && otherAction) {
        otherAction.stop()
        otherAction.enabled = false
        otherAction.reset()
      }
    })

    // Configure action in proper order
    console.log('🔧 Configuring action in proper order...')
    
    // First, stop and reset
    action.stop()
    action.reset()
    
    // Set loop mode first (before enabling)
    action.setLoop(THREE.LoopRepeat, Infinity)
    
    // Set time scale and weight
    action.setEffectiveTimeScale(playbackSpeed)
    action.setEffectiveWeight(1.0)
    
    // Set time to 0
    action.time = 0
    
    // Enable and unpause
    action.enabled = true
    action.paused = false
    
    // Reset mixer time
    mixerRef.current.setTime(0)
    
    // Finally, play
    action.play()
    
    console.log('✅ After action setup:', {
      isRunning: action.isRunning(),
      enabled: action.enabled,
      paused: action.paused,
      time: action.time,
      weight: action.getEffectiveWeight(),
      timeScale: action.getEffectiveTimeScale(),
      duration: action.getClip().duration
    })
    
    // Set the React state
    console.log('📝 Setting isPlaying to true...')
    setIsPlaying(true)
    setCurrentAnimation(targetAnimation)
    setCurrentTime(0)
    
    // Verify mixer state
    console.log('🔄 Mixer state:', {
      time: mixerRef.current.time,
      timeScale: mixerRef.current.timeScale
    })
  }, [currentAnimation, playbackSpeed, isPlaying])

  const pauseAnimation = useCallback(() => {
    if (currentAnimation && actionsRef.current[currentAnimation]) {
      const action = actionsRef.current[currentAnimation]
      action.paused = true
      setIsPlaying(false)
    }
  }, [currentAnimation])

  const resumeAnimation = useCallback(() => {
    if (currentAnimation && actionsRef.current[currentAnimation]) {
      const action = actionsRef.current[currentAnimation]
      action.paused = false
      setIsPlaying(true)
    }
  }, [currentAnimation])

  const stopAnimation = useCallback(() => {
    if (currentAnimation && actionsRef.current[currentAnimation]) {
      const action = actionsRef.current[currentAnimation]
      action.stop()
      action.reset()
      setIsPlaying(false)
      setCurrentTime(0)
      lastUpdateTimeRef.current = 0
    }
  }, [currentAnimation])

  const setAnimationTime = useCallback((time: number) => {
    if (currentAnimation && actionsRef.current[currentAnimation]) {
      const action = actionsRef.current[currentAnimation]
      
      // Don't allow setting time to reset playing state unexpectedly
      const wasPlaying = action.isRunning()
      action.time = Math.max(0, Math.min(time, action.getClip().duration))
      
      // If animation was playing, make sure it continues playing
      if (wasPlaying && !action.isRunning()) {
        action.play()
      }
      
      setCurrentTime(action.time)
    }
  }, [currentAnimation])

  const changePlaybackSpeed = useCallback((speed: number) => {
    setPlaybackSpeed(speed)
    if (currentAnimation && actionsRef.current[currentAnimation]) {
      actionsRef.current[currentAnimation].setEffectiveTimeScale(speed)
    }
  }, [currentAnimation])

  const updateTime = useCallback(() => {
    if (!mixerRef.current || !currentAnimation || !actionsRef.current[currentAnimation]) {
      return
    }

    const now = Date.now()
    if (now - lastUpdateTimeRef.current < 16) return // ~60 FPS

    const action = actionsRef.current[currentAnimation]
    if (action && action.isRunning()) {
      const newTime = action.time
      const duration = action.getClip().duration
      
      setCurrentTime(newTime)
      lastUpdateTimeRef.current = now
      
      // Check if animation has finished
      if (newTime >= duration && !action.loop) {
        setIsPlaying(false)
      }
    }
  }, [currentAnimation])

  // Add function to load external animation file
  const loadAnimationFile = useCallback(async (file: File) => {
    console.log('🔄 loadAnimationFile called with:', file.name)
    console.log('🔍 Current model reference:', currentModelRef.current)
    console.log('🔍 Current mixer reference:', mixerRef.current)
    console.log('🔍 Current animations:', animations.length)
    
    if (!currentModelRef.current) {
      console.error('❌ No model loaded, cannot apply animation')
      console.error('🔍 Debug info:')
      console.error('  - currentModelRef.current:', currentModelRef.current)
      console.error('  - mixerRef.current:', mixerRef.current)
      console.error('  - animations.length:', animations.length)
      return
    }

    try {
      console.log('🔄 Loading animation file:', file.name)
      
      const loader = new GLTFLoader()
      const url = URL.createObjectURL(file)
      
      return new Promise<void>((resolve, reject) => {
        loader.load(
          url,
          (gltf) => {
            // Clean up URL
            URL.revokeObjectURL(url)
            
            if (!gltf.animations || gltf.animations.length === 0) {
              console.warn('⚠️ No animations found in file')
              reject(new Error('No animations found in the file'))
              return
            }

            // Stop current animations
            if (mixerRef.current) {
              mixerRef.current.stopAllAction()
            }

            // Create new mixer with current model
            const newMixer = new THREE.AnimationMixer(currentModelRef.current)
            mixerRef.current = newMixer

            // Add new animations
            const newAnimations: Animation[] = []
            actionsRef.current = {}

            gltf.animations.forEach((clip: any, index: number) => {
              console.log(`New Animation ${index}: ${clip.name}, Duration: ${clip.duration}s`)
              
              const action = newMixer.clipAction(clip)
              const name = clip.name || `Animation ${index + 1}`
              
              // Set up action properly
              action.setLoop(THREE.LoopRepeat, Infinity)
              action.clampWhenFinished = false
              action.enabled = false
              action.reset()
              
              actionsRef.current[name] = action
              newAnimations.push({
                name,
                duration: clip.duration,
                action
              })
            })

            console.log(`✅ Loaded ${newAnimations.length} new animations`)
            
            // Update state
            setAnimations(newAnimations)
            setIsPlaying(false)
            setCurrentTime(0)
            
            if (newAnimations.length > 0) {
              const firstAnimation = newAnimations[0].name
              setCurrentAnimation(firstAnimation)
              
              // Auto-play the first new animation
              setTimeout(() => {
                const action = actionsRef.current[firstAnimation]
                if (action) {
                  action.stop()
                  action.reset()
                  action.setLoop(THREE.LoopRepeat, Infinity)
                  action.setEffectiveTimeScale(playbackSpeed)
                  action.setEffectiveWeight(1.0)
                  action.time = 0
                  action.enabled = true
                  action.paused = false
                  newMixer.setTime(0)
                  action.play()
                  
                  setIsPlaying(true)
                  setCurrentTime(0)
                  
                  console.log('✅ Auto-playing new animation:', firstAnimation)
                }
              }, 100)
            }
            
            resolve()
          },
          (progress) => {
            console.log('Loading progress:', (progress.loaded / progress.total * 100) + '%')
          },
          (error) => {
            console.error('❌ Error loading animation file:', error)
            URL.revokeObjectURL(url)
            reject(error)
          }
        )
      })
    } catch (error) {
      console.error('❌ Failed to load animation file:', error)
      throw error
    }
  }, [playbackSpeed])

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
    setCurrentAnimation,
    resetAnimationState,
    loadAnimationFile,
    currentMixer: mixerRef.current // Export current mixer
  }
}

// %%%%%LAST%%%%%