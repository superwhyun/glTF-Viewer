import { Badge } from "@/components/ui/badge"
import { CheckCircle, AlertCircle, Info } from "lucide-react"
import { GLTFExtension } from "@/lib/extension-utils"

interface ExtensionItemProps {
  extension: GLTFExtension
}

export function ExtensionItem({ extension }: ExtensionItemProps) {
  const getStatusIcon = () => {
    if (extension.required && !extension.supported) {
      return <AlertCircle className="w-3 h-3 text-red-500" />
    }
    if (extension.supported) {
      return <CheckCircle className="w-3 h-3 text-green-500" />
    }
    return <Info className="w-3 h-3 text-yellow-500" />
  }

  const getStatusColor = () => {
    if (extension.required && !extension.supported) return "destructive"
    if (extension.supported) return "default"
    return "secondary"
  }

  return (
    <div className="flex items-center justify-between p-2 rounded border bg-muted/30">
      <div className="flex items-center gap-2 min-w-0">
        {getStatusIcon()}
        <span className="text-xs font-mono truncate">{extension.name}</span>
      </div>
      <Badge variant={getStatusColor()} className="text-xs">
        {extension.required ? "Required" : "Used"}
      </Badge>
    </div>
  )
}

// %%%%%LAST%%%%%