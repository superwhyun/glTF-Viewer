import { useState } from "react"
import { Grid } from "lucide-react"

interface WireframeToggleProps {
  onToggle: (wireframe: boolean) => void
  className?: string
}

export function WireframeToggle({ onToggle, className = "" }: WireframeToggleProps) {
  const [wireframe, setWireframe] = useState(false)

  const handleToggle = () => {
    const newWireframe = !wireframe
    setWireframe(newWireframe)
    onToggle(newWireframe)
  }

  return (
    <button
      onClick={handleToggle}
      className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
        wireframe
          ? "bg-blue-500 text-white"
          : "bg-background border hover:bg-accent"
      } ${className}`}
      title={wireframe ? "Disable Wireframe" : "Enable Wireframe"}
    >
      <Grid className="w-4 h-4" />
      <span className="text-sm font-medium">Wireframe</span>
    </button>
  )
}

// %%%%%LAST%%%%%