// glTF Extension definitions and utilities
export interface GLTFExtension {
  name: string
  required: boolean
  supported: boolean
  description?: string
  documentation?: string
  category?: ExtensionCategory
  level?: ExtensionLevel
}

export type ExtensionCategory = 'official' | 'vendor' | 'vrm' | 'experimental' | 'unofficial'
export type ExtensionLevel = 'stable' | 'draft' | 'deprecated'

export interface ExtensionCategoryInfo {
  name: string
  description: string
  color: string
  icon: string
}

// Extension category definitions
export const EXTENSION_CATEGORIES: Record<ExtensionCategory, ExtensionCategoryInfo> = {
  official: {
    name: "Official Standards",
    description: "Khronos Group official glTF 2.0 extensions",
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    icon: "shield-check"
  },
  vendor: {
    name: "Vendor Extensions", 
    description: "Extensions by specific vendors (Microsoft, Adobe, etc.)",
    color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    icon: "building"
  },
  vrm: {
    name: "VRM Format",
    description: "Virtual Reality Model format extensions",
    color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300", 
    icon: "user"
  },
  experimental: {
    name: "Experimental",
    description: "Draft or experimental extensions",
    color: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
    icon: "zap"
  },
  unofficial: {
    name: "Unofficial/Custom",
    description: "Custom or community-developed extensions",
    color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
    icon: "code"
  }
}

// Extension level definitions
export const EXTENSION_LEVELS: Record<ExtensionLevel, { name: string; color: string }> = {
  stable: { 
    name: "Stable", 
    color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" 
  },
  draft: { 
    name: "Draft", 
    color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300" 
  },
  deprecated: { 
    name: "Deprecated", 
    color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300" 
  }
}

