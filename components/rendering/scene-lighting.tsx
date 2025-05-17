import { useRef, useEffect } from "react"
import { useThree } from "@react-three/fiber"
import * as THREE from "three"

interface SceneLightingProps {
  intensity?: number
  environmentEnabled?: boolean
  ambientLightEnabled?: boolean
  directionalLightEnabled?: boolean
  colorTemperature?: number
}

export function SceneLighting({
  intensity = 0.5,
  environmentEnabled = true,
  ambientLightEnabled = true,
  directionalLightEnabled = true,
  colorTemperature = 6500
}: SceneLightingProps) {
  const ambientRef = useRef<THREE.AmbientLight>(null)
  const directionalRef = useRef<THREE.DirectionalLight>(null)
  const { scene } = useThree()

  // Convert color temperature to RGB color
  const temperatureToColor = (kelvin: number): THREE.Color => {
    // Simplified color temperature to RGB conversion
    const temp = kelvin / 100
    let red, green, blue

    if (temp <= 66) {
      red = 255
      green = temp
      green = 99.4708025861 * Math.log(green) - 161.1195681661
      
      if (temp >= 19) {
        blue = temp - 10
        blue = 138.5177312231 * Math.log(blue) - 305.0447927307
      } else {
        blue = 0
      }
    } else {
      red = temp - 60
      red = 329.698727446 * Math.pow(red, -0.1332047592)
      green = temp - 60
      green = 288.1221695283 * Math.pow(green, -0.0755148492)
      blue = 255
    }

    red = Math.max(0, Math.min(255, red)) / 255
    green = Math.max(0, Math.min(255, green)) / 255
    blue = Math.max(0, Math.min(255, blue)) / 255

    return new THREE.Color(red, green, blue)
  }

  useEffect(() => {
    const lightColor = temperatureToColor(colorTemperature)

    // Update ambient light
    if (ambientRef.current) {
      ambientRef.current.visible = ambientLightEnabled
      ambientRef.current.intensity = ambientLightEnabled ? intensity * 0.4 : 0
      ambientRef.current.color = lightColor
    }

    // Update directional light
    if (directionalRef.current) {
      directionalRef.current.visible = directionalLightEnabled
      directionalRef.current.intensity = directionalLightEnabled ? intensity : 0
      directionalRef.current.color = lightColor
    }
  }, [intensity, ambientLightEnabled, directionalLightEnabled, colorTemperature])

  return (
    <>
      {/* Ambient Light */}
      <ambientLight
        ref={ambientRef}
        intensity={ambientLightEnabled ? intensity * 0.4 : 0}
        visible={ambientLightEnabled}
      />
      
      {/* Directional Light */}
      <directionalLight
        ref={directionalRef}
        position={[10, 10, 5]}
        intensity={directionalLightEnabled ? intensity : 0}
        visible={directionalLightEnabled}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
    </>
  )
}

// %%%%%LAST%%%%%