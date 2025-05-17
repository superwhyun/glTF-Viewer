// glTF Extension definitions and utilities
export interface GLTFExtension {
  name: string
  required: boolean
  supported: boolean
  description?: string
  documentation?: string
}

// Common glTF Extensions Database
export const EXTENSION_DATABASE: Record<string, { description: string; documentation: string }> = {
  "KHR_materials_pbrSpecularGlossiness": {
    description: "Defines a specular-glossiness material model",
    documentation: "https://github.com/KhronosGroup/glTF/tree/main/extensions/2.0/Khronos/KHR_materials_pbrSpecularGlossiness"
  },
  "KHR_materials_unlit": {
    description: "Defines an unlit shading model",
    documentation: "https://github.com/KhronosGroup/glTF/tree/main/extensions/2.0/Khronos/KHR_materials_unlit"
  },
  "KHR_draco_mesh_compression": {
    description: "Compressed mesh geometry using Google Draco",
    documentation: "https://github.com/KhronosGroup/glTF/tree/main/extensions/2.0/Khronos/KHR_draco_mesh_compression"
  },
  "KHR_texture_transform": {
    description: "UV coordinate transformation for textures",
    documentation: "https://github.com/KhronosGroup/glTF/tree/main/extensions/2.0/Khronos/KHR_texture_transform"
  },
  "EXT_texture_webp": {
    description: "WebP texture format support",
    documentation: "https://github.com/KhronosGroup/glTF/tree/main/extensions/2.0/Vendor/EXT_texture_webp"
  },
  "KHR_materials_clearcoat": {
    description: "Clearcoat material layer for automotive paint",
    documentation: "https://github.com/KhronosGroup/glTF/tree/main/extensions/2.0/Khronos/KHR_materials_clearcoat"
  },
  "KHR_materials_transmission": {
    description: "Transmission for thin translucent materials",
    documentation: "https://github.com/KhronosGroup/glTF/tree/main/extensions/2.0/Khronos/KHR_materials_transmission"
  },
  "KHR_lights_punctual": {
    description: "Point, directional and spot lights",
    documentation: "https://github.com/KhronosGroup/glTF/tree/main/extensions/2.0/Khronos/KHR_lights_punctual"
  },
  "MSFT_texture_dds": {
    description: "DirectDraw Surface texture format",
    documentation: "https://github.com/KhronosGroup/glTF/tree/main/extensions/2.0/Vendor/MSFT_texture_dds"
  },
  "KHR_materials_volume": {
    description: "Volume rendering for thick translucent materials",
    documentation: "https://github.com/KhronosGroup/glTF/tree/main/extensions/2.0/Khronos/KHR_materials_volume"
  }
}

export function extractExtensionsFromModel(modelData: any): GLTFExtension[] {
  if (!modelData) return []

  const extensions: GLTFExtension[] = []
  const foundExtensions = new Set<string>()

  // Check extensionsUsed
  if (modelData.extensionsUsed && Array.isArray(modelData.extensionsUsed)) {
    modelData.extensionsUsed.forEach((name: string) => {
      if (!foundExtensions.has(name)) {
        extensions.push({
          name,
          required: false,
          supported: true, // Assume supported if loaded successfully
          description: EXTENSION_DATABASE[name]?.description,
          documentation: EXTENSION_DATABASE[name]?.documentation
        })
        foundExtensions.add(name)
      }
    })
  }

  // Check extensionsRequired
  if (modelData.extensionsRequired && Array.isArray(modelData.extensionsRequired)) {
    modelData.extensionsRequired.forEach((name: string) => {
      if (!foundExtensions.has(name)) {
        extensions.push({
          name,
          required: true,
          supported: true, // Must be supported if model loaded
          description: EXTENSION_DATABASE[name]?.description,
          documentation: EXTENSION_DATABASE[name]?.documentation
        })
        foundExtensions.add(name)
      } else {
        // Update existing extension to mark as required
        const existing = extensions.find(ext => ext.name === name)
        if (existing) existing.required = true
      }
    })
  }

  return extensions.sort((a, b) => {
    // Required extensions first, then alphabetical
    if (a.required && !b.required) return -1
    if (!a.required && b.required) return 1
    return a.name.localeCompare(b.name)
  })
}

// %%%%%LAST%%%%%