// Common glTF Extensions Database
export const EXTENSION_DATABASE: Record<string, { 
  description: string
  documentation: string
  category?: ExtensionCategory
  level?: ExtensionLevel
}> = {
  "KHR_materials_pbrSpecularGlossiness": {
    description: "Defines a specular-glossiness material model",
    documentation: "https://github.com/KhronosGroup/glTF/tree/main/extensions/2.0/Khronos/KHR_materials_pbrSpecularGlossiness",
    category: "official",
    level: "stable"
  },
  "KHR_materials_unlit": {
    description: "Defines an unlit shading model",
    documentation: "https://github.com/KhronosGroup/glTF/tree/main/extensions/2.0/Khronos/KHR_materials_unlit",
    category: "official",
    level: "stable"
  },
  "KHR_draco_mesh_compression": {
    description: "Compressed mesh geometry using Google Draco",
    documentation: "https://github.com/KhronosGroup/glTF/tree/main/extensions/2.0/Khronos/KHR_draco_mesh_compression",
    category: "official",
    level: "stable"
  },
  "KHR_texture_transform": {
    description: "UV coordinate transformation for textures",
    documentation: "https://github.com/KhronosGroup/glTF/tree/main/extensions/2.0/Khronos/KHR_texture_transform",
    category: "official",
    level: "stable"
  },
  "EXT_texture_webp": {
    description: "WebP texture format support",
    documentation: "https://github.com/KhronosGroup/glTF/tree/main/extensions/2.0/Vendor/EXT_texture_webp",
    category: "vendor",
    level: "stable"
  },

  "KHR_materials_clearcoat": {
    description: "Clearcoat material layer for automotive paint",
    documentation: "https://github.com/KhronosGroup/glTF/tree/main/extensions/2.0/Khronos/KHR_materials_clearcoat",
    category: "official",
    level: "stable"
  },
  "KHR_materials_transmission": {
    description: "Transmission for thin translucent materials",
    documentation: "https://github.com/KhronosGroup/glTF/tree/main/extensions/2.0/Khronos/KHR_materials_transmission",
    category: "official",
    level: "stable"
  },
  "KHR_lights_punctual": {
    description: "Point, directional and spot lights",
    documentation: "https://github.com/KhronosGroup/glTF/tree/main/extensions/2.0/Khronos/KHR_lights_punctual",
    category: "official",
    level: "stable"
  },
  "MSFT_texture_dds": {
    description: "DirectDraw Surface texture format",
    documentation: "https://github.com/KhronosGroup/glTF/tree/main/extensions/2.0/Vendor/MSFT_texture_dds",
    category: "vendor",
    level: "stable"
  },
  "KHR_materials_volume": {
    description: "Volume rendering for thick translucent materials",
    documentation: "https://github.com/KhronosGroup/glTF/tree/main/extensions/2.0/Khronos/KHR_materials_volume",
    category: "official",
    level: "stable"
  },

  // VRM Extensions
  "VRM": {
    description: "Virtual Reality Model format for 3D avatars",
    documentation: "https://vrm.dev/en/specification/",
    category: "vrm",
    level: "stable"
  },
  "VRM_0_0": {
    description: "VRM 0.0 specification for humanoid 3D avatars",
    documentation: "https://vrm.dev/en/specification/0.0/",
    category: "vrm",
    level: "deprecated"
  },
  "VRMC_vrm": {
    description: "VRM 1.0 core specification",
    documentation: "https://github.com/vrm-c/vrm-specification/tree/master/specification/VRMC_vrm-1.0",
    category: "vrm",
    level: "stable"
  },
  "VRMC_node_constraint": {
    description: "VRM 1.0 node constraint extension",
    documentation: "https://github.com/vrm-c/vrm-specification/tree/master/specification/VRMC_node_constraint-1.0",
    category: "vrm",
    level: "stable"
  },
  "VRMC_materials_mtoon": {
    description: "VRM 1.0 MToon shader material",
    documentation: "https://github.com/vrm-c/vrm-specification/tree/master/specification/VRMC_materials_mtoon-1.0",
    category: "vrm",
    level: "stable"
  },
  "VRMC_springBone": {
    description: "VRM 1.0 spring bone physics simulation",
    documentation: "https://github.com/vrm-c/vrm-specification/tree/master/specification/VRMC_springBone-1.0",
    category: "vrm",
    level: "stable"
  },
  "VRMC_vrm_animation": {
    description: "VRM 1.0 animation extension",
    documentation: "https://github.com/vrm-c/vrm-specification/tree/master/specification/VRMC_vrm_animation-1.0",
    category: "vrm",
    level: "stable"
  }
}

// Categorize extension by name pattern
export function categorizeExtension(name: string): { category: ExtensionCategory; level: ExtensionLevel } {
  // Check database first
  const dbEntry = EXTENSION_DATABASE[name]
  if (dbEntry?.category && dbEntry?.level) {
    return { category: dbEntry.category, level: dbEntry.level }
  }
  
  // Pattern-based categorization
  if (name.startsWith('KHR_')) {
    // Check for experimental KHR extensions
    const experimental = ['KHR_materials_variants', 'KHR_materials_ior', 'KHR_materials_specular']
    if (experimental.includes(name)) {
      return { category: 'experimental', level: 'draft' }
    }
    return { category: 'official', level: 'stable' }
  }
  
  if (name.startsWith('EXT_') || name.startsWith('MSFT_') || name.startsWith('ADOBE_') || 
      name.startsWith('AGI_') || name.startsWith('CESIUM_') || name.startsWith('FB_')) {
    return { category: 'vendor', level: 'stable' }
  }
  
  if (name.startsWith('VRMC_') || name === 'VRM' || name.startsWith('VRM_')) {
    // VRM 0.x is deprecated
    if (name.startsWith('VRM_0') || name === 'VRM') {
      return { category: 'vrm', level: name === 'VRM' ? 'stable' : 'deprecated' }
    }
    return { category: 'vrm', level: 'stable' }
  }
  
  // Everything else is unofficial/custom
  return { category: 'unofficial', level: 'stable' }
}

