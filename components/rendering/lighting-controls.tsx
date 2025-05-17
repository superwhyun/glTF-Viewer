import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Sun, Lightbulb, Palette } from "lucide-react"

interface LightingControlsProps {
  onIntensityChange?: (intensity: number) => void
  onEnvironmentToggle?: (enabled: boolean) => void
  onAmbientLightToggle?: (enabled: boolean) => void
  onDirectionalLightToggle?: (enabled: boolean) => void
  onColorTemperatureChange?: (temperature: number) => void
  initialIntensity?: number
  initialEnvironment?: boolean
  initialAmbient?: boolean
  initialDirectional?: boolean
  initialColorTemperature?: number
}

export function LightingControls({
  onIntensityChange = () => {},
  onEnvironmentToggle = () => {},
  onAmbientLightToggle = () => {},
  onDirectionalLightToggle = () => {},
  onColorTemperatureChange = () => {},
  initialIntensity = 0.5,
  initialEnvironment = true,
  initialAmbient = true,
  initialDirectional = true,
  initialColorTemperature = 6500
}: LightingControlsProps) {
  const [intensity, setIntensity] = useState(initialIntensity)
  const [environmentLight, setEnvironmentLight] = useState(initialEnvironment)
  const [ambientLight, setAmbientLight] = useState(initialAmbient)
  const [directionalLight, setDirectionalLight] = useState(initialDirectional)
  const [colorTemperature, setColorTemperature] = useState(initialColorTemperature)

  const handleIntensityChange = (value: number[]) => {
    const newIntensity = value[0]
    setIntensity(newIntensity)
    onIntensityChange(newIntensity)
  }

  const handleEnvironmentToggle = (checked: boolean) => {
    setEnvironmentLight(checked)
    onEnvironmentToggle(checked)
  }

  const handleAmbientToggle = (checked: boolean) => {
    setAmbientLight(checked)
    onAmbientLightToggle(checked)
  }

  const handleDirectionalToggle = (checked: boolean) => {
    setDirectionalLight(checked)
    onDirectionalLightToggle(checked)
  }

  const handleColorTemperatureChange = (value: number[]) => {
    const newTemp = value[0]
    setColorTemperature(newTemp)
    onColorTemperatureChange(newTemp)
  }

  const resetToDefaults = () => {
    setIntensity(0.5)
    setEnvironmentLight(true)
    setAmbientLight(true)
    setDirectionalLight(true)
    setColorTemperature(6500)
    onIntensityChange(0.5)
    onEnvironmentToggle(true)
    onAmbientLightToggle(true)
    onDirectionalLightToggle(true)
    onColorTemperatureChange(6500)
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Lightbulb className="w-4 h-4" />
          Lighting Controls
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Environment Light */}
        <div className="flex items-center justify-between">
          <Label htmlFor="environment-light" className="text-sm">
            Environment
          </Label>
          <Switch
            id="environment-light"
            checked={environmentLight}
            onCheckedChange={handleEnvironmentToggle}
          />
        </div>

        {/* Overall Intensity */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">
            Intensity ({intensity.toFixed(2)})
          </Label>
          <Slider
            value={[intensity]}
            onValueChange={handleIntensityChange}
            max={2}
            min={0}
            step={0.1}
            className="w-full"
          />
        </div>

        {/* Ambient Light */}
        <div className="flex items-center justify-between">
          <Label htmlFor="ambient-light" className="text-sm">
            Ambient Light
          </Label>
          <Switch
            id="ambient-light"
            checked={ambientLight}
            onCheckedChange={handleAmbientToggle}
          />
        </div>

        {/* Directional Light */}
        <div className="flex items-center justify-between">
          <Label htmlFor="directional-light" className="text-sm">
            Directional Light
          </Label>
          <Switch
            id="directional-light"
            checked={directionalLight}
            onCheckedChange={handleDirectionalToggle}
          />
        </div>

        {/* Color Temperature */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground flex items-center gap-1">
            <Palette className="w-3 h-3" />
            Color Temperature ({colorTemperature}K)
          </Label>
          <Slider
            value={[colorTemperature]}
            onValueChange={handleColorTemperatureChange}
            max={10000}
            min={2700}
            step={100}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Warm</span>
            <span>Neutral</span>
            <span>Cool</span>
          </div>
        </div>

        {/* Reset Button */}
        <Button
          onClick={resetToDefaults}
          variant="outline"
          size="sm"
          className="w-full"
        >
          <Sun className="w-3 h-3 mr-1" />
          Reset to Defaults
        </Button>
      </CardContent>
    </Card>
  )
}

// %%%%%LAST%%%%%