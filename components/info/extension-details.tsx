import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { GLTFExtension, EXTENSION_DATABASE } from "@/lib/extension-utils"

interface ExtensionDetailsProps {
  extension: GLTFExtension
}

export function ExtensionDetails({ extension }: ExtensionDetailsProps) {
  const info = EXTENSION_DATABASE[extension.name]
  
  return (
    <div className="p-2 rounded border bg-muted/20 space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono font-medium">{extension.name}</span>
        <Badge variant={extension.supported ? "default" : "secondary"} className="text-xs">
          {extension.supported ? "Supported" : "Unsupported"}
        </Badge>
      </div>
      {info && (
        <>
          <p className="text-xs text-muted-foreground">{info.description}</p>
          <Button
            variant="link"
            size="sm"
            className="h-auto p-0 text-xs"
            onClick={() => window.open(info.documentation, '_blank')}
          >
            View Documentation
          </Button>
        </>
      )}
    </div>
  )
}

// %%%%%LAST%%%%%