export function extractExtensionsFromModel(modelData: any): GLTFExtension[] {
  if (!modelData) return []

  // Only log in development mode and not too frequently
  if (process.env.NODE_ENV === 'development') {
    console.log('Extracting extensions from model data:', modelData)
  }

  const extensions: GLTFExtension[] = []
  const foundExtensions = new Set<string>()

  // Check extensionsUsed
  if (modelData.extensionsUsed && Array.isArray(modelData.extensionsUsed)) {
    if (process.env.NODE_ENV === 'development') {
      console.log('Found extensionsUsed:', modelData.extensionsUsed)
    }
    modelData.extensionsUsed.forEach((name: string) => {
      if (!foundExtensions.has(name)) {
        const { category, level } = categorizeExtension(name)
        extensions.push({
          name,
          required: false,
          supported: true, // Assume supported if loaded successfully
          description: EXTENSION_DATABASE[name]?.description || `Extension: ${name}`,
          documentation: EXTENSION_DATABASE[name]?.documentation || `https://github.com/search?q=${encodeURIComponent(name)}`,
          category,
          level
        })
        foundExtensions.add(name)
      }
    })
  }

  // Check extensionsRequired
  if (modelData.extensionsRequired && Array.isArray(modelData.extensionsRequired)) {
    if (process.env.NODE_ENV === 'development') {
      console.log('Found extensionsRequired:', modelData.extensionsRequired)
    }
    modelData.extensionsRequired.forEach((name: string) => {
      if (!foundExtensions.has(name)) {
        const { category, level } = categorizeExtension(name)
        extensions.push({
          name,
          required: true,
          supported: true, // Must be supported if model loaded
          description: EXTENSION_DATABASE[name]?.description || `Required Extension: ${name}`,
          documentation: EXTENSION_DATABASE[name]?.documentation || `https://github.com/search?q=${encodeURIComponent(name)}`,
          category,
          level
        })
        foundExtensions.add(name)
      } else {
        // Update existing extension to mark as required
        const existing = extensions.find(ext => ext.name === name)
        if (existing) existing.required = true
      }
    })
  }

  // Also check for extensions in the extensions object directly
  if (modelData.extensions && typeof modelData.extensions === 'object') {
    if (process.env.NODE_ENV === 'development') {
      console.log('Found extensions object:', Object.keys(modelData.extensions))
    }
    Object.keys(modelData.extensions).forEach((name: string) => {
      if (!foundExtensions.has(name)) {
        const { category, level } = categorizeExtension(name)
        extensions.push({
          name,
          required: false,
          supported: true,
          description: EXTENSION_DATABASE[name]?.description || `Extension: ${name}`,
          documentation: EXTENSION_DATABASE[name]?.documentation || `https://github.com/search?q=${encodeURIComponent(name)}`,
          category,
          level
        })
        foundExtensions.add(name)
      }
    })
  }

  if (process.env.NODE_ENV === 'development') {
    console.log('Final extracted extensions:', extensions)
  }

  return extensions.sort((a, b) => {
    // Required extensions first, then alphabetical
    if (a.required && !b.required) return -1
    if (!a.required && b.required) return 1
    return a.name.localeCompare(b.name)
  })
}

// Group extensions by category
export function groupExtensionsByCategory(extensions: GLTFExtension[]): Record<ExtensionCategory, GLTFExtension[]> {
  const groups: Record<ExtensionCategory, GLTFExtension[]> = {
    official: [],
    vendor: [],
    vrm: [],
    experimental: [],
    unofficial: []
  }
  
  extensions.forEach(ext => {
    if (ext.category) {
      groups[ext.category].push(ext)
    } else {
      // Fallback categorization
      const { category } = categorizeExtension(ext.name)
      groups[category].push({ ...ext, category })
    }
  })
  
  return groups
}

// %%%%%LAST%%%%%