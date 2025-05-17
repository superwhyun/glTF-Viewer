import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown, ChevronRight, Package } from "lucide-react"
import { GLTFExtension, extractExtensionsFromModel } from "@/lib/extension-utils"
import { ExtensionItem } from "./extension-item"
import { ExtensionDetails } from "./extension-details"

interface ExtensionListProps {
  extensions?: GLTFExtension[]
  modelData?: any
}

export function ExtensionList({ extensions, modelData }: ExtensionListProps) {
  const [isOpen, setIsOpen] = useState(false)
  
  // Extract extensions from modelData if not provided
  const extractedExtensions = extensions || extractExtensionsFromModel(modelData)
  
  if (!extractedExtensions || extractedExtensions.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Package className="w-4 h-4" />
            Extensions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No extensions found</p>
        </CardContent>
      </Card>
    )
  }

  const requiredExtensions = extractedExtensions.filter(ext => ext.required)
  const usedExtensions = extractedExtensions.filter(ext => !ext.required)

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Package className="w-4 h-4" />
          Extensions ({extractedExtensions.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Required Extensions */}
        {requiredExtensions.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-red-600 dark:text-red-400">
              Required ({requiredExtensions.length})
            </h4>
            {requiredExtensions.map((extension) => (
              <ExtensionItem key={extension.name} extension={extension} />
            ))}
          </div>
        )}

        {/* Used Extensions */}
        {usedExtensions.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-blue-600 dark:text-blue-400">
              Used ({usedExtensions.length})
            </h4>
            {usedExtensions.map((extension) => (
              <ExtensionItem key={extension.name} extension={extension} />
            ))}
          </div>
        )}

        {/* Expand/Collapse for details */}
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="w-full justify-between">
              <span className="text-xs">Extension Details</span>
              {isOpen ? (
                <ChevronDown className="w-3 h-3" />
              ) : (
                <ChevronRight className="w-3 h-3" />
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-2 mt-2">
            {extractedExtensions.map((extension) => (
              <ExtensionDetails key={`${extension.name}-details`} extension={extension} />
            ))}
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  )
}

// %%%%%LAST%%%%%