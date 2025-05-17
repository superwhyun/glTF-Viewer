import { TextureInfo } from "@/lib/material-utils"

interface TextureDetailsProps {
  texture: TextureInfo | null
}

export function TextureDetails({ texture }: TextureDetailsProps) {
  if (!texture) {
    return (
      <div className="p-4 border rounded-lg bg-card">
        <h3 className="text-lg font-semibold mb-3">Texture Details</h3>
        <p className="text-muted-foreground text-sm">Select a texture to view details</p>
      </div>
    )
  }

  const formatBoolean = (value: boolean): string => value ? 'Yes' : 'No'

  return (
    <div className="p-4 border rounded-lg bg-card">
      <h3 className="text-lg font-semibold mb-3">Texture Details</h3>
      
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Name:</span>
          <span className="font-medium">{texture.name}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-muted-foreground">Type:</span>
          <span className="font-medium">{texture.mapTypeLabel}</span>
        </div>
        
        {texture.width && texture.height && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Dimensions:</span>
            <span className="font-medium">{texture.width} × {texture.height}</span>
          </div>
        )}
        
        <div className="flex justify-between">
          <span className="text-muted-foreground">Format:</span>
          <span className="font-medium">{texture.format}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-muted-foreground">Data Type:</span>
          <span className="font-medium">{texture.type}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-muted-foreground">Wrap S:</span>
          <span className="font-medium">{texture.wrapS}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-muted-foreground">Wrap T:</span>
          <span className="font-medium">{texture.wrapT}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-muted-foreground">Mag Filter:</span>
          <span className="font-medium">{texture.magFilter}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-muted-foreground">Min Filter:</span>
          <span className="font-medium">{texture.minFilter}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-muted-foreground">Flip Y:</span>
          <span className="font-medium">{formatBoolean(texture.flipY)}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-muted-foreground">Generate Mipmaps:</span>
          <span className="font-medium">{formatBoolean(texture.generateMipmaps)}</span>
        </div>
        
        {texture.url && (
          <div className="mt-3">
            <span className="text-muted-foreground text-xs">Source:</span>
            <p className="text-xs font-mono break-all mt-1 p-2 bg-muted rounded">
              {texture.url}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

// %%%%%LAST%%%%%