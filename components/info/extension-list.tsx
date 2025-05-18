import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown, ChevronRight, Package, ShieldCheck, Building, User, Zap, Code } from "lucide-react"
import { GLTFExtension, extractExtensionsFromModel, groupExtensionsByCategory, EXTENSION_CATEGORIES } from "@/lib/extension-utils"
import { ExtensionItem } from "./extension-item"
import { ExtensionDetails } from "./extension-details"

interface ExtensionListProps {
  extensions?: GLTFExtension[]
  modelData?: any
}

const CATEGORY_ICONS = {
  official: ShieldCheck,
  vendor: Building,
  vrm: User,
  experimental: Zap,
  unofficial: Code
}

export function ExtensionList({ extensions, modelData }: ExtensionListProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['official', 'vrm']))
  
  // Extract extensions from modelData if not provided
  const extractedExtensions = useMemo(() => {
    return extensions || extractExtensionsFromModel(modelData)
  }, [extensions, modelData])

  const groupedExtensions = useMemo(() => {
    return groupExtensionsByCategory(extractedExtensions)
  }, [extractedExtensions])
  
  const requiredExtensions = useMemo(() => {
    return extractedExtensions.filter(ext => ext.required)
  }, [extractedExtensions])

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(category)) {
      newExpanded.delete(category)
    } else {
      newExpanded.add(category)
    }
    setExpandedCategories(newExpanded)
  }
  
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

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Package className="w-4 h-4" />
          Extensions ({extractedExtensions.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Required Extensions Section */}
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

        {/* Category-based Extensions */}
        {Object.entries(groupedExtensions).map(([category, categoryExtensions]) => {
          if (categoryExtensions.length === 0) return null
          
          const categoryInfo = EXTENSION_CATEGORIES[category as keyof typeof EXTENSION_CATEGORIES]
          const IconComponent = CATEGORY_ICONS[category as keyof typeof CATEGORY_ICONS]
          const isExpanded = expandedCategories.has(category)
          
          return (
            <div key={category} className="space-y-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleCategory(category)}
                className="w-full justify-between p-2 h-auto"
              >
                <div className="flex items-center gap-2">
                  <IconComponent className="w-3 h-3" />
                  <span className="text-xs font-medium">{categoryInfo.name}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded ${categoryInfo.color}`}>
                    {categoryExtensions.length}
                  </span>
                </div>
                {isExpanded ? (
                  <ChevronDown className="w-3 h-3" />
                ) : (
                  <ChevronRight className="w-3 h-3" />
                )}
              </Button>
              
              {isExpanded && (
                <div className="space-y-1 ml-4">
                  {categoryExtensions.map((extension) => (
                    <ExtensionItem key={extension.name} extension={extension} />
                  ))}
                </div>
              )}
            </div>
          )
        })}

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